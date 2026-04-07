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
import FormHelperText from "../features/auth/components/FormHelperText";
import InputField from "../features/auth/components/InputField";
import PasswordInput from "../features/auth/components/PasswordInput";

const registerSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const registerBenefits = [
  "Unlimited projects and sprints",
  "Advanced kanban boards",
  "Real-time collaboration",
  "Role-based access control",
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

export default function RegisterPage() {
  const navigate = useNavigate();
  const { isLoggedIn, login } = useAuth();

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/dashboard", { replace: true });
    }
  }, [isLoggedIn, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: async (payload: RegisterFormData) => {
      await authApi.register({
        name: payload.fullName,
        email: payload.email,
        password: payload.password,
      });

      const authResponse = await authApi.login({
        email: payload.email,
        password: payload.password,
      });

      return authResponse;
    },
    onSuccess: (authResponse) => {
      login(authResponse);
      navigate("/dashboard", { replace: true });
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    mutate(data);
  };

  const authError = isError
    ? (error instanceof Error ? error.message : "Registration failed")
    : undefined;

  const leftPanelContent = (
    <ul className="space-y-4">
      {registerBenefits.map((benefit) => (
        <li key={benefit} className="flex items-start gap-3 text-indigo-100">
          <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/40 bg-white/10 text-xs">
            ✓
          </span>
          <span className="text-base">{benefit}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <AuthLayout
      panelTitle="Join thousands of teams"
      panelDescription="Ship faster, collaborate better, and deliver amazing products with AgileTrack."
      panelContent={leftPanelContent}
      formTitle="Create your account"
      formSubtitle="Start managing your projects today."
      reverseOnDesktop
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
              id="fullName"
              label="Full Name"
              type="text"
              placeholder="Sarah Chen"
              autoComplete="name"
              autoFocus
              error={errors.fullName?.message}
              {...register("fullName")}
            />
          </motion.div>

          <motion.div variants={staggerItem}>
            <InputField
              id="email"
              label="Email"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register("email")}
            />
          </motion.div>

          <motion.div variants={staggerItem}>
            <PasswordInput
              id="password"
              label="Password"
              placeholder="Create a strong password"
              autoComplete="new-password"
              error={errors.password?.message}
              {...register("password")}
            />
          </motion.div>

          <motion.div variants={staggerItem}>
            <PasswordInput
              id="confirmPassword"
              label="Confirm Password"
              placeholder="Confirm your password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />
          </motion.div>

          <motion.div variants={staggerItem}>
            <Button type="submit" fullWidth isLoading={isPending} loadingText="Creating account...">
              Create Account
            </Button>
          </motion.div>

          <motion.p variants={staggerItem} className="mt-5 text-center text-sm text-slate-600">
            Already have an account? {" "}
            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </motion.p>

          <motion.div variants={staggerItem} className="mt-5 border-t border-slate-200 pt-4 text-center">
            <FormHelperText>
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </FormHelperText>
          </motion.div>
        </motion.form>
      </AuthCard>
    </AuthLayout>
  );
}
