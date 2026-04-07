import type { ReactNode } from "react";

export interface LandingFeature {
  id: string;
  title: string;
  description: string;
  iconLabel: string;
  icon: ReactNode;
  gradient: string;
}

export interface LandingBenefit {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  color: string;
}

export const landingFeatures: LandingFeature[] = [
  {
    id: "kanban",
    title: "Kanban Boards",
    description: "Visualize story flow and move work forward with clear status transitions and drag-and-drop ease.",
    iconLabel: "KB",
    gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="4" rx="1" />
        <rect x="14" y="11" width="7" height="6" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    id: "collaboration",
    title: "Team Collaboration",
    description: "Coordinate across roles with shared visibility, comments, mentions, and role-aware actions.",
    iconLabel: "TC",
    gradient: "linear-gradient(135deg, #06b6d4, #3b82f6)",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: "analytics",
    title: "Analytics & Insights",
    description: "Track sprint velocity, delivery pace, and operational trends with beautiful real-time dashboards.",
    iconLabel: "AI",
    gradient: "linear-gradient(135deg, #f59e0b, #ef4444)",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
        <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
      </svg>
    ),
  },
];

export const landingBenefits: LandingBenefit[] = [
  {
    id: "speed",
    title: "Ship with confidence",
    description: "From project setup to sprint completion, every step stays visible. Know exactly where things stand.",
    color: "#6366f1",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    id: "control",
    title: "Role-aware governance",
    description: "Keep teams productive while preserving secure permission boundaries. Admins, managers, and devs each see what matters.",
    color: "#8b5cf6",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    id: "scale",
    title: "Built for growing teams",
    description: "A clean interface and modular workflows support scale without complexity. From 5 to 500 team members.",
    color: "#06b6d4",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="20" x2="12" y2="10" />
        <line x1="18" y1="20" x2="18" y2="4" />
        <line x1="6" y1="20" x2="6" y2="16" />
      </svg>
    ),
  },
  {
    id: "reliability",
    title: "Reliable delivery rhythm",
    description: "Structured boards and timelines keep priorities aligned sprint after sprint. Never miss a deadline.",
    color: "#10b981",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
];

export const trustedCompanies = [
  "Stripe", "Vercel", "Linear", "Notion", "Figma", "Slack"
];
