import { registerWithPassword } from "@/features/auth/api/authApi";
import type { RegisterRequest } from "@/features/auth/types";
import type { NormalizedApiError } from "@/shared/types/api";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { Input } from "@/shared/ui/Input";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, UserPlus } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterRequest>({
    name: "",
    email: "",
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<"name" | "email" | "password" | "confirmPassword", string>>>({});

  const registerMutation = useMutation({
    mutationFn: registerWithPassword,
    onSuccess: () => {
      navigate("/login", {
        replace: true,
        state: {
          presetEmail: form.email,
          notice: "Account created successfully. Please sign in.",
        },
      });
    },
  });

  const handleChange = (field: keyof RegisterRequest, value: string) => {
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: Partial<Record<"name" | "email" | "password" | "confirmPassword", string>> = {};
    if (!form.name.trim()) {
      nextErrors.name = "Name is required.";
    }
    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
    }
    if (!form.password.trim()) {
      nextErrors.password = "Password is required.";
    } else if (form.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }
    if (!confirmPassword.trim()) {
      nextErrors.confirmPassword = "Please confirm your password.";
    } else if (confirmPassword !== form.password) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    registerMutation.mutate({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
    });
  };

  const mutationError = registerMutation.error as NormalizedApiError | null;

  return (
    <div className="min-h-screen bg-hero-grid px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-xl items-center justify-center">
        <Card className="w-full rounded-[32px] p-8 sm:p-10">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">
                <UserPlus className="size-4" />
                Create your workspace account
              </p>
              <h1 className="font-display text-3xl font-bold text-ink">Register</h1>
              <p className="text-sm leading-6 text-slate-600">
                New environment detected. Create an account first, then sign in.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input
                label="Name"
                placeholder="Your full name"
                value={form.name}
                error={fieldErrors.name}
                onChange={(event) => handleChange("name", event.target.value)}
              />
              <Input
                label="Email"
                type="email"
                placeholder="name@company.com"
                value={form.email}
                error={fieldErrors.email}
                onChange={(event) => handleChange("email", event.target.value)}
              />
              <Input
                label="Password"
                type="password"
                placeholder="Minimum 8 characters"
                value={form.password}
                error={fieldErrors.password}
                onChange={(event) => handleChange("password", event.target.value)}
              />
              <Input
                label="Confirm password"
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                error={fieldErrors.confirmPassword}
                onChange={(event) => {
                  setFieldErrors((current) => ({ ...current, confirmPassword: undefined }));
                  setConfirmPassword(event.target.value);
                }}
              />

              {mutationError ? (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {mutationError.message}
                </div>
              ) : null}

              <Button type="submit" fullWidth size="lg" loading={registerMutation.isPending}>
                <CheckCircle2 className="size-4" />
                Create Account
              </Button>
            </form>

            <p className="text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-800">
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
