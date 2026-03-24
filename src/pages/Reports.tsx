import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Activity, Users, FileText, TrendingUp, AlertCircle, Wrench, Car, Download } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import html2pdf from 'html2pdf.js';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function Reports() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  
  // States for different reports
  const [financialData, setFinancialData] = useState<any>(null);
  const [serviceData, setServiceData] = useState<any>(null);
  const [customerData, setCustomerData] = useState<any>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState('financial');

  // Date Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Select Filters Data
  const [dateShortcut, setDateShortcut] = useState('all');
  const [allCustomers, setAllCustomers] = useState([]);
  const [allServices, setAllServices] = useState([]);

  // Active Filters
  const [customerFilter, setCustomerFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [debouncedCustomer, setDebouncedCustomer] = useState('');
  const [debouncedService, setDebouncedService] = useState('');

  // Fetch filter options on mount
  const handleDateShortcut = (value: string) => {
    setDateShortcut(value);
    const toLocalISOString = (d: Date) => {
      const offset = d.getTimezoneOffset() * 60000;
      return (new Date(d.getTime() - offset)).toISOString().split('T')[0];
    };
    
    if (value === 'all') {
      setStartDate('');
      setEndDate('');
    } else if (value === 'today') {
      const today = new Date();
      const todayStr = toLocalISOString(today);
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (value === 'week') {
      const today = new Date();
      const firstDay = new Date();
      firstDay.setDate(today.getDate() - today.getDay());
      const lastDay = new Date();
      lastDay.setDate(today.getDate() - today.getDay() + 6);
      setStartDate(toLocalISOString(firstDay));
      setEndDate(toLocalISOString(lastDay));
    } else if (value === 'month') {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      setStartDate(toLocalISOString(firstDay));
      setEndDate(toLocalISOString(lastDay));
    }
  };

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:5000/api/customers').then(res => res.json()),
      fetch('http://localhost:5000/api/services').then(res => res.json())
    ]).then(([custData, servData]) => {
      setAllCustomers(custData || []);
      setAllServices(servData || []);
    }).catch(err => console.error("Error fetching filter options", err));
  }, []);

  // Clear filters when switching tabs
  useEffect(() => {
    setCustomerFilter('');
    setServiceFilter('');
    setDebouncedCustomer('');
    setDebouncedService('');
  }, [activeTab]);

  // Inject PDF Avoid Break classes for html2pdf and print
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .shadow-md, .recharts-wrapper, .recharts-surface, .grid > div {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCustomer(customerFilter);
      setDebouncedService(serviceFilter);
    }, 500);
    return () => clearTimeout(timer);
  }, [customerFilter, serviceFilter]);

  // PDF Export
  const handleDownloadPDF = () => {
    // Only capture the content of the currently active tab
    const element = document.getElementById(`pdf-${activeTab}`);
    if (!element) return;
    
    toast({ title: "Generating PDF...", description: "Please wait a moment while we format your report." });

    const opt = {
      margin:       [0.8, 0.3, 0.5, 0.3] as [number, number, number, number], 
      filename:     `GarageHub_${activeTab}_Report_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.pdf`,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'landscape' as const },
      pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
    };

    const worker = html2pdf().set(opt).from(element).toPdf();
    
    worker.get('pdf').then(function(pdf: any) {
        const totalPages = pdf.internal.getNumberOfPages();
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            
            // Header - Title
            pdf.setFontSize(16);
            pdf.setTextColor(17, 24, 39); // Gray 900
            pdf.setFont('helvetica', 'bold');
            pdf.text('GarageHub', 0.3, 0.4);
            
            // Header - Subtitle
            pdf.setFontSize(10);
            pdf.setTextColor(107, 114, 128); // Gray 500
            pdf.setFont('helvetica', 'normal');
            pdf.text('Premium Vehicle Service Management', 0.3, 0.55);
            
            // Header - Right details
            pdf.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, pageWidth - 0.3, 0.4, { align: 'right' });
            
            // Header - Divider line
            pdf.setDrawColor(229, 231, 235); // Gray 200
            pdf.setLineWidth(0.01);
            pdf.line(0.3, 0.65, pageWidth - 0.3, 0.65);

            // Footer - Divider line
            pdf.setDrawColor(229, 231, 235); // Gray 200
            pdf.line(0.3, pageHeight - 0.4, pageWidth - 0.3, pageHeight - 0.4);
            
            // Footer - Content
            pdf.setFontSize(9);
            pdf.setTextColor(156, 163, 175); // Gray 400
            pdf.text(`© ${new Date().getFullYear()} GarageHub. Confidential Report.`, 0.3, pageHeight - 0.2);
            pdf.text(`Page ${i} of ${totalPages}`, pageWidth - 0.3, pageHeight - 0.2, { align: 'right' });
        }
    });

    worker.save().then(() => {
        toast({ title: "Success", description: "Report downloaded successfully." });
    });
  };

  useEffect(() => {
    fetchReports();
  }, [startDate, endDate, debouncedCustomer, debouncedService]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      let queryParams = [];
      if (startDate) queryParams.push(`startDate=${startDate}`);
      if (endDate) queryParams.push(`endDate=${endDate}`);
      if (debouncedCustomer) queryParams.push(`customerName=${debouncedCustomer}`);
      if (debouncedService) queryParams.push(`serviceName=${debouncedService}`);
      const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

      const [finRes, servRes, custRes] = await Promise.all([
        fetch(`http://localhost:5000/api/reports/financial${queryString}`).then(res => res.json()),
        fetch(`http://localhost:5000/api/reports/services${queryString}`).then(res => res.json()),
        fetch(`http://localhost:5000/api/reports/customers${queryString}`).then(res => res.json())
      ]);

      if (finRes.success) setFinancialData(finRes);
      if (servRes.success) setServiceData(servRes);
      if (custRes.success) setCustomerData(custRes);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast({
        title: "Error fetching reports",
        description: "Could not load report data from the server.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && !financialData) {
    return (
        <DashboardLayout title="Reports">
            <div className="p-8 flex justify-center items-center h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
        </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Reports">
      <div id="report-content" className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in pb-24">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center bg-white/50 dark:bg-gray-800/50 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 backdrop-blur-xl gap-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              System Reports
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
              Analytics and insights across the platform
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 w-full xl:w-auto flex-wrap justify-end">

              {/* Date Shortcuts */}
               <select 
                  value={dateShortcut} 
                  onChange={(e) => handleDateShortcut(e.target.value)}
                  className="bg-white dark:bg-gray-800 p-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm outline-none text-gray-700 dark:text-gray-300 w-full sm:w-auto cursor-pointer focus:ring-2 focus:ring-primary/20"
               >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="custom">Custom Date Range</option>
               </select>

              {/* Date Pickers */}
              {dateShortcut === 'custom' && (
                  <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm w-full sm:w-auto shrink-0 animate-fade-in">
                      <input 
                          type="date" 
                          value={startDate} 
                          onChange={(e) => setStartDate(e.target.value)}
                          className="bg-transparent border-none text-sm outline-none text-gray-700 dark:text-gray-300 cursor-pointer w-[120px]"
                      />
                      <span className="text-gray-400 text-sm">to</span>
                      <input 
                          type="date" 
                          value={endDate} 
                          onChange={(e) => setEndDate(e.target.value)}
                          className="bg-transparent border-none text-sm outline-none text-gray-700 dark:text-gray-300 cursor-pointer w-[120px]"
                      />
                  </div>
              )}

              {/* Download PDF Button */}
              <button 
                  onClick={handleDownloadPDF}
                  className="flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2.5 rounded-lg shadow-sm transition-colors font-bold text-sm w-full sm:w-auto shrink-0 border-2 border-primary hover:border-primary/90"
              >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export PDF</span>
                  <span className="sm:hidden">PDF</span>
              </button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8 bg-gray-100/50 dark:bg-gray-800/50 p-1 rounded-xl">
          <TabsTrigger value="financial" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm transition-all py-3">
            <DollarSign className="w-4 h-4 mr-2" />
            Financial & Revenue
          </TabsTrigger>
          <TabsTrigger value="services" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm transition-all py-3">
            <Wrench className="w-4 h-4 mr-2" />
            Service Performance
          </TabsTrigger>
          <TabsTrigger value="customers" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm transition-all py-3">
            <Users className="w-4 h-4 mr-2" />
            Customer Insights
          </TabsTrigger>
        </TabsList>

        {/* 1. FINANCIAL TAB */}
        <TabsContent value="financial" className="space-y-6">
          <div id="pdf-financial" className="grid grid-cols-1 gap-6 bg-transparent">

            <Card className="shadow-md border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm md:col-span-2">
              <CardHeader className="bg-primary/5 dark:bg-primary/10 rounded-t-xl border-b border-primary/10 dark:border-primary/20 pb-4 flex flex-row justify-between items-center flex-wrap gap-4">
                <div>
                  <CardTitle className="mb-1 text-gray-800 dark:text-gray-100">
                    <span className="inline-block align-middle mr-2">
                      <TrendingUp className="w-5 h-5 text-primary block" />
                    </span>
                    <span className="inline-block align-middle">Revenue Over Time</span>
                  </CardTitle>
                  <CardDescription className="mt-1">Daily revenue trends based on selected date range</CardDescription>
                </div>
                <div className="flex bg-white dark:bg-gray-800 px-4 py-2 rounded-xl items-center shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="bg-primary/10 mr-3 p-2 rounded-lg hidden sm:flex items-center justify-center h-8 w-8">
                      <TrendingUp className="text-primary w-4 h-4 block" style={{ transform: 'translateY(1px)' }}/>
                  </div>
                  <div>
                      <p className="text-xs text-gray-500 font-medium whitespace-nowrap uppercase tracking-wider">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white leading-tight mt-0.5">
                          {formatCurrency(financialData?.totalRevenue)}
                      </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                 {financialData?.revenueTimeline?.length > 0 ? (
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={financialData.revenueTimeline} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                          <XAxis 
                            dataKey="date" 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                            dy={10}
                            tickFormatter={(value) => formatDate(value)}
                          />
                          <YAxis 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                            tickFormatter={(value) => `₹${value}`}
                          />
                          <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                            labelFormatter={(label) => formatDate(label)}
                          />
                          <Area type="monotone" dataKey="revenue" stroke="#10B981" fillOpacity={1} fill="url(#colorRevenue)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                      <TrendingUp className="w-8 h-8 mb-2 opacity-50" />
                      <p>No revenue data available for the selected period</p>
                    </div>
                  )}
              </CardContent>
            </Card>
            
            <div className="html2pdf__page-break m-0 p-0 h-0 col-span-full border-none"></div>

            <Card className="shadow-md border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm md:col-span-2">
              <CardHeader className="bg-blue-50 dark:bg-blue-900/10 rounded-t-xl border-b border-blue-100 dark:border-blue-900/20 pb-4">
                <CardTitle className="mb-1 text-blue-600 dark:text-blue-400">
                  <span className="inline-block align-middle mr-2">
                    <Car className="w-5 h-5 text-blue-500 block" />
                  </span>
                  <span className="inline-block align-middle">Revenue by Vehicle Type</span>
                </CardTitle>
                <CardDescription>Income generated per vehicle category</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {financialData?.revenueByVehicleType?.length > 0 ? (
                  <div className="h-[300px] w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={financialData.revenueByVehicleType}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="revenue"
                          nameKey="vehicleType"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {financialData.revenueByVehicleType.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number, name: string) => [formatCurrency(value), name]}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <Car className="w-8 h-8 mb-2 opacity-50" />
                    <p>No revenue data available by vehicle type</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 2. SERVICES TAB */}
        <TabsContent value="services" className="space-y-6">
          <div className="flex justify-end pr-2 gap-4 flex-wrap">
              <select 
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="bg-white dark:bg-gray-800 p-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm outline-none text-gray-700 dark:text-gray-300 w-full sm:w-[250px] cursor-pointer focus:ring-2 focus:ring-primary/20"
              >
                <option value="">All Services</option>
                {allServices.map((s: any) => (
                    <option key={s.sid} value={s.service_name}>{s.service_name}</option>
                ))}
              </select>
          </div>
          <div id="pdf-services" className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-transparent p-2">
            
            <Card className="shadow-md border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm lg:col-span-2">
              <CardHeader className="bg-primary/5 dark:bg-primary/10 rounded-t-xl border-b border-primary/10 dark:border-primary/20 pb-4">
                <CardTitle className="mb-1 text-gray-800 dark:text-gray-100">
                  <span className="inline-block align-middle mr-2">
                    <DollarSign className="w-5 h-5 text-primary block" />
                  </span>
                  <span className="inline-block align-middle">Revenue by Service</span>
                </CardTitle>
                <CardDescription className="mt-1">Income generated per service type</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {financialData?.revenueByService?.length > 0 ? (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={financialData.revenueByService} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis 
                          dataKey="serviceName" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#6B7280', fontSize: 12 }}
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#6B7280', fontSize: 12 }}
                          tickFormatter={(value) => `₹${value}`}
                        />
                        <Tooltip 
                          cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                        />
                        <Bar 
                          dataKey="totalRevenue" 
                          fill="#10B981" 
                          radius={[4, 4, 0, 0]} 
                          maxBarSize={50}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <DollarSign className="w-8 h-8 mb-2 opacity-50" />
                    <p>No revenue data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="html2pdf__page-break m-0 p-0 h-0 col-span-full border-none"></div>

            <Card className="shadow-md border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="bg-blue-50 dark:bg-blue-900/10 rounded-t-xl border-b border-blue-100 dark:border-blue-900/20 pb-4">
                <CardTitle className="mb-1 text-blue-600 dark:text-blue-400">
                  <span className="inline-block align-middle mr-2">
                    <Activity className="w-5 h-5 text-blue-500 block" />
                  </span>
                  <span className="inline-block align-middle">Most Popular Services</span>
                </CardTitle>
                <CardDescription className="mt-1">Top requested services across the garage</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {serviceData?.popularServices?.length > 0 ? (
                  <div className="h-[300px] w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={serviceData.popularServices}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="count"
                          nameKey="serviceName"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {serviceData.popularServices.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number, name: string) => [value, name]}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <Activity className="w-8 h-8 mb-2 opacity-50" />
                    <p>No service data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-md border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="bg-indigo-50 dark:bg-indigo-900/10 rounded-t-xl border-b border-indigo-100 dark:border-indigo-900/20 pb-4">
                <CardTitle className="mb-1 text-indigo-600 dark:text-indigo-400">
                  <span className="inline-block align-middle mr-2">
                    <Car className="w-5 h-5 text-indigo-500 block" />
                  </span>
                  <span className="inline-block align-middle">Vehicle Type Breakdown</span>
                </CardTitle>
                <CardDescription className="mt-1">Count of unique services offered per vehicle type</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 flex flex-col justify-center items-center h-full min-h-[300px]">
                {serviceData?.vehicleTypeBreakdown?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={serviceData.vehicleTypeBreakdown} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                      <XAxis type="number" axisLine={false} tickLine={false} />
                      <YAxis 
                        dataKey="_id" 
                        type="category" 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fill: '#4F46E5', fontWeight: 500 }}
                      />
                      <Tooltip 
                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                        formatter={(value: number) => [value, 'Services']}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}  
                      />
                      <Bar dataKey="count" fill="#6366F1" radius={[0, 4, 4, 0]} barSize={40}>
                         {serviceData.vehicleTypeBreakdown.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                          ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-500">No vehicle breakdown data</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 3. CUSTOMER TAB */}
        <TabsContent value="customers" className="space-y-6">
            <div className="flex justify-end pr-2 gap-4 flex-wrap">
                <select 
                    value={customerFilter}
                    onChange={(e) => setCustomerFilter(e.target.value)}
                    className="bg-white dark:bg-gray-800 p-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm outline-none text-gray-700 dark:text-gray-300 w-full sm:w-[250px] cursor-pointer focus:ring-2 focus:ring-primary/20"
                 >
                    <option value="">All Customers</option>
                    {allCustomers.map((c: any) => (
                        <option key={c.cid} value={c.name}>{c.name}</option>
                    ))}
                 </select>
            </div>
            <div id="pdf-customers" className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-transparent p-2">
            
            <Card className="shadow-md border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm lg:col-span-2">
              <CardHeader className="bg-emerald-50 dark:bg-emerald-900/10 rounded-t-xl border-b border-emerald-100 dark:border-emerald-900/20 pb-4">
                <CardTitle className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <DollarSign className="w-5 h-5" /> Revenue by Customer
                </CardTitle>
                <CardDescription>Income generated per customer</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {financialData?.revenueByCustomer?.length > 0 ? (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={financialData.revenueByCustomer.slice(0, 10)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis 
                          dataKey="customerName" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#6B7280', fontSize: 12 }}
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#6B7280', fontSize: 12 }}
                          tickFormatter={(value) => `₹${value}`}
                        />
                        <Tooltip 
                          cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                        />
                        <Bar 
                          dataKey="totalRevenue" 
                          fill="#8B5CF6" 
                          radius={[4, 4, 0, 0]} 
                          maxBarSize={50}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <DollarSign className="w-8 h-8 mb-2 opacity-50" />
                    <p>No revenue data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-md border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm h-full">
              <CardHeader className="bg-emerald-50 dark:bg-emerald-900/10 rounded-t-xl border-b border-emerald-100 dark:border-emerald-900/20 pb-4">
                <CardTitle className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <Users className="w-5 h-5" /> Top Loyal Customers
                </CardTitle>
                <CardDescription>Customers with the highest number of bookings</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {customerData?.topCustomers?.length > 0 ? (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={customerData.topCustomers} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis 
                          dataKey="customerName" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#6B7280', fontSize: 12 }}
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#6B7280', fontSize: 12 }}
                          allowDecimals={false}
                        />
                        <Tooltip 
                          cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          formatter={(value: number) => [value, 'Total Bookings']}
                        />
                        <Bar 
                          dataKey="bookingCount" 
                          fill="#10B981" 
                          radius={[4, 4, 0, 0]} 
                          maxBarSize={50}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <Users className="w-8 h-8 mb-2 opacity-50" />
                    <p>No customer booking data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-md border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="bg-orange-50 dark:bg-orange-900/10 rounded-t-xl border-b border-orange-100 dark:border-orange-900/20 pb-4">
                <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                  <FileText className="w-5 h-5" /> Recent Feedback
                </CardTitle>
                <CardDescription>Latest reviews from system customers</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                 {customerData?.recentFeedback?.length > 0 ? (
                    <div className="space-y-4">
                        {customerData.recentFeedback.slice(0, 4).map((item: any, i: number) => (
                            <div key={i} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white/40 dark:bg-gray-900/40 hover:shadow-sm transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{item.customerName}</span>
                                    <span className="text-xs text-gray-400">{formatDate(item.date)}</span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 italic">"{item.description}"</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-xl">
                        <FileText className="w-8 h-8 mb-2 opacity-50" />
                        <p>No recent feedback left.</p>
                    </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </DashboardLayout>
  );
}
