import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { motion, type Variants } from "framer-motion";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import authApi from "../api/auth.api";
import Button from "../components/shared/Button";
import { useAuth } from "../context/AuthContext";
import AuthCard from "../features/auth/components/AuthCard";
import AuthLayout from "../features/auth/components/AuthLayout";
import FormError from "../features/auth/components/FormError";
import InputField from "../features/auth/components/InputField";
import PasswordInput from "../features/auth/components/PasswordInput";
import SocialButton from "../features/auth/components/SocialButton";

// ================================================================
// STEP 1 — ZOD SCHEMA
// Defines what valid form data looks like.
// These rules run automatically when the form is submitted.
// ================================================================

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),

  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

// Derive the TypeScript type directly from the schema
// Never write this interface manually — let Zod generate it
type LoginFormData = z.infer<typeof loginSchema>;

const demoCredentials = [
  { role: "Admin", email: "sarah@agiletrack.com" },
  { role: "Manager", email: "marcus@agiletrack.com" },
  { role: "Developer", email: "emily@agiletrack.com" },
] as const;

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: "easeOut" },
  },
};

// ================================================================
// COMPONENT
// ================================================================

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoggedIn } = useAuth();

  // If already logged in, skip the login page entirely
  useEffect(() => {
    if (isLoggedIn) navigate("/dashboard", { replace: true });
  }, [isLoggedIn, navigate]);

  // ── STEP 2 — REACT HOOK FORM ─────────────────────────────
  // zodResolver connects the Zod schema to React Hook Form
  // form won't call onSubmit unless all schema rules pass
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // ── STEP 3 — TANSTACK MUTATION ───────────────────────────
  // useMutation handles the async API call + loading/error states
  // isPending → show loading state on button
  // isError   → show error message
  // mutate()  → trigger the API call
  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: authApi.login,

    // Only runs if API call succeeded
    onSuccess: (authResponse) => {
      login(authResponse);
      navigate("/dashboard", { replace: true });
    },

    // onError is optional — isError + error handle display below
  });

  // ── FORM SUBMIT ──────────────────────────────────────────
  // handleSubmit runs Zod validation first
  // if validation passes → calls this function with clean data
  // if validation fails  → populates errors, never calls this
  const onSubmit = (data: LoginFormData) => {
    mutate(data);
  };

  const authError = isError ? (error instanceof Error ? error.message : "Sign in failed") : undefined;

  const leftPanelContent = (
    <motion.div
      className="rounded-xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut", delay: 0.1 }}
    >
      <p className="text-sm font-medium text-indigo-100">Quick demo access</p>
      <ul className="mt-4 space-y-3">
        {demoCredentials.map((item) => (
          <li key={item.role} className="flex items-center justify-between gap-3">
            <span className="text-sm text-indigo-50/90">{item.role}:</span>
            <code className="rounded-md bg-white/20 px-2 py-0.5 text-xs font-semibold tracking-tight text-white">
              {item.email}
            </code>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-indigo-100/80">Password for all demo users: <span className="font-semibold text-white">Password@123</span></p>
    </motion.div>
  );

  return (
    <AuthLayout
      panelTitle="Welcome back"
      panelDescription="Continue building amazing products with your team on AgileTrack."
      panelContent={leftPanelContent}
      formTitle="Sign in to your account"
      formSubtitle="Welcome back. Please enter your details."
    >
      <AuthCard>
        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={staggerItem}>
            <FormError message={authError} />
          </motion.div>

          <motion.div variants={staggerItem}>
            <InputField
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              autoFocus
              error={errors.email?.message}
              {...register("email")}
            />
          </motion.div>

          <motion.div variants={staggerItem}>
            <PasswordInput
              id="password"
              label="Password"
              autoComplete="current-password"
              placeholder="Enter your password"
              error={errors.password?.message}
              labelAction={
                <a href="#" className="text-xs font-medium text-indigo-600 transition-colors duration-200 hover:text-indigo-500">
                  Forgot password?
                </a>
              }
              {...register("password")}
            />
          </motion.div>

          <motion.div variants={staggerItem}>
            <Button type="submit" fullWidth isLoading={isPending} loadingText="Signing in...">
              Sign In
            </Button>
          </motion.div>

          <motion.div variants={staggerItem} className="flex items-center gap-3 py-1 text-[11px] uppercase tracking-[0.14em] text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            Or continue with
            <span className="h-px flex-1 bg-slate-200" />
          </motion.div>

          <motion.div variants={staggerItem}>
            <SocialButton text="Sign in with Google" disabled={isPending} />
          </motion.div>
        </motion.form>

        <p className="mt-5 text-center text-sm text-slate-600">
          Don&apos;t have an account? {" "}
          <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Sign up
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}
