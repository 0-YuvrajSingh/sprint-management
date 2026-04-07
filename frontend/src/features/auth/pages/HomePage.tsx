import { useAuth } from "@/features/auth/hooks/useAuth";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-hero-grid px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-6 rounded-[36px] border border-white/60 bg-slate-950 p-8 text-white shadow-soft sm:p-10">
            <p className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-200">
              AgileTrack SaaS
            </p>
            <h1 className="max-w-2xl font-display text-4xl font-bold leading-tight sm:text-5xl">
              Ship projects faster with one workspace for projects, sprints, stories, and users.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-white/75">
              Start from the homepage, sign in with your account, and manage delivery through the gateway-backed app.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button size="lg">
                    Open Dashboard
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/login">
                    <Button size="lg">
                      Sign In
                      <ArrowRight className="size-4" />
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="secondary" size="lg">
                      Create Account
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </section>

          <Card className="h-fit rounded-[32px] p-8">
            <div className="space-y-5">
              <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                <ShieldCheck className="size-5" />
              </div>
              <h2 className="font-display text-2xl font-bold text-ink">Auth and Routing Updated</h2>
              <p className="text-sm leading-6 text-slate-600">
                Public homepage is now available at /. Login and register are available as public routes, while
                dashboard routes remain protected.
              </p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>Gateway auth endpoint: /auth/login</li>
                <li>Gateway register endpoint: /auth/register</li>
                <li>App APIs use /api/* gateway routes</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
