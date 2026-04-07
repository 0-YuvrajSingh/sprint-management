import { motion, type HTMLMotionProps } from "framer-motion";
import Button from "../ui/Button";

interface HeroSectionProps {
  onLogin: () => void;
  onGetStarted: () => void;
  ctaLoading?: boolean;
  motionProps?: Omit<HTMLMotionProps<"section">, "children">;
}

const heroItem = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
} as const;

export default function HeroSection({ onLogin, onGetStarted, ctaLoading = false, motionProps }: HeroSectionProps) {
  return (
    <motion.section
      className="hero-section"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0, y: 14 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.4, ease: "easeOut", staggerChildren: 0.1 },
        },
      }}
      {...motionProps}
    >
      {/* Animated gradient mesh background */}
      <div className="hero-bg-mesh">
        <motion.div
          className="hero-orb hero-orb--indigo"
          animate={{ scale: [1, 1.15, 1], x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="hero-orb hero-orb--violet"
          animate={{ scale: [1, 1.1, 1], x: [0, -25, 0], y: [0, 15, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="hero-orb hero-orb--cyan"
          animate={{ scale: [1, 1.2, 1], x: [0, 20, 0], y: [0, 25, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="hero-grid-pattern" />
      </div>

      <div className="hero-content">
        <motion.p variants={heroItem} className="hero-badge">
          <span className="hero-badge-dot" />
          <span className="hero-badge-text">Now with AI-powered insights</span>
          <span className="hero-badge-arrow">→</span>
        </motion.p>

        <motion.h1 variants={heroItem} className="hero-title">
          Ship products faster with
          <span className="hero-title-gradient"> intelligent sprints</span>
        </motion.h1>

        <motion.p variants={heroItem} className="hero-subtitle">
          AgileTrack helps teams plan, track, and ship faster. From startups to enterprise programs,
          organize delivery with a clean workflow and role-based control.
        </motion.p>

        <motion.div variants={heroItem} className="hero-cta-row">
          <Button size="lg" onClick={onGetStarted} isLoading={ctaLoading} loadingText="Redirecting..." className="hero-cta-primary">
            Get Started Free
          </Button>
          <Button variant="secondary" size="lg" onClick={onLogin} className="hero-cta-secondary">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Watch Demo
          </Button>
        </motion.div>

        <motion.div variants={heroItem} className="hero-social-proof">
          <div className="hero-avatars">
            {["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"].map((color, i) => (
              <div key={i} className="hero-avatar" style={{ backgroundColor: color, zIndex: 5 - i }}>
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          <div className="hero-social-proof-text">
            <span className="hero-social-proof-number">2,400+</span> teams already shipping faster
          </div>
        </motion.div>
      </div>

      {/* Dashboard preview */}
      <motion.div
        variants={heroItem}
        className="hero-preview"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="hero-preview-window">
            <div className="hero-preview-titlebar">
              <div className="hero-preview-dots">
                <span style={{ background: "#ff5f57" }} />
                <span style={{ background: "#febc2e" }} />
                <span style={{ background: "#28c840" }} />
              </div>
              <div className="hero-preview-url">agiletrack.app/dashboard</div>
            </div>
            <div className="hero-preview-content">
              {/* Mini dashboard mockup */}
              <div className="hero-dash-sidebar">
                <div className="hero-dash-logo">A</div>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`hero-dash-nav-item ${i === 0 ? "active" : ""}`} />
                ))}
              </div>
              <div className="hero-dash-main">
                <div className="hero-dash-topbar">
                  <div className="hero-dash-search" />
                  <div className="hero-dash-user" />
                </div>
                <div className="hero-dash-cards">
                  {[
                    { label: "Active Sprints", value: "12", color: "#6366f1" },
                    { label: "Stories Done", value: "148", color: "#10b981" },
                    { label: "Velocity", value: "94%", color: "#8b5cf6" },
                  ].map((card) => (
                    <div key={card.label} className="hero-dash-stat">
                      <div className="hero-dash-stat-value" style={{ color: card.color }}>{card.value}</div>
                      <div className="hero-dash-stat-label">{card.label}</div>
                    </div>
                  ))}
                </div>
                <div className="hero-dash-board">
                  {["To Do", "In Progress", "Review", "Done"].map((col) => (
                    <div key={col} className="hero-dash-column">
                      <div className="hero-dash-column-title">{col}</div>
                      {[...Array(col === "In Progress" ? 3 : col === "Done" ? 2 : col === "Review" ? 1 : 2)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="hero-dash-card-item"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.8 + (i * 0.15), duration: 0.3 }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Glow under preview */}
          <div className="hero-preview-glow" />
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
