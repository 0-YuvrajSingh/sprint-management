import { motion, type HTMLMotionProps } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import Button from "../ui/Button";

interface NavbarProps {
  onLogin: () => void;
  onGetStarted: () => void;
  ctaLoading?: boolean;
  motionProps?: Omit<HTMLMotionProps<"header">, "children">;
}

const navLinks = [
  { label: "Features", target: "features" },
  { label: "Benefits", target: "benefits" },
  { label: "Stats", target: "stats" },
] as const;

export default function Navbar({
  onLogin,
  onGetStarted,
  ctaLoading = false,
  motionProps,
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 10);

      // Determine active section
      let current: string | null = null;
      for (const { target } of navLinks) {
        const el = document.getElementById(target);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120) {
            current = target;
          }
        }
      }
      setActiveSection(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToSection = useCallback((e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    e.preventDefault();
    const el = document.getElementById(target);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <motion.header
      className={`navbar ${isScrolled ? "navbar--scrolled" : ""}`}
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      {...motionProps}
    >
      <div className="navbar-inner">
        <a
          href="#"
          className="navbar-brand"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <div className="navbar-logo">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 6.5V13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M10 4V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M17 5.5V14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span className="navbar-brand-text">AgileTrack</span>
        </a>

        <nav className="navbar-nav" aria-label="Main navigation">
          {navLinks.map(({ label, target }) => (
            <a
              key={target}
              href={`#${target}`}
              className={`navbar-link ${activeSection === target ? "navbar-link--active" : ""}`}
              onClick={(e) => scrollToSection(e, target)}
            >
              {label}
            </a>
          ))}
        </nav>

        <nav className="navbar-actions" aria-label="Authentication navigation">
          <Button variant="ghost" size="sm" onClick={onLogin}>
            Login
          </Button>
          <Button size="sm" onClick={onGetStarted} isLoading={ctaLoading} loadingText="Redirecting...">
            Get Started
          </Button>
        </nav>
      </div>
    </motion.header>
  );
}
