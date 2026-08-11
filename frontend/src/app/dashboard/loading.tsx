"use client";

import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{ minHeight: "70vh", width: "100%" }}
    >
      <div className="relative flex flex-col items-center">
        <div
          className="absolute"
          style={{
            inset: 0,
            background: "rgba(99, 102, 241, 0.15)",
            filter: "blur(50px)",
            borderRadius: "50%",
          }}
        />

        <Loader2
          size={40}
          className="relative animate-spin"
          style={{ color: "var(--brand)" }}
        />

        <h3
          className="relative mt-5 font-display font-semibold gradient-text"
          style={{ fontSize: "1.125rem" }}
        >
          Initializing AI Agents...
        </h3>

        <p
          className="relative mt-2"
          style={{ color: "var(--fg-muted)", fontSize: "0.8125rem" }}
        >
          Preparing your personalized career dashboard
        </p>

        <div
          className="flex flex-col gap-3 mt-10 opacity-40"
          style={{ width: "100%", maxWidth: "600px" }}
        >
          <div className="skeleton" style={{ height: "80px", width: "100%", borderRadius: "var(--radius-lg)" }} />
          <div className="flex gap-3">
            <div className="skeleton" style={{ height: "140px", flex: 1, borderRadius: "var(--radius-lg)" }} />
            <div className="skeleton" style={{ height: "140px", flex: 1, borderRadius: "var(--radius-lg)" }} />
            <div className="skeleton" style={{ height: "140px", flex: 1, borderRadius: "var(--radius-lg)" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
