"use client";

// Intercept and suppress Recharts / React 18 defaultProps deprecation warnings globally
if (typeof window !== "undefined") {
  const originalError = console.error;
  console.error = (...args) => {
    if (args[0] && typeof args[0] === "string" && (args[0].includes("defaultProps") || args[0].includes("Support for defaultProps"))) {
      return;
    }
    originalError(...args);
  };

  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (args[0] && typeof args[0] === "string" && (args[0].includes("defaultProps") || args[0].includes("Support for defaultProps"))) {
      return;
    }
    originalWarn(...args);
  };
}

import { GoogleOAuthProvider } from "@react-oauth/google";
import { ReactNode, useEffect } from "react";
import Lenis from "lenis";
import MobileBlocker from "./MobileBlocker";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Initialize Lenis smooth scrolling with inertia
    const lenis = new Lenis({
      duration: 0.9,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.8,
      touchMultiplier: 2.0,
    });

    let animationFrameId: number;

    function raf(time: number) {
      lenis.raf(time);
      animationFrameId = requestAnimationFrame(raf);
    }

    animationFrameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animationFrameId);
      lenis.destroy();
    };
  }, []);

  // Auto-reload on deployment chunk mismatches (ChunkLoadError / 404 on stale hash)
  useEffect(() => {
    const handleChunkError = (event: ErrorEvent | PromiseRejectionEvent) => {
      const err = "error" in event ? event.error : (event as PromiseRejectionEvent).reason;
      const msg = err?.message || (typeof err === "string" ? err : "");
      const isChunkError =
        err?.name === "ChunkLoadError" ||
        msg.includes("Loading chunk") ||
        msg.includes("ChunkLoadError") ||
        msg.includes("Failed to fetch dynamically imported module") ||
        msg.includes("Refused to execute script");

      if (isChunkError) {
        const lastReload = sessionStorage.getItem("app_chunk_reload_ts");
        const now = Date.now();
        // Guard: only auto-reload at most once every 10 seconds
        if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
          sessionStorage.setItem("app_chunk_reload_ts", now.toString());
          window.location.reload();
        }
      }
    };

    window.addEventListener("error", handleChunkError);
    window.addEventListener("unhandledrejection", handleChunkError);

    return () => {
      window.removeEventListener("error", handleChunkError);
      window.removeEventListener("unhandledrejection", handleChunkError);
    };
  }, []);

  // Always wrap with GoogleOAuthProvider to prevent crash during build/prerender
  // even if the clientId is empty.
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || "dummy-id-for-build"}>
      <MobileBlocker />
      {children}
    </GoogleOAuthProvider>
  );
}
