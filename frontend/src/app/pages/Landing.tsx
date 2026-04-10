import React from 'react';
import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { ArrowRight, CheckCircle2, Zap, Users, BarChart3, Kanban, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '../components/Logo';
import { useAuth } from '../context/AuthContext';

function InteractiveMockup({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  const [isZoomed, setIsZoomed] = React.useState(false);

  return (
    <>
      <motion.div
        layoutId={src}
        onClick={() => setIsZoomed(true)}
        whileHover={{ y: -10, scale: 1.02 }}
        className={`relative rounded-xl border bg-card p-1.5 shadow-2xl overflow-hidden cursor-zoom-in group ${className}`}
      >
        <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/20">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/40" />
          </div>
          <Maximize2 className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="overflow-hidden">
          <img
            src={src}
            alt={alt}
            className="w-full aspect-video object-cover rounded-sm"
          />
        </div>
      </motion.div>

      <AnimatePresence>
        {isZoomed && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsZoomed(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-xl"
            />
            <motion.div
              layoutId={src}
              className="relative w-full max-w-7xl bg-card rounded-2xl border shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsZoomed(false)}>Close</Button>
              </div>
              <div className="overflow-auto max-h-[80vh]">
                <img
                  src={src}
                  alt={alt}
                  className="w-full h-auto"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function Landing() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo />
            <div className="flex items-center gap-3">
              {user ? (
                <Link to="/dashboard">
                  <Button size="sm" className="px-5">Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm">Login</Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 pt-24 pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 text-primary text-sm font-medium mb-8 border border-primary/10">
              <Zap className="w-3.5 h-3.5" />
              Now with AI-powered insights
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground tracking-tight mb-6 leading-[1.1]">
              Project management
              <span className="block text-primary">made simple</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto">
              AgileTrack helps teams plan, track, and ship faster. From startups to enterprises,
              thousands of teams trust us to keep their projects on track.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to={user ? "/dashboard" : "/register"}>
                <Button size="lg" className="gap-2 h-11 px-8">
                  {user ? "Back to Dashboard" : "Get Started Free"}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="h-11 px-8">
                Watch Demo
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-6">No credit card required • Free 14-day trial</p>
          </div>

          {/* Hero Image Placeholder */}
          <div className="mt-20">
            <InteractiveMockup 
              src="/assets/dashboard-preview.png" 
              alt="AgileTrack Full Dashboard View" 
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-24 bg-card border-y">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Everything you need to ship faster
            </h2>
            <p className="text-lg text-muted-foreground">
              Powerful features designed for modern agile teams
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-background rounded-lg p-8 border hover:shadow-md transition-all duration-150">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <Kanban className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Kanban Boards</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Visualize your workflow with drag-and-drop kanban boards. Move stories seamlessly
                through your process.
              </p>
            </div>

            <div className="bg-background rounded-lg p-8 border hover:shadow-md transition-all duration-150">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Team Collaboration</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Role-based access control and real-time updates keep everyone in sync across your
                organization.
              </p>
            </div>

            <div className="bg-background rounded-lg p-8 border hover:shadow-md transition-all duration-150">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Analytics & Insights</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Track velocity, burndown, and team performance with built-in analytics and custom
                reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                Built for teams of all sizes
              </h2>
              <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                Whether you're a solo developer or leading a 1000-person organization, AgileTrack
                scales with you.
              </p>
              <ul className="space-y-4">
                {[
                  'Unlimited projects and sprints',
                  'Advanced sprint planning tools',
                  'Custom workflows and automation',
                  'Real-time collaboration',
                  'Enterprise-grade security',
                  '99.9% uptime SLA',
                ].map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <InteractiveMockup 
              src="/assets/feature-analytics.png" 
              alt="AgileTrack Stories Board" 
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-24 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-6">
            Ready to transform your workflow?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-10">
            Join thousands of teams already shipping faster with AgileTrack
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to={user ? "/dashboard" : "/register"}>
              <Button
                size="lg"
                variant="secondary"
                className="gap-2 h-11 px-8 bg-white text-primary hover:bg-white/90"
              >
                {user ? "Open Dashboard" : "Start Free Trial"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="h-11 px-8 text-primary-foreground border-primary-foreground/20 hover:bg-white/10"
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 sm:px-6 lg:px-8 py-12 bg-card border-t">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Logo iconSize={4} />
            <p className="text-sm text-muted-foreground">© 2026 AgileTrack. All rights reserved.</p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}