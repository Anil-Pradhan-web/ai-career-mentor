import React from "react";
import Link from "next/link";
import { ArrowRight, Play, Shield, Zap, CheckCircle2 } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-28 pb-20 sm:pt-36 sm:pb-28 md:pt-40 md:pb-32 overflow-hidden bg-[#090D16]">
      {/* ── Background Atmospheric Spotlight & Mesh ── */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] pointer-events-none -z-0"
        style={{
          background: "radial-gradient(ellipse 800px 450px at 50% 0%, rgba(59, 130, 246, 0.16), rgba(99, 102, 241, 0.08) 45%, transparent 75%)",
          filter: "blur(30px)",
        }}
      />

      {/* Subtle Geometric Background Grid with Radial Mask */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20 -z-0"
        style={{
          backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 20%, #000 35%, transparent 85%)",
        }}
      />

      {/* Subtle Top Glow Beam */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-[1px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center">
        {/* ── Primary Headline ── */}
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-black tracking-tight leading-[1.08] mb-5 text-white">
          The Career Operating System{" "}
          <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-300 bg-clip-text text-transparent">
            for Modern Engineers
          </span>
        </h1>

        {/* ── Sub-heading ── */}
        <p className="text-base sm:text-lg md:text-xl font-medium text-slate-300 mb-4 tracking-tight max-w-2xl mx-auto">
          Precision Strategy from ATS Diagnostics to Staff-Level Offers.
        </p>

        {/* ── Subtitle Description ── */}
        <p className="text-sm sm:text-base leading-relaxed text-slate-400 max-w-2xl mx-auto mb-9 font-normal">
          Five coordinated AI agents orchestrate your end-to-end career growth — auditing resume impact, engineering targeted syllabus milestones, benchmarking live compensation, and conducting interactive technical interview drills.
        </p>

        {/* ── Action Buttons ── */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-10">
          <Link
            href="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all border border-blue-400/30"
          >
            <span>Get Started Free</span>
            <ArrowRight size={16} />
          </Link>

          <a
            href="#demo"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector("#demo")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-medium text-sm text-slate-300 hover:text-white bg-[#0F172A]/90 hover:bg-[#141E33] border border-slate-700/70 hover:border-slate-600 transition-all shadow-sm"
          >
            <Play size={14} className="text-blue-400 fill-blue-400/20" />
            <span>Explore Platform Demo</span>
          </a>
        </div>

        {/* ── Trust Indicators ── */}
        <div className="inline-flex flex-wrap items-center justify-center gap-4 sm:gap-6 px-4 py-2 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-xs font-medium text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
            <span>100% Free Core Tier</span>
          </div>
          <div className="hidden sm:block text-slate-600">•</div>
          <div className="flex items-center gap-2">
            <Zap size={15} className="text-blue-400 shrink-0" />
            <span>Parallel Real-Time Agents</span>
          </div>
          <div className="hidden sm:block text-slate-600">•</div>
          <div className="flex items-center gap-2">
            <Shield size={15} className="text-indigo-400 shrink-0" />
            <span>Zero Data Sharing & Privacy Protected</span>
          </div>
        </div>
      </div>
    </section>
  );
}
