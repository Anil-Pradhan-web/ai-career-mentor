import React from "react";
import { Loader2 } from "lucide-react";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: "primary" | "secondary";
}

export default function AuthButton({ children, loading, variant = "primary", ...props }: Props) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className="btn btn-lg w-full"
      style={{
        padding: "14px",
        fontSize: "0.875rem",
        fontWeight: 700,
        borderRadius: "var(--radius-md)",
        letterSpacing: "0.02em",
        ...(variant === "primary"
          ? {
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
              color: "#fff",
              boxShadow: "0 4px 16px rgba(99, 102, 241, 0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
              border: "none",
            }
          : {
              background: "var(--bg-muted)",
              color: "var(--fg-secondary)",
              border: "1px solid var(--border-default)"
            }),
        opacity: loading || props.disabled ? 0.6 : 1,
        cursor: loading || props.disabled ? "not-allowed" : "pointer",
        transition: "all 0.2s ease",
      }}
    >
      {loading ? <Loader2 className="animate-spin" size={16} /> : children}
    </button>
  );
}
