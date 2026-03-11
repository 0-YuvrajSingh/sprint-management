import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import authApi from "../api/auth.api";
import { useAuth } from "../context/AuthContext";

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

// ================================================================
// COMPONENT
// ================================================================

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoggedIn } = useAuth();

  // If already logged in, skip the login page entirely
  useEffect(() => {
    if (isLoggedIn) navigate("/projects", { replace: true });
  }, [isLoggedIn, navigate]);

  // ── STEP 2 — REACT HOOK FORM ─────────────────────────────
  // zodResolver connects the Zod schema to React Hook Form
  // form won't call onSubmit unless all schema rules pass
  const {
    register,         // connects <input> to the form
    handleSubmit,     // wraps onSubmit — only fires if validation passes
    formState: { errors }, // per-field error messages from Zod
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
      login(authResponse);        // save token + set user in AuthContext
      navigate("/projects", { replace: true }); // redirect
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

  // ================================================================
  // RENDER
  // ================================================================

  return (
    <div style={styles.root}>
      <div style={styles.card}>

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logo}>S</div>
          <h1 style={styles.title}>SprintMS</h1>
          <p style={styles.subtitle}>Sign in to your workspace</p>
        </div>

        {/* API error banner — only shows if mutation failed */}
        {isError && (
          <div style={styles.errorBanner}>
            {error instanceof Error ? error.message : "Login failed"}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} style={styles.form} noValidate>

          {/* Email field */}
          <div style={styles.field}>
            <label style={styles.label} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              style={{
                ...styles.input,
                // Red border if this field has a validation error
                ...(errors.email ? styles.inputError : {}),
              }}
              // register() connects this input to React Hook Form
              // it handles value, onChange, onBlur automatically
              {...register("email")}
            />
            {/* Per-field error from Zod — only shows after submit attempt */}
            {errors.email && (
              <span style={styles.fieldError}>{errors.email.message}</span>
            )}
          </div>

          {/* Password field */}
          <div style={styles.field}>
            <label style={styles.label} htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              style={{
                ...styles.input,
                ...(errors.password ? styles.inputError : {}),
              }}
              {...register("password")}
            />
            {errors.password && (
              <span style={styles.fieldError}>{errors.password.message}</span>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isPending}
            style={{
              ...styles.button,
              ...(isPending ? styles.buttonDisabled : {}),
            }}
          >
            {isPending ? "Signing in..." : "Sign in"}
          </button>

        </form>
      </div>
    </div>
  );
}

// ================================================================
// STYLES
// Inline styles keep this file self-contained — no CSS file needed
// Replace with your CSS framework classes if you add one later
// ================================================================

const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f0f14",
    fontFamily: "'JetBrains Mono', monospace",
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    backgroundColor: "#1a1a24",
    border: "1px solid #2a2a3a",
    borderRadius: "8px",
    padding: "40px",
  },
  header: {
    textAlign: "center",
    marginBottom: "32px",
  },
  logo: {
    width: "48px",
    height: "48px",
    backgroundColor: "#e8ff47",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    fontWeight: "800",
    color: "#0f0f14",
    margin: "0 auto 16px",
  },
  title: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#e2e2e8",
    margin: "0 0 8px",
  },
  subtitle: {
    fontSize: "13px",
    color: "#5a5a72",
    margin: 0,
  },
  errorBanner: {
    backgroundColor: "rgba(255,77,109,0.1)",
    border: "1px solid rgba(255,77,109,0.3)",
    borderRadius: "4px",
    padding: "10px 14px",
    fontSize: "12px",
    color: "#ff4d6d",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "11px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
    color: "#5a5a72",
  },
  input: {
    backgroundColor: "#0f0f14",
    border: "1px solid #2a2a3a",
    borderRadius: "4px",
    padding: "10px 12px",
    fontSize: "13px",
    color: "#e2e2e8",
    outline: "none",
    fontFamily: "inherit",
    transition: "border-color 0.15s",
  },
  inputError: {
    borderColor: "#ff4d6d",
  },
  fieldError: {
    fontSize: "11px",
    color: "#ff4d6d",
  },
  button: {
    padding: "12px",
    backgroundColor: "#e8ff47",
    color: "#0f0f14",
    border: "none",
    borderRadius: "4px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    fontFamily: "inherit",
    marginTop: "4px",
    transition: "opacity 0.15s",
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
};
