import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Car, ArrowRight, Star, Quote, Wrench, Calendar, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Index() {
  const [garage, setGarage] = useState<any>(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/garage/1')
      .then(res => res.json())
      .then(data => {
        if (data.gid) setGarage(data);
      })
      .catch(err => console.error("Error fetching garage:", err));
  }, []);

  const testimonials = [
    { name: 'Ravi Patel', role: 'Business Owner', rating: 5, text: 'The AC service was incredibly fast. I booked online, dropped my car off, and it was ready in 2 hours. Superb status tracking!' },
    { name: 'Sneha Joshi', role: 'Daily Commuter', rating: 4, text: 'Honest pricing and very professional staff. I really liked how I could pay online and just pick up my keys.' },
    { name: 'Amit Kumar', role: 'Car Enthusiast', rating: 5, text: 'Best garage in the city. They treat your car like their own. Highly recommended!' },
    { name: 'Priya Singh', role: 'Teacher', rating: 5, text: 'Very convenient booking process and transparent pricing. No surprises at the end.' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary/20">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/50 supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center shadow-lg shadow-primary/20">
              <Car className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight">GMS</span>
          </div>
          <div className="flex gap-4">
            <Link to="/login">
              <Button variant="ghost" className="font-semibold hover:bg-primary/10 hover:text-primary">
                Sign In
              </Button>
            </Link>

          </div>
        </div>
      </nav>

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
          {/* Abstract Background Elements */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
          </div>

          <div className="container mx-auto px-4 relative z-10 text-center">
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-forwards">


              <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
                Premium Auto Care,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-500 to-yellow-500 animate-shimmer bg-[length:200%_auto]">
                  Simplified.
                </span>
              </h1>

              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                Experience the future of car maintenance. Book top-tier services and manage everything from one beautiful dashboard.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link to="/login">
                  <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 animate-float">
                    Book a Service <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/services">
                  <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full border-2 hover:bg-secondary/50 hover:text-foreground">
                    View Services
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-forwards opacity-0">
              {[
                { label: 'Happy Customers', value: '10k+' },
                { label: 'Expert Mechanics', value: '50+' },
                { label: 'Services Completed', value: '25k+' },
                { label: 'Average Rating', value: '4.9/5' },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center">
                  <span className="text-3xl font-display font-bold text-foreground">{stat.value}</span>
                  <span className="text-sm text-muted-foreground font-medium">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-24 relative overflow-hidden bg-secondary/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Expert Services</h2>
              <p className="text-muted-foreground text-lg">Professional care for your vehicle, tailored to your needs.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  title: 'Oil Change',
                  price: '₹1,500',
                  icon: Wrench,
                  desc: 'Premium synthetic oil change with filter replacement and multi-point inspection.',
                  color: 'from-blue-500 to-cyan-500',
                  image: '/assets/oil_change.png'
                },
                {
                  title: 'Brake Service',
                  price: '₹3,500',
                  icon: Car,
                  desc: 'Complete brake pad replacement, rotor resurfacing (if needed), and fluid check.',
                  color: 'from-red-500 to-pink-500',
                  image: '/assets/brake_service.png'
                },
                {
                  title: 'AC Service',
                  price: '₹2,500',
                  icon: Calendar,
                  desc: 'AC system diagnostic, leak test, gas refill, and cabin filter cleaning.',
                  color: 'from-green-500 to-emerald-500',
                  image: '/assets/ac_service.png'
                }
              ].map((service, index) => (
                <div key={index} className="group relative bg-card border border-border rounded-3xl overflow-hidden hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl flex flex-col h-full">
                  <div className="h-56 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute bottom-4 left-4 z-20 flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center shadow-lg text-white`}>
                        <service.icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-2xl font-bold font-display text-white">{service.title}</h3>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <span className="bg-secondary/50 backdrop-blur border border-border/50 px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                        {service.price}
                      </span>
                    </div>

                    <p className="text-muted-foreground mb-8 line-clamp-3">{service.desc}</p>

                    <div className="mt-auto pt-6 border-t border-border/50">
                      <Link to="/login" className="flex items-center text-primary font-semibold group-hover:translate-x-1 transition-transform">
                        Book Now <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Marquee */}
        <section className="py-24 bg-card/30 overflow-hidden">
          <div className="container mx-auto px-4 mb-12">
            <div className="text-center">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Client Stories</h2>
              <p className="text-muted-foreground text-lg">Don't just take our word for it.</p>
            </div>
          </div>

          <div className="relative w-full">
            <div className="flex animate-scroll hover:pause gap-8 w-max">
              {[...testimonials, ...testimonials, ...testimonials].map((feedback, index) => (
                <div key={index} className="w-[400px] shrink-0 bg-background p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow relative">
                  <Quote className="absolute top-8 right-8 w-10 h-10 text-primary/10" />
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-white font-bold text-lg">
                      {feedback.name[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{feedback.name}</h4>
                      <p className="text-sm text-muted-foreground">{feedback.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < feedback.rating ? 'fill-yellow-400 text-yellow-400' : 'text-border'}`} />
                    ))}
                  </div>
                  <p className="text-muted-foreground italic leading-relaxed">"{feedback.text}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Location Section */}
        {garage && (
          <section className="py-24 relative overflow-hidden bg-background">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-secondary/30 z-0"></div>

            <div className="container mx-auto px-4 relative z-10">
              <div className="text-center mb-16">
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Visit Our Garage</h2>
                <p className="text-muted-foreground text-lg">We are here to help you with all your automotive needs.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Address */}
                <div className="bg-card p-8 rounded-3xl border border-border shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 flex flex-col items-center text-center group">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                    <MapPin className="w-8 h-8 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-bold text-xl mb-3">Address</h3>
                  <p className="text-muted-foreground">
                    {garage.address}
                    {garage.city && <><br />{garage.city}</>}
                    <br />Pincode: {garage.pincode}
                  </p>
                </div>

                {/* Phone */}
                <div className="bg-card p-8 rounded-3xl border border-border shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 flex flex-col items-center text-center group">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                    <Phone className="w-8 h-8 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-bold text-xl mb-3">Phone</h3>
                  <p className="text-muted-foreground">{garage.phone}</p>
                </div>

                {/* Email */}
                <div className="bg-card p-8 rounded-3xl border border-border shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 flex flex-col items-center text-center group">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                    <Mail className="w-8 h-8 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-bold text-xl mb-3">Email</h3>
                  <p className="text-muted-foreground">{garage.email}</p>
                </div>

                {/* Hours */}
                <div className="bg-card p-8 rounded-3xl border border-border shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 flex flex-col items-center text-center group">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                    <Clock className="w-8 h-8 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-bold text-xl mb-3">Opening Hours</h3>
                  <p className="text-muted-foreground">
                    Mon - Sat: 9:00 AM - 7:00 PM<br />
                    Sunday: Closed
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="py-12 bg-card border-t border-border">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Car className="w-6 h-6 text-primary" />
            <span className="font-display font-bold text-xl">GMS</span>
          </div>
          <div className="text-sm text-muted-foreground">
            © 2025 Garage Management System. All rights reserved.
          </div>
          <div className="flex gap-6 text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
