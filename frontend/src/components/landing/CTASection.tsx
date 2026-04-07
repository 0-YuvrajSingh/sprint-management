import { motion, type HTMLMotionProps } from "framer-motion";
import Button from "../ui/Button";

interface CTASectionProps {
  onGetStarted: () => void;
  onLogin: () => void;
  ctaLoading?: boolean;
  motionProps?: Omit<HTMLMotionProps<"section">, "children">;
}

export default function CTASection({ onGetStarted, onLogin, ctaLoading = false, motionProps }: CTASectionProps) {
  return (
    <motion.section
      className="cta-section"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      {...motionProps}
    >
      {/* Animated gradient mesh */}
      <div className="cta-bg-mesh">
        <motion.div
          className="cta-orb cta-orb--1"
          animate={{ scale: [1, 1.15, 1], x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="cta-orb cta-orb--2"
          animate={{ scale: [1, 1.1, 1], x: [0, -30, 0], y: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="cta-gradient-shift"
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Top shimmer line */}
      <motion.div
        className="cta-shimmer"
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="cta-content">
        <p className="cta-label">Ready to level up?</p>
        <h2 className="cta-title">
          Build better sprints with <br className="hidden sm:inline" />less friction
        </h2>
        <p className="cta-desc">
          Join thousands of teams that use AgileTrack to streamline project planning,
          sprint execution, and delivery visibility.
        </p>

        <div className="cta-actions">
          <Button
            size="lg"
            onClick={onGetStarted}
            isLoading={ctaLoading}
            loadingText="Redirecting..."
            className="cta-btn-primary"
          >
            Start Free Trial
          </Button>
          <Button size="lg" variant="secondary" onClick={onLogin} className="cta-btn-secondary">
            Login
          </Button>
        </div>

        <p className="cta-note">No credit card required · 14-day free trial · Cancel anytime</p>
      </div>
    </motion.section>
  );
}
