"use client";

import React from "react";

const COMPANIES = [
  { name: "Google", logo: "/google.svg", filter: "" },
  { name: "Microsoft", logo: "/microsoft.svg", filter: "" },
  { name: "Amazon", logo: "/amazon.svg", filter: "brightness-0 invert" },
  { name: "Meta", logo: "/meta.svg", filter: "" },
  { name: "Netflix", logo: "/netflix.svg", filter: "" },
  { name: "OpenAI", logo: "/openai.svg", filter: "brightness-0 invert" },
  { name: "Salesforce", logo: "/salesforce.svg", filter: "" },
  { name: "Cisco", logo: "/cisco.svg", filter: "brightness-0 invert" },
  { name: "NVIDIA", logo: "/nvidia.svg", filter: "" },
  { name: "JPMorgan", logo: "/jpmorgan.svg", filter: "brightness-0 invert" },
  { name: "Apple", logo: "/apple.svg", filter: "brightness-0 invert" },
  { name: "Dell", logo: "/dell.svg", filter: "brightness-0 invert" },
  { name: "Flipkart", logo: "/flipkart.svg", filter: "" },
  { name: "SAP", logo: "/sap.svg", filter: "" },
  { name: "Spotify", logo: "/spotify.svg", filter: "" }
];

export default function PlacementStats() {
  return (
    <section id="placements" className="py-32 px-6 relative overflow-hidden bg-slate-950/20">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/5 via-secondary/5 to-transparent blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20 relative">
          <h2 className="font-display text-4xl sm:text-5xl font-black text-white mb-6 tracking-tight">
            Proven Results. <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Real Placements.</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Our alumni are breaking records year after year, securing high-impact engineering and leadership roles globally.
          </p>
        </div>

        {/* Company Logos Grid */}
        <div className="text-center mb-10">
          <p className="text-[9px] font-black text-slate-500 tracking-[0.3em] uppercase mb-12">Our Alumni Work At</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {COMPANIES.map((company) => (
              <div 
                key={company.name} 
                className="h-24 flex items-center justify-center bg-[#090d16]/30 rounded-2xl p-6 transition-all duration-300 cursor-pointer shadow-lg border border-white/5 hover:border-primary/20 hover:bg-[#090d16]/60 hover:-translate-y-1.5 group"
              >
                <img
                  src={company.logo}
                  alt={company.name}
                  className={`max-h-full max-w-full object-contain group-hover:scale-105 transition-all duration-300 opacity-60 group-hover:opacity-100 ${company.filter}`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
