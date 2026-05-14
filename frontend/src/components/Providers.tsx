"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { ReactNode } from "react";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export function Providers({ children }: { children: ReactNode }) {
  // Always wrap with GoogleOAuthProvider to prevent crash during build/prerender
  // even if the clientId is empty.
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || "dummy-id-for-build"}>
      {children}
    </GoogleOAuthProvider>
  );
}
