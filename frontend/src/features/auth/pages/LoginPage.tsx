import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, LockKeyhole, Mail, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { loginWithPassword } from "@/features/auth/api/authApi";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { LoginRequest } from "@/features/auth/types";
import type { NormalizedApiError } from "@/shared/types/api";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { Input } from "@/shared/ui/Input";

const FEATURE_PILLS = [
  "Project delivery analytics",
  "Cross-team sprint visibility",
  "Drag-and-drop story execution",
];

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState<LoginRequest>({
    email: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof LoginRequest, string>>>({});
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const redirectTo = (location.state as { from?: Location })?.from?.pathname ?? "/dashboard";

  const loginMutation = useMutation({
    mutationFn: loginWithPassword,
    onSuccess: ({ token }) => {
      login(token);
      navigate(redirectTo, { replace: true });
    },
  });

  const handleChange = (field: keyof LoginRequest, value: string) => {
    setInfoMessage(null);
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: Partial<Record<keyof LoginRequest, string>> = {};
    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
    }
    if (!form.password.trim()) {
      nextErrors.password = "Password is required.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    loginMutation.mutate({
      email: form.email.trim(),
      password: form.password.trim(),
    });
  };

  const mutationError = loginMutation.error as NormalizedApiError | null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-hero-grid">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
        <motion.section
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="relative hidden overflow-hidden rounded-[36px] border border-white/60 bg-slate-950 p-10 text-white shadow-soft lg:flex lg:flex-col lg:justify-between"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(74,165,255,0.35),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(255,111,61,0.25),_transparent_28%)]" />
          <div className="relative space-y-8">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur">
              <Sparkles className="size-4 text-accent-300" />
              Agile delivery, without the noise
            </div>
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.26em] text-brand-200">AgileTrack SaaS</p>
              <h1 className="max-w-xl font-display text-5xl font-bold leading-tight text-balance">
                Keep projects, sprints, stories, and people moving in one calm command center.
              </h1>
              <p className="max-w-lg text-base leading-7 text-white/70">
                Built for teams that need delivery clarity, quick decisions, and a UI that stays focused when the work
                gets busy.
              </p>
            </div>
          </div>

          <div className="relative grid gap-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <Card className="border-white/10 bg-white/10 p-5 text-white shadow-none backdrop-blur">
                <p className="text-sm text-white/70">Projects</p>
                <p className="mt-2 font-display text-3xl font-bold">128</p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-brand-100">Tracked in real time</p>
              </Card>
              <Card className="border-white/10 bg-white/10 p-5 text-white shadow-none backdrop-blur">
                <p className="text-sm text-white/70">Sprint cadence</p>
                <p className="mt-2 font-display text-3xl font-bold">14d</p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-brand-100">Across delivery pods</p>
              </Card>
              <Card className="border-white/10 bg-white/10 p-5 text-white shadow-none backdrop-blur">
                <p className="text-sm text-white/70">Story flow</p>
                <p className="mt-2 font-display text-3xl font-bold">99.2%</p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-brand-100">Board uptime</p>
              </Card>
            </div>
            <div className="flex flex-wrap gap-3">
              {FEATURE_PILLS.map((feature) => (
                <span
                  key={feature}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
          className="flex items-center justify-center"
        >
          <Card className="w-full max-w-lg rounded-[32px] p-8 sm:p-10">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-3 rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700">
                  <div className="flex size-8 items-center justify-center rounded-full bg-brand-600 text-white">AT</div>
                  AgileTrack Workspace
                </div>
                <div className="space-y-2">
                  <h2 className="font-display text-3xl font-bold tracking-tight text-ink">Welcome back</h2>
                  <p className="text-sm leading-6 text-slate-500">
                    Sign in to check delivery health, move stories, and keep your sprint momentum visible.
                  </p>
                </div>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <Input
                  label="Email"
                  placeholder="name@company.com"
                  type="email"
                  value={form.email}
                  error={fieldErrors.email}
                  onChange={(event) => handleChange("email", event.target.value)}
                />
                <Input
                  label="Password"
                  placeholder="Enter your password"
                  type="password"
                  value={form.password}
                  error={fieldErrors.password}
                  onChange={(event) => handleChange("password", event.target.value)}
                />

                {mutationError ? (
                  <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {mutationError.message}
                  </div>
                ) : null}

                {infoMessage ? (
                  <div className="rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-700">
                    {infoMessage}
                  </div>
                ) : null}

                <div className="space-y-3 pt-2">
                  <Button type="submit" fullWidth size="lg" loading={loginMutation.isPending}>
                    Sign in
                    <ArrowRight className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    fullWidth
                    onClick={() => setInfoMessage("Google SSO is not enabled on the current backend environment.")}
                  >
                    Continue with Google
                  </Button>
                </div>
              </form>

              <div className="grid gap-3 rounded-[28px] border border-slate-100 bg-slate-50/80 p-5 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-white p-2 text-brand-700 shadow-sm">
                    <Mail className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">Secure email auth</p>
                    <p className="text-xs leading-5 text-slate-500">JWT-backed session management with gateway protection.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-white p-2 text-accent-600 shadow-sm">
                    <LockKeyhole className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">Role-aware access</p>
                    <p className="text-xs leading-5 text-slate-500">Views stay aligned with backend roles and protected routes.</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.section>
      </div>
    </div>
  );
}
