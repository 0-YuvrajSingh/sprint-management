import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import CTASection from "../components/landing/CTASection";
import FeatureCard from "../components/landing/FeatureCard";
import Footer from "../components/landing/Footer";
import HeroSection from "../components/landing/HeroSection";
import Navbar from "../components/landing/Navbar";
import RevealOnScroll, { revealItem } from "../components/landing/RevealOnScroll";
import { landingBenefits, landingFeatures, trustedCompanies } from "../components/landing/landingData";
import { useAuth } from "../context/AuthContext";
import "./LandingPage.css";

type RedirectTarget = "login" | "register";

interface LandingStat {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

interface AnimatedStatValueProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

const landingStats: LandingStat[] = [
  { value: 99.9, decimals: 1, suffix: "%", label: "Uptime SLA" },
  { value: 2400, suffix: "+", label: "Active Teams" },
  { value: 50, suffix: "M+", label: "Stories Managed" },
  { value: 4.9, decimals: 1, suffix: "/5", label: "User Rating" },
];

function AnimatedStatValue({ value, prefix = "", suffix = "", decimals = 0 }: AnimatedStatValueProps) {
  const valueRef = useRef<HTMLSpanElement | null>(null);
  const isInView = useInView(valueRef, { once: true, amount: 0.65 });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) {
      return;
    }

    const durationMs = 1100;
    let animationFrameId = 0;
    let startTime: number | null = null;

    const updateValue = (timestamp: number) => {
      if (startTime == null) {
        startTime = timestamp;
      }

      const progress = Math.min((timestamp - startTime) / durationMs, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(value * easedProgress);

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(updateValue);
      }
    };

    animationFrameId = window.requestAnimationFrame(updateValue);
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [isInView, value]);

  const rounded = decimals > 0 ? Number(displayValue.toFixed(decimals)) : Math.round(displayValue);
  const formatted = decimals > 0
    ? rounded.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : rounded.toLocaleString();

  return (
    <span ref={valueRef}>
      {prefix}{formatted}{suffix}
    </span>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [redirectingTo, setRedirectingTo] = useState<RedirectTarget | null>(null);
  const redirectTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/dashboard", { replace: true });
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current != null) {
        window.clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  const navigateWithFeedback = (target: RedirectTarget) => {
    if (redirectTimerRef.current != null) {
      window.clearTimeout(redirectTimerRef.current);
    }

    setRedirectingTo(target);
    redirectTimerRef.current = window.setTimeout(() => {
      navigate(target === "login" ? "/login" : "/register");
    }, 220);
  };

  return (
    <div className="landing-page">
      <Navbar
        onLogin={() => navigateWithFeedback("login")}
        onGetStarted={() => navigateWithFeedback("register")}
        ctaLoading={redirectingTo === "register"}
      />

      <main className="landing-main">
        <HeroSection
          onLogin={() => navigateWithFeedback("login")}
          onGetStarted={() => navigateWithFeedback("register")}
          ctaLoading={redirectingTo === "register"}
        />

        {/* Trusted By Section */}
        <RevealOnScroll className="trusted-section">
          <motion.p variants={revealItem} className="trusted-label">
            Trusted by teams at
          </motion.p>
          <motion.div variants={revealItem} className="trusted-logos">
            {trustedCompanies.map((company) => (
              <div key={company} className="trusted-logo">
                {company}
              </div>
            ))}
          </motion.div>
        </RevealOnScroll>

        {/* Features Section */}
        <RevealOnScroll id="features" className="section-features" staggerChildren={0.1}>
          <motion.div variants={revealItem} className="section-header">
            <span className="section-label">Features</span>
            <h2 className="section-title">Everything you need to ship faster</h2>
            <p className="section-subtitle">
              Focused modules for planning, collaboration, and delivery insight — all in one platform.
            </p>
          </motion.div>

          <motion.div variants={revealItem} className="features-grid" aria-label="Platform features">
            {landingFeatures.map((feature) => (
              <motion.div key={feature.id} variants={revealItem}>
                <FeatureCard
                  title={feature.title}
                  description={feature.description}
                  iconLabel={feature.iconLabel}
                  icon={feature.icon}
                  gradient={feature.gradient}
                />
              </motion.div>
            ))}
          </motion.div>
        </RevealOnScroll>

        {/* Benefits Section */}
        <RevealOnScroll id="benefits" className="section-benefits" staggerChildren={0.08}>
          <motion.div variants={revealItem} className="section-header">
            <span className="section-label">Benefits</span>
            <h2 className="section-title">Built for teams of all sizes</h2>
            <p className="section-subtitle">
              Whether you're a startup or an enterprise, AgileTrack adapts to your workflow.
            </p>
          </motion.div>

          <motion.ul variants={revealItem} className="benefits-grid" aria-label="Benefits list">
            {landingBenefits.map((benefit) => (
              <motion.li
                key={benefit.id}
                variants={revealItem}
                className="benefit-card"
                whileHover={{
                  y: -6,
                  scale: 1.01,
                  boxShadow: "0 24px 50px -20px rgba(15, 23, 42, 0.14)",
                  transition: { duration: 0.2, ease: "easeOut" },
                }}
              >
                <div className="benefit-icon" style={{ color: benefit.color, backgroundColor: `${benefit.color}15` }}>
                  {benefit.icon}
                </div>
                <div className="benefit-content">
                  <h3 className="benefit-title">{benefit.title}</h3>
                  <p className="benefit-desc">{benefit.description}</p>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        </RevealOnScroll>

        {/* Stats Section */}
        <RevealOnScroll id="stats" className="stats-section" staggerChildren={0.1}>
          <motion.div variants={revealItem} className="stats-grid">
            {landingStats.map((stat) => (
              <motion.div key={stat.label} variants={revealItem} className="stat-item">
                <div className="stat-value">
                  <AnimatedStatValue
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    decimals={stat.decimals}
                  />
                </div>
                <div className="stat-label">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </RevealOnScroll>

        <CTASection
          onLogin={() => navigateWithFeedback("login")}
          onGetStarted={() => navigateWithFeedback("register")}
          ctaLoading={redirectingTo === "register"}
        />
      </main>

      <Footer
        onLogin={() => navigateWithFeedback("login")}
        onGetStarted={() => navigateWithFeedback("register")}
      />
    </div>
  );
}
