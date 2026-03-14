import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Phone, 
  MessageSquare, 
  Globe, 
  Bell, 
  Users, 
  BarChart3, 
  Clock, 
  CheckCircle2,
  AlertTriangle,
  Zap,
  ArrowRight,
  Menu,
  X,
  Wrench,
  Thermometer,
  Droplets,
  Zap as BoltIcon
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-surface/80 backdrop-blur-sm border-b border-border z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="text-xl font-bold text-brand">Tranquillo</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-text-muted hover:text-text-primary transition-colors">Features</a>
              <a href="#how-it-works" className="text-text-muted hover:text-text-primary transition-colors">How It Works</a>
              <a href="#pricing" className="text-text-muted hover:text-text-primary transition-colors">Pricing</a>
              <Button variant="outline" size="sm">Sign In</Button>
              <a href="/dashboard"><Button size="sm">Get Started</Button></a>
            </div>
            <button className="md:hidden text-brand">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="accent" className="mb-4">For Home Service Businesses</Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary leading-tight mb-6">
                Home Services,{" "}
                <span className="text-accent">Finally Modernized</span>
              </h1>
              <p className="text-lg text-text-muted mb-8 max-w-xl">
                Stop drowning in phone calls, missed emergencies, and chaotic schedules. 
                Tranquillo gives HVAC, plumbing, and electrical businesses the AI-powered 
                operations platform they deserve.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="gap-2" onClick={() => window.location.href = "/dashboard"}>
                  Start Free Trial <ArrowRight className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="lg">
                  Watch Demo
                </Button>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-text-muted">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span>No credit card</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span>14-day trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
            
            {/* Dashboard Preview */}
            <div className="relative">
              <div className="bg-surface rounded-2xl shadow-2xl border border-border overflow-hidden">
                <div className="bg-brand px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <span className="text-white/60 text-sm ml-2">dashboard.tranquillo.app</span>
                </div>
                <div className="p-6 bg-background">
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {[
                      { label: "Calls Today", value: "47", color: "text-brand" },
                      { label: "Open Intakes", value: "12", color: "text-warning" },
                      { label: "Bookings", value: "23", color: "text-success" },
                      { label: "Avg Response", value: "4m", color: "text-info" },
                    ].map((stat, i) => (
                      <div key={i} className="bg-surface rounded-lg p-3">
                        <div className="text-xs text-text-muted mb-1">{stat.label}</div>
                        <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-surface rounded-lg p-4">
                    <div className="text-sm font-medium mb-3">Intake Inbox</div>
                    {[
                      { name: "Sarah Martinez", issue: "AC not cooling", urgency: "EMERGENCY", time: "2m ago" },
                      { name: "John Chen", issue: "Leaking water heater", urgency: "URGENT", time: "8m ago" },
                      { name: "Mike Thompson", issue: "Furnace inspection", urgency: "STANDARD", time: "15m ago" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-surface-mid flex items-center justify-center text-xs font-medium">
                            {item.name.split(" ").map(n => n[0]).join("")}
                          </div>
                          <div>
                            <div className="text-sm font-medium">{item.name}</div>
                            <div className="text-xs text-text-muted">{item.issue}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={item.urgency === "EMERGENCY" ? "danger" : item.urgency === "URGENT" ? "warning" : "outline"} className="text-xs">
                            {item.urgency}
                          </Badge>
                          <span className="text-xs text-text-muted">{item.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-surface-mid">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              The Old Way? It&apos;s Broken.
            </h2>
            <p className="text-lg text-text-muted max-w-2xl mx-auto">
              Every day, home service businesses lose money to chaos they can&apos;t see.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Phone,
                title: "Drowning in Calls",
                description: "Phone rings constantly. Dispatchers overwhelmed. Customers frustrated waiting on hold."
              },
              {
                icon: AlertTriangle,
                title: "Missed Emergencies",
                description: "No way to prioritize. Real emergencies get buried. Customers go to competitors."
              },
              {
                icon: Clock,
                title: "Zero Visibility",
                description: "Where are your techs? Which jobs are done? You're flying blind until the end of the day."
              }
            ].map((pain, i) => (
              <Card key={i} className="border-2 border-danger/20 bg-danger/5">
                <CardHeader>
                  <pain.icon className="w-8 h-8 text-danger mb-2" />
                  <CardTitle className="text-danger">{pain.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{pain.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="muted" className="mb-4">Platform Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Everything You Need, Nothing You Don&apos;t
            </h2>
            <p className="text-lg text-text-muted max-w-2xl mx-auto">
              Purpose-built for HVAC, plumbing, electrical, and other home service trades.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: MessageSquare,
                title: "Intake Inbox",
                description: "All customer requests in one place—web, SMS, voice. AI-powered urgency scoring keeps emergencies at the top."
              },
              {
                icon: Zap,
                title: "Urgency Scoring",
                description: "Automatic 1-10 urgency rating. EMERGENCY calls bubble up. Your dispatchers see what matters first."
              },
              {
                icon: Bell,
                title: "Real-time Alerts",
                description: "Browser notifications for new intakes. Sound alerts for emergencies. Never miss a critical call again."
              },
              {
                icon: Users,
                title: "Tech Dispatch",
                description: "Assign jobs, track status, update schedules. Techs see their day in real-time on their phones."
              },
              {
                icon: Globe,
                title: "Web Widget",
                description: "Embed a booking widget on your website. Customers self-serve 24/7. Leads flow straight to your inbox."
              },
              {
                icon: BarChart3,
                title: "Billing & Usage",
                description: "Track minutes, messages, sessions. Tiered plans scale with you. No surprise overages."
              }
            ].map((feature, i) => (
              <Card key={i} className="hover:border-accent transition-colors">
                <CardHeader>
                  <feature.icon className="w-10 h-10 text-accent mb-3" />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-brand">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Three Steps to Tranquillity
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Go from chaos to calm in minutes, not months.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Customer Requests",
                description: "Web widget, SMS, or phone. Customer describes their issue. Our AI captures the details.",
                icons: [Globe, MessageSquare, Phone]
              },
              {
                step: "2",
                title: "AI Triage",
                description: "Urgency scored automatically. Emergencies flagged. Dispatchers see priority queue.",
                icons: [Zap]
              },
              {
                step: "3",
                title: "You Dispatch",
                description: "Assign techs with one click. Customers get SMS updates. Everyone stays informed.",
                icons: [Users]
              }
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 rounded-full bg-accent text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-white/70">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industry Icons */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-text-muted mb-6">Built for the trades</p>
          <div className="flex justify-center gap-8 md:gap-16">
            {[
              { icon: Thermometer, label: "HVAC" },
              { icon: Droplets, label: "Plumbing" },
              { icon: BoltIcon, label: "Electrical" },
              { icon: Wrench, label: "More" },
            ].map((trade, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-xl bg-surface-mid flex items-center justify-center">
                  <trade.icon className="w-7 h-7 text-brand" />
                </div>
                <span className="text-sm text-text-muted">{trade.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-surface-mid">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="accent" className="mb-4">Simple Pricing</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Start Small, Scale Up
            </h2>
            <p className="text-lg text-text-muted max-w-2xl mx-auto">
              No per-user fees. No hidden costs. Just straightforward plans that grow with your business.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: "Foundation",
                price: "$99",
                period: "/month",
                description: "For small teams getting started",
                features: ["Dashboard & KPIs", "Basic Bookings", "1 Location", "Email Support"],
                cta: "Start Trial",
                featured: false
              },
              {
                name: "Ops Pro",
                price: "$249",
                period: "/month",
                description: "For growing businesses",
                features: ["Everything in Foundation", "Intake Inbox + Urgency", "Web/SMS Intake", "Real-time Alerts", "Up to 5 Locations"],
                cta: "Start Trial",
                featured: true
              },
              {
                name: "Enterprise",
                price: "Custom",
                period: "",
                description: "For multi-location operations",
                features: ["Everything in Ops Pro", "Voice AI Agent", "Unlimited Locations", "Custom Integrations", "Dedicated Support"],
                cta: "Contact Sales",
                featured: false
              }
            ].map((plan, i) => (
              <Card key={i} className={plan.featured ? "border-2 border-accent relative" : ""}>
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="accent">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center pt-8">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-brand">{plan.price}</span>
                    <span className="text-text-muted">{plan.period}</span>
                  </div>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                        <span className="text-text-primary">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant={plan.featured ? "accent" : "outline"}>
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Ready to Modernize Your Operations?
          </h2>
          <p className="text-lg text-text-muted mb-8">
            Join hundreds of home service businesses already using Tranquillo. 
            Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gap-2" onClick={() => window.location.href = "/dashboard"}>
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="lg">
              Schedule a Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <span className="text-xl font-bold text-white">Tranquillo</span>
              </div>
              <p className="text-white/60 text-sm">
                AI-powered operations for home service businesses.
              </p>
            </div>
            {[
              { title: "Product", links: ["Features", "Pricing", "Integrations", "API"] },
              { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
              { title: "Legal", links: ["Privacy", "Terms", "Security"] }
            ].map((col, i) => (
              <div key={i}>
                <h4 className="font-semibold text-white mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <a href="#" className="text-white/60 hover:text-white text-sm transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center">
            <p className="text-white/40 text-sm">
              © 2026 Tranquillo Labs. All rights reserved. Built for the trades.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}