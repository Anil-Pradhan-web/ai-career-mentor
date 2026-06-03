"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { ReactNode, useEffect } from "react";
import Lenis from "lenis";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Initialize Lenis smooth scrolling with inertia
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
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

  // Always wrap with GoogleOAuthProvider to prevent crash during build/prerender
  // even if the clientId is empty.
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || "dummy-id-for-build"}>
      {children}
    </GoogleOAuthProvider>
  );
}
