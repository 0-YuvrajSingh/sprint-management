import { motion, type HTMLMotionProps } from "framer-motion";

interface FeatureCardProps {
  title: string;
  description: string;
  iconLabel: string;
  icon: React.ReactNode;
  gradient: string;
  motionProps?: Omit<HTMLMotionProps<"article">, "children">;
}

export default function FeatureCard({ title, description, icon, gradient, motionProps }: FeatureCardProps) {
  return (
    <motion.article
      className="feature-card"
      whileHover={{
        y: -6,
        scale: 1.01,
        boxShadow: "0 26px 56px -22px rgba(99, 102, 241, 0.22)",
        transition: { duration: 0.2, ease: "easeOut" },
      }}
      {...motionProps}
    >
      <div className="feature-card-glow" style={{ background: gradient }} />
      <div className="feature-card-inner">
        <div className="feature-card-icon" style={{ background: gradient }}>
          {icon}
        </div>
        <h3 className="feature-card-title">{title}</h3>
        <p className="feature-card-desc">{description}</p>
        <div className="feature-card-link">
          Learn more
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 10L9 7L5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </motion.article>
  );
}
