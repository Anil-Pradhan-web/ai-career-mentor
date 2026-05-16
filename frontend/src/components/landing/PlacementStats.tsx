"use client";

import React from "react";

const COMPANIES = [
  { name: "Google", logo: "/google.svg" },
  { name: "Microsoft", logo: "/microsoft.svg" },
  { name: "Amazon", logo: "/amazon.svg" },
  { name: "Meta", logo: "/meta.svg" },
  { name: "Netflix", logo: "/netflix.svg" },
  { name: "OpenAI", logo: "/openai.svg" },
  { name: "Salesforce", logo: "/salesforce.svg" },
  { name: "Cisco", logo: "/cisco.svg" },
  { name: "Accenture", logo: "/accenture.svg" },
  { name: "JPMorgan", logo: "/jpmorgan.svg" }
];

export default function PlacementStats() {
  return (
    <section id="placements" className="py-24 px-6 bg-slate-950/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-black text-white mb-4">
            Proven Results. <span className="text-primary">Real Placements.</span>
          </h2>
          <p className="text-slate-400">Our alumni are breaking records year after year.</p>
        </div>

        {/* Graphs Grid Removed */}

        {/* Company Logos Grid */}
        <div className="text-center mb-10">
            <p className="text-[10px] font-bold text-slate-500 tracking-[0.3em] uppercase mb-12">Our Alumni Work At</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {COMPANIES.map((company) => (
                    <div key={company.name} className="h-24 flex items-center justify-center bg-white rounded-2xl p-6 transition-all cursor-pointer shadow-lg shadow-black/20 group hover:-translate-y-2 hover:shadow-primary/20 border border-white/5 hover:border-primary/30">
                        <img 
                          src={company.logo} 
                          alt={company.name} 
                          className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500" 
                        />
                    </div>
                ))}
            </div>
        </div>
      </div>
    </section>
  );
}
