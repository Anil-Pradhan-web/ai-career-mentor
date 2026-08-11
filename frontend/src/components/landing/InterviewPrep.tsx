"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Code, Brain, RefreshCcw, Sparkles } from "lucide-react";
import { toast } from "react-hot-toast";

const COMPANIES = [
  { name: "Google", logo: "/google.svg" },
  { name: "Microsoft", logo: "/microsoft.svg" },
  { name: "Amazon", logo: "/amazon.svg" },
  { name: "Meta", logo: "/meta.svg" },
  { name: "Netflix", logo: "/netflix.svg" },
  { name: "OpenAI", logo: "/openai.svg" },
  { name: "Salesforce", logo: "/salesforce.svg" },
  { name: "Cisco", logo: "/cisco.svg" },
  { name: "NVIDIA", logo: "/nvidia.svg" },
  { name: "JPMorgan", logo: "/jpmorgan.svg" },
  { name: "Apple", logo: "/apple.svg" },
  { name: "Dell", logo: "/dell.svg" },
  { name: "Flipkart", logo: "/flipkart.svg" },
  { name: "SAP", logo: "/sap.svg" },
  { name: "Spotify", logo: "/spotify.svg" }
];

export default function InterviewPrep() {
  const showInterviewToast = () => {
    toast("Launching interactive mock session", {
      position: "bottom-center",
      style: {
        background: "#0a0a0a",
        color: "#ededed",
        border: "1px solid rgba(59, 130, 246, 0.2)",
        fontSize: "14px",
        fontWeight: "500",
        borderRadius: "12px",
        padding: "12px 20px",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)"
      }
    });
  };

  return (
    <section id="interviews" className="py-24 px-6 relative overflow-hidden" style={{ background: "var(--bg-base)" }}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes wave-pulse {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(1.0); }
        }
        @keyframes float-prep-1 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-7px) scale(1.02); }
        }
        @keyframes float-prep-2 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-5px) scale(0.99); }
        }
        @keyframes float-prep-3 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-8px) scale(1.01); }
        }
        @keyframes float-prep-4 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-4px) scale(0.98); }
        }
        .animate-wave-pulse {
          animation: wave-pulse 1.2s ease-in-out infinite;
        }
        .animate-float-prep-1 {
          animation: float-prep-1 4.2s ease-in-out infinite;
        }
        .animate-float-prep-2 {
          animation: float-prep-2 5.2s ease-in-out infinite;
        }
        .animate-float-prep-3 {
          animation: float-prep-3 4.8s ease-in-out infinite;
        }
        .animate-float-prep-4 {
          animation: float-prep-4 3.8s ease-in-out infinite;
        }
      `}} />

      <div className="absolute pointer-events-none" style={{ top: "50%", left: "25%", transform: "translateY(-50%)", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 70%)", filter: "blur(130px)" }} />
      <div className="absolute pointer-events-none" style={{ top: "33%", right: "25%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(6,182,212,0.04) 0%, transparent 70%)", filter: "blur(110px)" }} />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Top Part: 2-Column */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-center mb-32">
          {/* Left Column */}
          <div className="lg:col-span-5 text-center lg:text-left flex flex-col items-center lg:items-start">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-4 inline-block" style={{ color: "var(--accent-purple)" }}>
              Interactive AI Interview Simulator
            </span>

            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] mb-6 tracking-tight" style={{ color: "var(--fg-primary)" }}>
              Master Your{" "}
              <span className="gradient-text">
                Interviews
              </span>
              ,<br />
              Tailored To Your Resume
            </h2>

            <p className="text-sm sm:text-base leading-relaxed mb-8 max-w-xl" style={{ color: "var(--fg-secondary)" }}>
              Step into simulated rigorous interview sessions. Face custom questions that test your real limits, tailored dynamically to your resume and operational domains of top companies.
            </p>

            <div className="flex flex-col gap-4 text-left w-full max-w-xl mb-10">
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-1" style={{
                  background: "rgba(139,92,246,0.08)",
                  border: "1px solid rgba(139,92,246,0.15)"
                }}>
                  <Brain size={14} style={{ color: "var(--accent-purple)" }} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider mb-1" style={{ color: "var(--fg-primary)" }}>
                    Structured 7-Phase Assessment
                  </h4>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--fg-secondary)" }}>
                    Evaluates you across Tech Stack Discovery, CS/ML Fundamentals, LeetCode coding algorithms, Resume Project Deep-Dives, and complex scale System Designs.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-1" style={{
                  background: "rgba(6,182,212,0.08)",
                  border: "1px solid rgba(6,182,212,0.15)"
                }}>
                  <RefreshCcw size={14} style={{ color: "var(--accent-cyan)" }} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider mb-1" style={{ color: "var(--fg-primary)" }}>
                    Adaptive Questioning (Intelligent Recursion)
                  </h4>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--fg-secondary)" }}>
                    The interviewer adapts on the fly: offering hint structures for incorrect logic, or aggressively digging into optimization when you answer correctly.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-1" style={{
                  background: "rgba(59,130,246,0.08)",
                  border: "1px solid rgba(59,130,246,0.15)"
                }}>
                  <Sparkles size={14} style={{ color: "var(--brand)" }} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider mb-1" style={{ color: "var(--fg-primary)" }}>
                    Role-Tailored Interview Personas
                  </h4>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--fg-secondary)" }}>
                    Face distinct AI personas: a FAANG Senior Staff Engineer focused on clean scale, a startup CTO checking execution speed, or a culture-focused Hiring Manager.
                  </p>
                </div>
              </div>
            </div>

            <Link
              href="/register"
              onClick={showInterviewToast}
              className="btn btn-primary inline-flex items-center gap-3"
              style={{ padding: "16px 32px", fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}
            >
              <span>Start Mock Interview</span>
              <ArrowRight size={14} />
            </Link>

            <div className="flex items-center gap-2.5 text-xs mt-6 font-medium" style={{ color: "var(--fg-muted)" }}>
              <Code size={14} style={{ color: "var(--accent-purple)" }} />
              <span>Powered by WebSockets • Custom Question Pools • Detail Scorecards</span>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-7 relative flex items-center justify-center min-h-[480px] sm:min-h-[520px]">
            <div className="absolute w-[280px] sm:w-[360px] h-[280px] sm:h-[360px] pointer-events-none scale-110" style={{
              background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)",
              filter: "blur(80px)"
            }} />

            {/* Floating Bubbles */}
            <div onClick={showInterviewToast} className="absolute top-[8%] left-[-2%] sm:left-[4%] lg:left-[5%] z-20 max-w-[170px] sm:max-w-[220px] px-4 py-3 rounded-2xl backdrop-blur-md cursor-pointer animate-float-prep-1 transition-all duration-300 hover:scale-105" style={{
              background: "rgba(10,10,10,0.8)",
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "0 12px 30px rgba(0,0,0,0.5)"
            }}>
              <p className="text-[11px] sm:text-xs leading-relaxed font-semibold" style={{ color: "var(--fg-secondary)" }}>
                Tell me about a project achievement from your resume.
              </p>
            </div>

            <div onClick={showInterviewToast} className="absolute bottom-[22%] left-[-8%] sm:left-[0%] lg:left-[0%] z-20 max-w-[170px] sm:max-w-[220px] px-4 py-3 rounded-2xl backdrop-blur-md cursor-pointer animate-float-prep-2 transition-all duration-300 hover:scale-105" style={{
              background: "rgba(10,10,10,0.8)",
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "0 12px 30px rgba(0,0,0,0.5)"
            }}>
              <p className="text-[11px] sm:text-xs leading-relaxed font-semibold" style={{ color: "var(--fg-secondary)" }}>
                Explain database transaction isolation levels.
              </p>
            </div>

            <div onClick={showInterviewToast} className="absolute top-[16%] right-[-2%] sm:right-[4%] lg:right-[5%] z-20 max-w-[170px] sm:max-w-[220px] px-4 py-3 rounded-2xl backdrop-blur-md cursor-pointer animate-float-prep-3 transition-all duration-300 hover:scale-105" style={{
              background: "rgba(10,10,10,0.8)",
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "0 12px 30px rgba(0,0,0,0.5)"
            }}>
              <p className="text-[11px] sm:text-xs leading-relaxed font-semibold" style={{ color: "var(--fg-secondary)" }}>
                Let's design a movie ticket booking platform.
              </p>
            </div>

            <div onClick={showInterviewToast} className="absolute bottom-[18%] right-[-8%] sm:right-[0%] lg:right-[0%] z-20 max-w-[170px] sm:max-w-[220px] px-4 py-3 rounded-2xl backdrop-blur-md cursor-pointer animate-float-prep-4 transition-all duration-300 hover:scale-105" style={{
              background: "rgba(10,10,10,0.8)",
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "0 12px 30px rgba(0,0,0,0.5)"
            }}>
              <p className="text-[11px] sm:text-xs leading-relaxed font-semibold" style={{ color: "var(--fg-secondary)" }}>
                How would you solve the Two Sum challenge?
              </p>
            </div>

            {/* Interview Image */}
            <div onClick={showInterviewToast} className="relative z-10 w-[250px] sm:w-[290px] lg:w-[330px] h-auto rounded-[2rem] overflow-hidden cursor-pointer select-none hover:scale-[1.03] transition-all duration-300 group" style={{
              border: "2px solid rgba(255,255,255,0.08)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
            }}>
              <div className="absolute inset-0 rounded-[2rem] z-10 pointer-events-none" style={{
                background: "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(6,182,212,0.08))"
              }} />
              <img
                src="/interview.png"
                alt="Interactive AI Interview Interface"
                className="w-full h-auto object-cover scale-100 group-hover:scale-[1.02] transition-transform duration-500"
              />
            </div>

            {/* Session Bar */}
            <div onClick={showInterviewToast} className="absolute bottom-[2%] left-1/2 -translate-x-1/2 w-[85%] max-w-[310px] z-30 backdrop-blur-2xl rounded-full px-5 py-3 flex items-center justify-between gap-4 cursor-pointer transition-all duration-300 hover:scale-[1.03]" style={{
              background: "rgba(10,10,10,0.9)",
              border: "1px solid rgba(6,182,212,0.2)",
              boxShadow: "0 15px 35px rgba(0,0,0,0.7)"
            }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{
                background: "rgba(6,182,212,0.08)",
                border: "1px solid rgba(6,182,212,0.15)"
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>

              <div className="flex items-center gap-[3px] h-4 shrink-0">
                <div className="w-[3px] h-3.5 rounded-full animate-wave-pulse origin-center" style={{ background: "var(--accent-cyan)", animationDelay: '0.1s' }} />
                <div className="w-[3px] h-2 rounded-full animate-wave-pulse origin-center" style={{ background: "var(--accent-cyan)", animationDelay: '0.35s' }} />
                <div className="w-[3px] h-4.5 rounded-full animate-wave-pulse origin-center" style={{ background: "var(--accent-cyan)", animationDelay: '0.15s' }} />
                <div className="w-[3px] h-2.5 rounded-full animate-wave-pulse origin-center" style={{ background: "var(--accent-cyan)", animationDelay: '0.45s' }} />
                <div className="w-[3px] h-4 rounded-full animate-wave-pulse origin-center" style={{ background: "var(--accent-cyan)", animationDelay: '0.2s' }} />
                <div className="w-[3px] h-1.5 rounded-full animate-wave-pulse origin-center" style={{ background: "var(--accent-cyan)", animationDelay: '0.3s' }} />
                <div className="w-[3px] h-3 rounded-full animate-wave-pulse origin-center" style={{ background: "var(--accent-cyan)", animationDelay: '0.5s' }} />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black tracking-widest uppercase" style={{ color: "var(--accent-cyan)" }}>
                  Session Live...
                </span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "var(--accent-cyan)" }}></span>
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "var(--accent-cyan)" }}></span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Part: Company Logos */}
        <div className="relative pt-20" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <div className="text-center mb-16">
            <h3 className="font-display text-2xl sm:text-3xl font-black mb-4 tracking-tight" style={{ color: "var(--fg-primary)" }}>
              Practice your interview with top tech companies
            </h3>
            <p className="text-xs sm:text-sm font-medium" style={{ color: "var(--fg-secondary)" }}>
              Simulate questions and formats mapped dynamically to real company roles.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {COMPANIES.map((company) => (
              <div
                key={company.name}
                className="h-24 flex items-center justify-center rounded-2xl p-6 transition-all duration-300 cursor-pointer hover:-translate-y-1.5 group"
                style={{
                  background: "#ffffff",
                  border: "1px solid rgba(0,0,0,0.06)"
                }}
              >
                <img
                  src={company.logo}
                  alt={company.name}
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-all duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
