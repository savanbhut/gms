import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Activity, Users, FileText, TrendingUp, AlertCircle, Wrench, Car, Download, Filter, RefreshCw } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function Reports() {
  const { toast } = useToast();
  const reportRef = useRef<HTMLDivElement>(null);

  // Filter state
  const [dateShortcut, setDateShortcut] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [reportType, setReportType] = useState<string[]>(['financial', 'services', 'customers']);

  // Filter options
  const [allCustomers, setAllCustomers] = useState<any[]>([]);
  const [allServices, setAllServices] = useState<any[]>([]);

  // Report data
  const [financialData, setFinancialData] = useState<any>(null);
  const [serviceData, setServiceData] = useState<any>(null);
  const [customerData, setCustomerData] = useState<any>(null);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:5000/api/customers').then(r => r.json()),
      fetch('http://localhost:5000/api/services').then(r => r.json()),
    ]).then(([c, s]) => {
      setAllCustomers(c || []);
      setAllServices(s || []);
    });
  }, []);

  const handleDateShortcut = (value: string) => {
    setDateShortcut(value);
    const toLocal = (d: Date) => {
      const offset = d.getTimezoneOffset() * 60000;
      return new Date(d.getTime() - offset).toISOString().split('T')[0];
    };
    if (value === 'all') { setStartDate(''); setEndDate(''); }
    else if (value === 'today') { const t = toLocal(new Date()); setStartDate(t); setEndDate(t); }
    else if (value === 'week') {
      const today = new Date();
      const first = new Date(); first.setDate(today.getDate() - today.getDay());
      const last = new Date(); last.setDate(today.getDate() - today.getDay() + 6);
      setStartDate(toLocal(first)); setEndDate(toLocal(last));
    } else if (value === 'month') {
      const today = new Date();
      setStartDate(toLocal(new Date(today.getFullYear(), today.getMonth(), 1)));
      setEndDate(toLocal(new Date(today.getFullYear(), today.getMonth() + 1, 0)));
    }
  };

  const toggleReportType = (type: string) => {
    setReportType(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleGenerateReport = async () => {
    if (reportType.length === 0) {
      toast({ title: 'Select at least one report type', variant: 'destructive' });
      return;
    }
    setGenerating(true);
    setReportGenerated(false);
    try {
      const params: string[] = [];
      if (startDate) params.push(`startDate=${startDate}`);
      if (endDate) params.push(`endDate=${endDate}`);
      if (customerFilter) params.push(`customerName=${customerFilter}`);
      if (serviceFilter) params.push(`serviceName=${serviceFilter}`);
      const qs = params.length > 0 ? `?${params.join('&')}` : '';

      const fetches = [];
      if (reportType.includes('financial')) fetches.push(fetch(`http://localhost:5000/api/reports/financial${qs}`).then(r => r.json()));
      else fetches.push(Promise.resolve(null));
      if (reportType.includes('services')) fetches.push(fetch(`http://localhost:5000/api/reports/services${qs}`).then(r => r.json()));
      else fetches.push(Promise.resolve(null));
      if (reportType.includes('customers')) fetches.push(fetch(`http://localhost:5000/api/reports/customers${qs}`).then(r => r.json()));
      else fetches.push(Promise.resolve(null));

      const [fin, serv, cust] = await Promise.all(fetches);
      if (fin?.success) setFinancialData(fin); else setFinancialData(null);
      if (serv?.success) setServiceData(serv); else setServiceData(null);
      if (cust?.success) setCustomerData(cust); else setCustomerData(null);

      setReportGenerated(true);
      toast({ title: 'Report generated!', description: 'Scroll down to view the report.' });
    } catch (err) {
      toast({ title: 'Error', description: 'Could not fetch report data.', variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    toast({ title: 'Generating PDF...', description: 'Please wait a moment.' });

    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      // ── Step 1: Lock container to exact capture width ───────────────────────
      // This ensures Tailwind responsive grids and Recharts ResponsiveContainer
      // all render at the correct width before html2canvas takes the snapshot.
      const reportEl = reportRef.current;
      const origStyle = { width: reportEl.style.width, maxWidth: reportEl.style.maxWidth, overflowX: reportEl.style.overflowX };
      reportEl.style.width = '1100px';
      reportEl.style.maxWidth = '1100px';
      reportEl.style.overflowX = 'hidden';

      // Give the DOM time to reflow and charts to finish re-painting
      await new Promise(resolve => setTimeout(resolve, 400));

      // ── Step 2: Capture ─────────────────────────────────────────────────────
      const canvas = await html2canvas(reportEl, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1100,
      });

      // ── Step 3: Restore original container styles ────────────────────────────
      reportEl.style.width = origStyle.width;
      reportEl.style.maxWidth = origStyle.maxWidth;
      reportEl.style.overflowX = origStyle.overflowX;

      // A4 portrait page dimensions
      const pdf = new jsPDF({ unit: 'in', format: 'a4', orientation: 'portrait' });
      const pw = pdf.internal.pageSize.getWidth();   // 8.27in
      const ph = pdf.internal.pageSize.getHeight();  // 11.69in
      const mx = 0.4;
      const headerH = 0.92;
      const footerH = 0.44;
      const contentH = ph - headerH - footerH;

      const contentW = pw - mx * 2;  // 8.27 - 0.8 = 7.47in

      // canvas.width (at scale:2) maps to contentW (the locked 1100px container)
      const pxPerIn = canvas.width / contentW;
      const pxPerPage = contentH * pxPerIn;
      const totalPages = Math.ceil(canvas.height / pxPerPage);

      // DOM-based page cuts:
      // 1. "Forced" cuts = section elements (Services/Customers start here — must NOT be orphaned)
      // 2. "Soft" cuts = top of each card / h3 separator
      const cutPoints: number[] = [0];
      (() => {
        const containerRect = reportRef.current!.getBoundingClientRect();
        const toCanvas = (el: Element) =>
          Math.round((el.getBoundingClientRect().top - containerRect.top) * 2);

        // Forced: section boundaries (pageBreakBefore:always in JSX)
        const forcedCuts = Array.from(
          reportRef.current!.querySelectorAll('section')
        ).map(toCanvas).filter(y => y > 0).sort((a, b) => a - b);

        // Soft: top of every card / h3 element
        const softCuts = Array.from(
          reportRef.current!.querySelectorAll('.shadow-md, .shadow-sm, h3')
        ).map(toCanvas).filter(y => y > 0).sort((a, b) => a - b);

        for (let p = 1; p < totalPages; p++) {
          const target = Math.round(p * pxPerPage);
          const lastCut = cutPoints[cutPoints.length - 1];

          // Snap to forced section boundary within ±150px of target
          const forced = forcedCuts.find(y => Math.abs(y - target) <= 150 && y > lastCut);
          if (forced) { cutPoints.push(forced); continue; }

          // Otherwise: highest soft cut that fits on this page (below lastCut, above target)
          const soft = [...softCuts].reverse().find(y => y < target && y > lastCut);
          cutPoints.push(soft ?? target);
        }
      })();

      cutPoints.push(canvas.height);

      const drawHeaderFooter = (pageNum: number, total: number) => {
        pdf.setFillColor(249, 115, 22);
        pdf.rect(0, 0, pw, 0.07, 'F');
        pdf.setFontSize(22); pdf.setTextColor(249, 115, 22); pdf.setFont('helvetica', 'bold');
        pdf.text('GMS', mx, 0.44);
        pdf.setFontSize(8); pdf.setTextColor(100, 116, 139); pdf.setFont('helvetica', 'normal');
        pdf.text('Garage Management System', mx, 0.60);
        pdf.setFontSize(9.5); pdf.setTextColor(234, 88, 12); pdf.setFont('helvetica', 'bold');
        pdf.text('SYSTEM REPORT', pw - mx, 0.44, { align: 'right' });
        pdf.setFontSize(8); pdf.setTextColor(100, 116, 139); pdf.setFont('helvetica', 'normal');
        pdf.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, pw - mx, 0.60, { align: 'right' });
        pdf.setDrawColor(249, 115, 22); pdf.setLineWidth(0.02);
        pdf.line(mx, 0.73, pw - mx, 0.73);
        pdf.setDrawColor(226, 232, 240); pdf.setLineWidth(0.01);
        pdf.line(mx, 0.77, pw - mx, 0.77);
        pdf.setDrawColor(226, 232, 240);
        pdf.line(mx, ph - 0.32, pw - mx, ph - 0.32);
        pdf.setFontSize(8); pdf.setTextColor(156, 163, 175);
        pdf.text(`© ${new Date().getFullYear()} GMS. Confidential Report.`, mx, ph - 0.16);
        pdf.text(`Page ${pageNum} of ${total}`, pw - mx, ph - 0.16, { align: 'right' });
      };

      const actualPages = cutPoints.length - 1;
      for (let page = 0; page < actualPages; page++) {
        if (page > 0) pdf.addPage();
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, pw, ph, 'F');
        drawHeaderFooter(page + 1, actualPages);

        const srcY = cutPoints[page];
        const srcH = cutPoints[page + 1] - srcY;
        if (srcH <= 0) continue;

        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = srcH;
        const ctx = pageCanvas.getContext('2d')!;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        ctx.drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH);

        // Place image with mx margins on both sides (matches header/footer alignment)
        const sliceH = (srcH / canvas.width) * contentW;
        pdf.addImage(pageCanvas.toDataURL('image/jpeg', 0.97), 'JPEG', mx, headerH, contentW, Math.min(sliceH, contentH));
      }


      pdf.save(`GMS_Report_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.pdf`);
      toast({ title: 'PDF Exported!', description: 'Report downloaded successfully.' });
    } catch (err) {
      console.error('PDF export error:', err);
      toast({ title: 'Export failed', description: 'Could not generate PDF.', variant: 'destructive' });
    }
  };


  const formatCurrency = (amount: number) =>
    '₹' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(amount || 0);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const reportTypeOptions = [
    { key: 'financial', label: 'Financial & Revenue', icon: <span className="text-sm font-bold">₹</span>, color: 'bg-green-100 text-green-700 border-green-300' },
    { key: 'services', label: 'Service Performance', icon: <Wrench className="w-4 h-4" />, color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { key: 'customers', label: 'Customer Insights', icon: <Users className="w-4 h-4" />, color: 'bg-purple-100 text-purple-700 border-purple-300' },
  ];

  return (
    <DashboardLayout title="Reports">
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in pb-24">

        {/* Page Header */}
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Reports
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
            Configure filters and generate a report
          </p>
        </div>

        {/* Filter Panel */}
        <Card className="shadow-md border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="bg-gray-50 dark:bg-gray-900/30 rounded-t-xl border-b border-gray-200 dark:border-gray-700 pb-4">
            <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
              <Filter className="w-5 h-5 text-primary" />
              Report Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">

            {/* Report Type Toggles */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">Report Type</label>
              <div className="flex flex-wrap gap-3">
                {reportTypeOptions.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => toggleReportType(opt.key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                      reportType.includes(opt.key)
                        ? opt.color + ' shadow-sm'
                        : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {opt.icon}
                    {opt.label}
                    {reportType.includes(opt.key) && <span className="text-xs ml-1">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Date + Customer + Service filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Date Shortcut */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Date Range</label>
                <select
                  value={dateShortcut}
                  onChange={e => handleDateShortcut(e.target.value)}
                  className="w-full bg-white dark:bg-gray-800 p-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm outline-none text-gray-700 dark:text-gray-300 cursor-pointer focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {/* Custom dates */}
              {dateShortcut === 'custom' && (
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Custom Dates</label>
                  <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                      className="bg-transparent border-none text-sm outline-none text-gray-700 dark:text-gray-300 cursor-pointer" />
                    <span className="text-gray-400 text-sm">to</span>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                      className="bg-transparent border-none text-sm outline-none text-gray-700 dark:text-gray-300 cursor-pointer" />
                  </div>
                </div>
              )}

              {/* Customer Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Customer</label>
                <select
                  value={customerFilter}
                  onChange={e => setCustomerFilter(e.target.value)}
                  className="w-full bg-white dark:bg-gray-800 p-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm outline-none text-gray-700 dark:text-gray-300 cursor-pointer focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">All Customers</option>
                  {allCustomers.map((c: any) => (
                    <option key={c.cid} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Service Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Service</label>
                <select
                  value={serviceFilter}
                  onChange={e => setServiceFilter(e.target.value)}
                  className="w-full bg-white dark:bg-gray-800 p-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm outline-none text-gray-700 dark:text-gray-300 cursor-pointer focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">All Services</option>
                  {allServices.map((s: any) => (
                    <option key={s.sid} value={s.service_name}>{s.service_name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={handleGenerateReport}
                disabled={generating}
                className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg font-semibold text-sm shadow hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                {generating ? 'Generating...' : 'Generate Report'}
              </button>

              {reportGenerated && (
                <button
                  onClick={handleExportPDF}
                  className="flex items-center gap-2 bg-white dark:bg-gray-800 text-primary border-2 border-primary px-6 py-2.5 rounded-lg font-semibold text-sm shadow hover:bg-primary/5 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export PDF
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Generated Report Output */}
        {reportGenerated && (
          <div ref={reportRef} className="space-y-8">

            {/* Report Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-primary/10 to-primary/5 p-5 rounded-2xl border border-primary/20">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Generated Report</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {startDate && endDate ? `${formatDate(startDate)} – ${formatDate(endDate)}` : 'All Time'}
                  {customerFilter && ` · Customer: ${customerFilter}`}
                  {serviceFilter && ` · Service: ${serviceFilter}`}
                </p>
              </div>
              <span className="text-xs text-gray-400">{new Date().toLocaleString('en-IN')}</span>
            </div>

            {/* === FINANCIAL SECTION === */}
            {reportType.includes('financial') && financialData && (
              <section className="space-y-6">
                <h3 className="text-xl font-bold text-green-700 dark:text-green-400 flex items-center gap-2 border-b border-green-100 pb-2">
                  Financial & Revenue
                </h3>

                {/* Summary cards */}
                {(() => {
                  const totalBookings = financialData.totalBookings || 0;
                  const aov = totalBookings > 0 ? financialData.totalRevenue / totalBookings : 0;
                  const prevRev = financialData.previousRevenue;
                  const growthRate = prevRev != null && prevRev > 0
                    ? (((financialData.totalRevenue - prevRev) / prevRev) * 100).toFixed(1)
                    : null;
                  const growthPositive = growthRate !== null && Number(growthRate) >= 0;

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Total Revenue */}
                      <Card className="shadow-sm border border-green-100 bg-green-50 dark:bg-green-900/10">
                        <CardContent className="pt-5 pb-4 px-5">
                          <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">Total Revenue</p>
                          <p className="text-3xl font-bold text-green-800">{formatCurrency(financialData.totalRevenue)}</p>
                          {growthRate !== null && (
                            <p className={`text-xs font-semibold mt-2 flex items-center gap-1 ${growthPositive ? 'text-green-600' : 'text-red-500'}`}>
                              <span>{growthPositive ? '▲' : '▼'}</span>
                              <span>{Math.abs(Number(growthRate))}% vs previous period</span>
                            </p>
                          )}
                          {prevRev === 0 && (
                            <p className="text-xs text-gray-400 mt-2">No previous period data</p>
                          )}
                        </CardContent>
                      </Card>

                      {/* Services Rendered */}
                      <Card className="shadow-sm border border-blue-100 bg-blue-50 dark:bg-blue-900/10">
                        <CardContent className="pt-5 pb-4 px-5">
                          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Services Rendered</p>
                          <p className="text-3xl font-bold text-blue-800">
                            {financialData.revenueByService?.reduce((s: number, r: any) => s + r.count, 0) || 0}
                          </p>
                        </CardContent>
                      </Card>

                      {/* Pending Payments */}
                      <Card className="shadow-sm border border-yellow-100 bg-yellow-50 dark:bg-yellow-900/10">
                        <CardContent className="pt-5 pb-4 px-5">
                          <p className="text-xs font-semibold text-yellow-600 uppercase tracking-wide mb-1">Pending Payments</p>
                          <p className="text-3xl font-bold text-yellow-800">{financialData.pendingPayments?.length || 0}</p>
                        </CardContent>
                      </Card>

                      {/* Avg. Revenue per Booking (AOV) */}
                      <Card className="shadow-sm border border-purple-100 bg-purple-50 dark:bg-purple-900/10">
                        <CardContent className="pt-5 pb-4 px-5">
                          <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">Avg. per Booking</p>
                          <p className="text-3xl font-bold text-purple-800">{aov > 0 ? formatCurrency(Math.round(aov)) : '—'}</p>
                          <p className="text-xs text-gray-400 mt-1">from {totalBookings} booking{totalBookings !== 1 ? 's' : ''}</p>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })()}


                {/* Revenue Timeline Chart */}
                {financialData.revenueTimeline?.length > 0 && (
                  <Card className="shadow-md border-0 bg-white/80 dark:bg-gray-800/80" style={{ pageBreakInside: 'avoid' }}>
                    <CardHeader className="bg-primary/5 rounded-t-xl border-b border-primary/10 pb-4">
                      <CardTitle className="text-gray-800 dark:text-gray-100">Revenue Over Time</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                          {financialData.revenueTimeline.length === 1 ? (
                            <BarChart data={financialData.revenueTimeline} margin={{ top: 20, right: 40, left: 20, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={v => formatDate(v)} />
                              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={v => `₹${v}`} />
                              <Tooltip formatter={(v: number) => [formatCurrency(v), 'Revenue']} labelFormatter={l => formatDate(l)} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                              <Bar dataKey="revenue" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={80} isAnimationActive={false} />
                            </BarChart>
                          ) : (
                            <AreaChart data={financialData.revenueTimeline} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                              <defs>
                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={v => formatDate(v)} />
                              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={v => `₹${v}`} />
                              <Tooltip formatter={(v: number) => [formatCurrency(v), 'Revenue']} labelFormatter={l => formatDate(l)} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                              <Area type="monotone" dataKey="revenue" stroke="#10B981" fillOpacity={1} fill="url(#colorRev)" isAnimationActive={false} />
                            </AreaChart>
                          )}
                        </ResponsiveContainer>
                      </div>

                    </CardContent>
                  </Card>
                )}

                {/* Revenue by Vehicle Type Chart */}
                {financialData.revenueByVehicleType?.length > 0 && (
                  <Card className="shadow-md border-0 bg-white/80 dark:bg-gray-800/80" style={{ pageBreakInside: 'avoid' }}>
                    <CardHeader className="bg-blue-50 rounded-t-xl border-b border-blue-100 pb-4">
                      <CardTitle className="text-blue-600">Revenue by Vehicle Type</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart margin={{ top: 30, bottom: 10 }}>
                            <Pie data={financialData.revenueByVehicleType} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="revenue" nameKey="vehicleType" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} isAnimationActive={false}>
                              {financialData.revenueByVehicleType.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie>
                            <Tooltip formatter={(v: number, n: string) => [formatCurrency(v), n]} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Revenue by Service Table */}
                {financialData.revenueByService?.length > 0 && (
                  <Card className="shadow-md border-0 bg-white/80 dark:bg-gray-800/80" style={{ pageBreakInside: 'avoid' }}>
                    <CardHeader className="bg-green-50 rounded-t-xl border-b border-green-100 pb-4">
                      <CardTitle className="text-green-700">Revenue by Service</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr style={{ background: '#f0fdf4' }}>
                              <th className="text-left px-5 py-3 font-semibold text-gray-600 border-b border-gray-200">#</th>
                              <th className="text-left px-5 py-3 font-semibold text-gray-600 border-b border-gray-200">Service Name</th>
                              <th className="text-right px-5 py-3 font-semibold text-gray-600 border-b border-gray-200">Bookings</th>
                              <th className="text-right px-5 py-3 font-semibold text-gray-600 border-b border-gray-200">Total Revenue</th>
                            </tr>
                          </thead>
                          <tbody>
                            {financialData.revenueByService.map((row: any, i: number) => (
                              <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }} className="hover:bg-green-50 transition-colors">
                                <td className="px-5 py-3 text-gray-400 border-b border-gray-100">{i + 1}</td>
                                <td className="px-5 py-3 font-medium text-gray-800 border-b border-gray-100">{row.serviceName}</td>
                                <td className="px-5 py-3 text-right text-gray-600 border-b border-gray-100">{row.count}</td>
                                <td className="px-5 py-3 text-right font-semibold text-green-700 border-b border-gray-100">{formatCurrency(row.totalRevenue)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Pending Payments Table */}
                {financialData.pendingPayments?.length > 0 && (
                  <Card className="shadow-md border-0 bg-white/80 dark:bg-gray-800/80" style={{ pageBreakInside: 'avoid' }}>
                    <CardHeader className="bg-red-50 rounded-t-xl border-b border-red-100 pb-4">
                      <CardTitle className="text-red-600">Pending Payments</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr style={{ background: '#fff1f2' }}>
                              <th className="text-left px-5 py-3 font-semibold text-gray-600 border-b border-gray-200">#</th>
                              <th className="text-left px-5 py-3 font-semibold text-gray-600 border-b border-gray-200">Customer</th>
                              <th className="text-right px-5 py-3 font-semibold text-gray-600 border-b border-gray-200">Amount</th>
                              <th className="text-right px-5 py-3 font-semibold text-gray-600 border-b border-gray-200">Date</th>
                              <th className="text-center px-5 py-3 font-semibold text-gray-600 border-b border-gray-200">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {financialData.pendingPayments.map((row: any, i: number) => (
                              <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }} className="hover:bg-red-50 transition-colors">
                                <td className="px-5 py-3 text-gray-400 border-b border-gray-100">{i + 1}</td>
                                <td className="px-5 py-3 font-medium text-gray-800 border-b border-gray-100">{row.customerName}</td>
                                <td className="px-5 py-3 text-right font-semibold text-gray-800 border-b border-gray-100">{formatCurrency(row.amount)}</td>
                                <td className="px-5 py-3 text-right text-gray-500 border-b border-gray-100">{formatDate(row.date)}</td>
                                <td className="px-5 py-3 text-center border-b border-gray-100">
                                  <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">Pending</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </section>
            )}

            {/* === SERVICES SECTION === */}
            {reportType.includes('services') && serviceData && (
              <section className="space-y-6" style={{ pageBreakBefore: 'always' }}>
                <h3 className="text-xl font-bold text-blue-700 dark:text-blue-400 border-b border-blue-100 pb-2">
                  Service Performance
                </h3>

                <div className="grid grid-cols-1 gap-6">
                  {/* Popular Services Pie */}
                  {serviceData.popularServices?.length > 0 && (
                    <Card className="shadow-md border-0 bg-white/80 dark:bg-gray-800/80" style={{ pageBreakInside: 'avoid' }}>
                      <CardHeader className="bg-blue-50 rounded-t-xl border-b border-blue-100 pb-4">
                        <CardTitle className="text-blue-600">Most Popular Services</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart margin={{ top: 10, bottom: 10 }}>
                              <Pie data={serviceData.popularServices} cx="50%" cy="45%" innerRadius={55} outerRadius={95} paddingAngle={4} dataKey="count" nameKey="serviceName" isAnimationActive={false}>
                                {serviceData.popularServices.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                              </Pie>
                              <Tooltip formatter={(v: number, n: string) => [v, n]} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                              <Legend iconType="circle" iconSize={8} formatter={(value) => <span style={{ fontSize: 11, color: '#374151' }}>{value}</span>} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Vehicle Type Breakdown */}
                  {serviceData.vehicleTypeBreakdown?.length > 0 && (
                    <Card className="shadow-md border-0 bg-white/80 dark:bg-gray-800/80" style={{ pageBreakInside: 'avoid' }}>
                      <CardHeader className="bg-indigo-50 rounded-t-xl border-b border-indigo-100 pb-4">
                        <CardTitle className="text-indigo-600">Vehicle Type Breakdown</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="h-[260px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={serviceData.vehicleTypeBreakdown} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                              <XAxis type="number" axisLine={false} tickLine={false} />
                              <YAxis dataKey="_id" type="category" axisLine={false} tickLine={false} tick={{ fill: '#4F46E5', fontWeight: 500 }} />
                              <Tooltip formatter={(v: number) => [v, 'Services']} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                              <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={36} isAnimationActive={false}>
                                {serviceData.vehicleTypeBreakdown.map((_: any, i: number) => <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />)}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Service Performance Table */}
                {serviceData.popularServices?.length > 0 && (
                  <Card className="shadow-md border-0 bg-white/80 dark:bg-gray-800/80" style={{ pageBreakInside: 'avoid' }}>
                    <CardHeader className="bg-blue-50 rounded-t-xl border-b border-blue-100 pb-4">
                      <CardTitle className="text-blue-700">Service Performance Details</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr style={{ background: '#eff6ff' }}>
                              <th className="text-left px-5 py-3 font-semibold text-gray-600 border-b border-gray-200">#</th>
                              <th className="text-left px-5 py-3 font-semibold text-gray-600 border-b border-gray-200">Service Name</th>
                              <th className="text-left px-5 py-3 font-semibold text-gray-600 border-b border-gray-200">Vehicle Type</th>
                              <th className="text-right px-5 py-3 font-semibold text-gray-600 border-b border-gray-200">Total Bookings</th>
                            </tr>
                          </thead>
                          <tbody>
                            {serviceData.popularServices.map((row: any, i: number) => (
                              <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }} className="hover:bg-blue-50 transition-colors">
                                <td className="px-5 py-3 text-gray-400 border-b border-gray-100">{i + 1}</td>
                                <td className="px-5 py-3 font-medium text-gray-800 border-b border-gray-100">{row.serviceName}</td>
                                <td className="px-5 py-3 text-gray-600 border-b border-gray-100">{row.vehicleType}</td>
                                <td className="px-5 py-3 text-right font-semibold text-blue-700 border-b border-gray-100">{row.count}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </section>
            )}

            {/* === CUSTOMERS SECTION === */}
            {reportType.includes('customers') && customerData && (
              <section className="space-y-6" style={{ pageBreakBefore: 'always' }}>
                <h3 className="text-xl font-bold text-purple-700 dark:text-purple-400 border-b border-purple-100 pb-2">
                  Customer Insights
                </h3>

                {/* Revenue by Customer Bar */}
                {financialData?.revenueByCustomer?.length > 0 && (
                  <Card className="shadow-md border-0 bg-white/80 dark:bg-gray-800/80" style={{ pageBreakInside: 'avoid' }}>
                    <CardHeader className="bg-purple-50 rounded-t-xl border-b border-purple-100 pb-4">
                      <CardTitle className="text-purple-600">Revenue by Customer</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={financialData.revenueByCustomer.slice(0, 10)} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="customerName" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={v => `₹${v}`} />
                            <Tooltip formatter={(v: number) => [formatCurrency(v), 'Revenue']} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Bar dataKey="totalRevenue" fill="#8B5CF6" radius={[4, 4, 0, 0]} maxBarSize={50} isAnimationActive={false} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Top Customers Table */}
                {customerData.topCustomers?.length > 0 && (
                  <Card className="shadow-md border-0 bg-white/80 dark:bg-gray-800/80" style={{ pageBreakInside: 'avoid' }}>
                    <CardHeader className="bg-purple-50 rounded-t-xl border-b border-purple-100 pb-4">
                      <CardTitle className="text-purple-700">Customer Details</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr style={{ background: '#faf5ff' }}>
                              <th className="text-left px-5 py-3 font-semibold text-gray-600 border-b border-gray-200">#</th>
                              <th className="text-left px-5 py-3 font-semibold text-gray-600 border-b border-gray-200">Customer Name</th>
                              <th className="text-left px-5 py-3 font-semibold text-gray-600 border-b border-gray-200">Email</th>
                              <th className="text-right px-5 py-3 font-semibold text-gray-600 border-b border-gray-200">Total Bookings</th>
                              <th className="text-right px-5 py-3 font-semibold text-gray-600 border-b border-gray-200">Revenue</th>
                            </tr>
                          </thead>
                          <tbody>
                            {customerData.topCustomers.map((row: any, i: number) => {
                              const revRow = financialData?.revenueByCustomer?.find((r: any) => r.customerName === row.customerName);
                              return (
                                <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }} className="hover:bg-purple-50 transition-colors">
                                  <td className="px-5 py-3 text-gray-400 border-b border-gray-100">{i + 1}</td>
                                  <td className="px-5 py-3 font-medium text-gray-800 border-b border-gray-100">{row.customerName}</td>
                                  <td className="px-5 py-3 text-gray-500 border-b border-gray-100">{row.email}</td>
                                  <td className="px-5 py-3 text-right font-semibold text-purple-700 border-b border-gray-100">{row.bookingCount}</td>
                                  <td className="px-5 py-3 text-right font-semibold text-gray-800 border-b border-gray-100">{revRow ? formatCurrency(revRow.totalRevenue) : '—'}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Recent Feedback */}
                {customerData.recentFeedback?.length > 0 && (
                  <Card className="shadow-md border-0 bg-white/80 dark:bg-gray-800/80" style={{ pageBreakInside: 'avoid' }}>
                    <CardHeader className="bg-orange-50 rounded-t-xl border-b border-orange-100 pb-4">
                      <CardTitle className="text-orange-600">Feedback</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {customerData.recentFeedback.slice(0, 6).map((item: any, i: number) => (
                          <div key={i} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white/60 hover:shadow-sm transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium text-sm text-gray-900">{item.customerName}</span>
                              <span className="text-xs text-gray-400">{formatDate(item.date)}</span>
                            </div>
                            <p className="text-sm text-gray-600 italic">"{item.description}"</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </section>
            )}

            {/* Empty state */}
            {!financialData && !serviceData && !customerData && (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <TrendingUp className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-lg font-medium">No data found for the selected filters</p>
              </div>
            )}

          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
