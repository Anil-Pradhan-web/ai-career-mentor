import React from "react";

interface Props {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthCard({ children, title, subtitle }: Props) {
  return (
    <div
      className="w-full max-w-md animate-fade-up"
      style={{
        padding: "36px",
        borderRadius: "var(--radius-2xl)",
        background: "var(--bg-card)",
        border: "1px solid var(--border-default)",
        boxShadow: "0 24px 48px rgba(0, 0, 0, 0.5)",
      }}
    >
      <div className="mb-7 text-center">
        <h1 className="font-display font-bold mb-1.5" style={{ fontSize: "1.5rem", color: "var(--fg-primary)", letterSpacing: "-0.03em" }}>
          {title}
        </h1>
        <p style={{ color: "var(--fg-secondary)", fontSize: "0.8125rem" }}>{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
