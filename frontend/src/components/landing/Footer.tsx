import { motion, type HTMLMotionProps } from "framer-motion";
import { useCallback } from "react";

interface FooterProps {
  onLogin: () => void;
  onGetStarted: () => void;
  motionProps?: Omit<HTMLMotionProps<"footer">, "children">;
}

type FooterLink = {
  label: string;
  action: "section" | "login" | "register" | "external";
  target: string;
};

const footerColumns: { heading: string; links: FooterLink[] }[] = [
  {
    heading: "Product",
    links: [
      { label: "Features", action: "section", target: "features" },
      { label: "Benefits", action: "section", target: "benefits" },
      { label: "Stats", action: "section", target: "stats" },
      { label: "Get Started", action: "register", target: "" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", action: "external", target: "#about" },
      { label: "Blog", action: "external", target: "#blog" },
      { label: "Careers", action: "external", target: "#careers" },
      { label: "Contact", action: "external", target: "#contact" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Documentation", action: "external", target: "#docs" },
      { label: "API Reference", action: "external", target: "#api" },
      { label: "Community", action: "external", target: "#community" },
      { label: "Status", action: "external", target: "#status" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", action: "external", target: "#privacy" },
      { label: "Terms of Service", action: "external", target: "#terms" },
      { label: "Security", action: "external", target: "#security" },
    ],
  },
];

export default function Footer({ onLogin, onGetStarted, motionProps }: FooterProps) {
  const scrollToSection = useCallback((target: string) => {
    const el = document.getElementById(target);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const handleLinkClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, link: FooterLink) => {
      e.preventDefault();
      switch (link.action) {
        case "section":
          scrollToSection(link.target);
          break;
        case "login":
          onLogin();
          break;
        case "register":
          onGetStarted();
          break;
        case "external":
          // For now, scroll to top for placeholder links
          window.scrollTo({ top: 0, behavior: "smooth" });
          break;
      }
    },
    [onLogin, onGetStarted, scrollToSection],
  );

  return (
    <motion.footer
      className="footer"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      {...motionProps}
    >
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand-col">
            <a
              href="#"
              className="footer-brand"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <div className="footer-logo">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path d="M3 6.5V13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M10 4V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M17 5.5V14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <span className="footer-brand-text">AgileTrack</span>
            </a>
            <p className="footer-tagline">Deliver faster with clear sprint orchestration.</p>
            <div className="footer-social">
              {/* Twitter/X */}
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Twitter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </a>
              {/* GitHub */}
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="GitHub">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                </svg>
              </a>
              {/* LinkedIn */}
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="LinkedIn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>
          </div>

          <div className="footer-links-grid">
            {footerColumns.map((col) => (
              <div key={col.heading} className="footer-links-col">
                <h4 className="footer-links-heading">{col.heading}</h4>
                <ul className="footer-links-list">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.action === "section" ? `#${link.target}` : link.target || "#"}
                        className="footer-link"
                        onClick={(e) => handleLinkClick(e, link)}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">© {new Date().getFullYear()} AgileTrack. All rights reserved.</p>
          <nav className="footer-bottom-nav" aria-label="Footer quick actions">
            <button type="button" onClick={onLogin} className="footer-bottom-link">Login</button>
            <button type="button" onClick={onGetStarted} className="footer-bottom-link">Get Started</button>
          </nav>
        </div>
      </div>
    </motion.footer>
  );
}
