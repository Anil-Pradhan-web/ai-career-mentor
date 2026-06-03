"use client";

import React from "react";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Showcase from "@/components/landing/Showcase";
import PlacementStats from "@/components/landing/PlacementStats";
import Pricing from "@/components/landing/Pricing";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background selection:bg-primary selection:text-white">
      {/* Structural Elements */}
      <div className="fixed inset-0 dot-grid -z-20 pointer-events-none opacity-40" />
      
      <Navbar />
      
      <div className="relative z-10">
        <Hero />
        <Features />
        <Showcase />
        <PlacementStats />
        <Pricing />
        <CTA />
      </div>

      <Footer />
    </main>
  );
}