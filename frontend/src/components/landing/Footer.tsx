import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-20 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
        <div className="max-w-sm">
          <Link href="/" className="flex items-center gap-3 no-underline mb-6">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-display font-extrabold text-xl text-white tracking-tight">
              CareerMentor<span className="text-primary">.ai</span>
            </span>
          </Link>
          <p className="text-slate-500 leading-relaxed mb-8">
            The world's first multi-agent career operating system. Built by engineers, for engineers.
          </p>
          <div className="flex gap-4">
             {["Twitter", "Discord", "LinkedIn", "GitHub"].map(social => (
               <Link key={social} href="#" className="text-slate-600 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">{social}</Link>
             ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-20">
          <div>
            <h4 className="text-white font-bold mb-6">Platform</h4>
            <div className="flex flex-col gap-4 text-slate-500 text-sm">
              <Link href="#" className="hover:text-primary transition-colors">AI Agents</Link>
              <Link href="#" className="hover:text-primary transition-colors">Pricing</Link>
              <Link href="#" className="hover:text-primary transition-colors">API Docs</Link>
            </div>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Company</h4>
            <div className="flex flex-col gap-4 text-slate-500 text-sm">
              <Link href="#" className="hover:text-primary transition-colors">About Us</Link>
              <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
            </div>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Support</h4>
            <div className="flex flex-col gap-4 text-slate-500 text-sm">
              <Link href="#" className="hover:text-primary transition-colors">Help Center</Link>
              <Link href="#" className="hover:text-primary transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">
        <div>© 2026 AI Career Mentor. All rights reserved.</div>
        <div className="flex items-center gap-2">
           <span>Designed & Developed by</span>
           <span className="text-white bg-white/5 px-3 py-1 rounded-lg border border-white/10 italic">Anil Pradhan</span>
        </div>
      </div>
    </footer>
  );
}
