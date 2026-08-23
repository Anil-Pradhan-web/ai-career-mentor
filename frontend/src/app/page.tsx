"use client";

import React from "react";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import LogoCloud from "@/components/landing/LogoCloud";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Showcase from "@/components/landing/Showcase";
import InterviewPrep from "@/components/landing/InterviewPrep";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <main className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      <div className="fixed inset-0 dot-grid -z-20 pointer-events-none opacity-30" />
      <Navbar />
      <div className="relative z-10">
        <Hero />
        <LogoCloud />
        <Features />
        <HowItWorks />
        <Showcase />
        <InterviewPrep />
        <Pricing />
        <FAQ />
        <CTA />
      </div>
      <Footer />
    </main>
  );
}
