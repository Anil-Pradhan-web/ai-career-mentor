import React from "react";
import { Upload, ChevronRight, Sparkles } from "lucide-react";

interface Props {
    step: number;
    setStep: (s: number) => void;
    file: File | null;
    resumeText: string;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    role: string;
    setRole: (r: string) => void;
    location: string;
    setLocation: (l: string) => void;
    runAgents: () => void;
    roles: string[];
    locations: string[];
    experienceLevel: string;
    setExperienceLevel: (l: string) => void;
    learningStyle: string;
    setLearningStyle: (s: string) => void;
}

export default function AnalysisWizard({
    step, setStep, file, resumeText, handleFileUpload,
    role, setRole, location, setLocation, runAgents,
    roles, locations,
    experienceLevel, setExperienceLevel,
    learningStyle, setLearningStyle
}: Props) {
    return (
        <div className="w-full max-w-2xl mx-auto p-10 bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-2xl animate-fade-up">
            
            {/* Step Indicator */}
            <div className="flex items-center justify-between mb-12 px-4">
                {[
                    { label: "Resume", s: 1, color: "text-primary" },
                    { label: "Goals", s: 2, color: "text-secondary" },
                    { label: "Analysis", s: 3, color: "text-slate-500" }
                ].map((t, i) => (
                    <React.Fragment key={t.label}>
                        <div className={`flex flex-col items-center gap-2 transition-all duration-500 ${step === t.s ? "opacity-100 scale-110" : "opacity-40"}`}>
                            <div className={`text-[10px] font-black uppercase tracking-[0.2em] ${step === t.s ? t.color : "text-white"}`}>
                                {i + 1}. {t.label}
                            </div>
                            {step === t.s && <div className={`h-1 w-8 rounded-full bg-current ${t.color}`} />}
                        </div>
                        {i < 2 && <ChevronRight size={16} className="text-white/10" />}
                    </React.Fragment>
                ))}
            </div>

            {step === 1 && (
                <div className="animate-fade-up">
                    <label className="group relative flex flex-col items-center justify-center p-16 border-2 border-dashed border-white/10 rounded-[2rem] bg-white/5 hover:bg-white/10 hover:border-primary/30 transition-all cursor-pointer overflow-hidden">
                        <div className="absolute inset-0 bg-radial-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity" />
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Upload size={40} className="text-primary" />
                            </div>
                            <span className="text-xl font-black text-white mb-2 tracking-tight">
                                {file ? file.name : "Select Resume (PDF)"}
                            </span>
                            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">
                                Drag & Drop or Click to browse
                            </p>
                        </div>
                        <input type="file" accept="application/pdf" className="hidden" onChange={handleFileUpload} />
                    </label>

                    <button
                        disabled={!resumeText}
                        onClick={() => setStep(2)}
                        className={`w-full mt-8 py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl ${
                            !resumeText 
                            ? "bg-white/5 text-slate-600 cursor-not-allowed border border-white/5" 
                            : "bg-gradient-to-r from-blue-600 via-blue-500 to-purple-500 text-white hover:shadow-blue-500/30 hover:-translate-y-1 active:scale-95"
                        }`}
                    >
                        Define Career Goals <ChevronRight size={20} />
                    </button>
                </div>
            )}

            {step === 2 && (
                <div className="animate-fade-up space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Target Role</label>
                            <select 
                                value={role} 
                                onChange={(e) => setRole(e.target.value)} 
                                className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white font-bold outline-none focus:border-secondary/50 focus:ring-4 focus:ring-secondary/10 transition-all appearance-none"
                            >
                                {roles.map(r => <option key={r} value={r} className="bg-slate-900">{r}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Preferred Location</label>
                            <select 
                                value={location} 
                                onChange={(e) => setLocation(e.target.value)} 
                                className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white font-bold outline-none focus:border-secondary/50 focus:ring-4 focus:ring-secondary/10 transition-all appearance-none"
                            >
                                {locations.map(l => <option key={l} value={l} className="bg-slate-900">{l}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Roadmap Level</label>
                            <select 
                                value={experienceLevel} 
                                onChange={(e) => setExperienceLevel(e.target.value)} 
                                className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white font-bold outline-none focus:border-secondary/50 focus:ring-4 focus:ring-secondary/10 transition-all appearance-none"
                            >
                                <option value="beginner_to_intermediate" className="bg-slate-900">🌱 Beginner to Intermediate</option>
                                <option value="intermediate_to_advanced" className="bg-slate-900">🚀 Intermediate to Advanced</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Preferred Learning Style</label>
                            <select 
                                value={learningStyle} 
                                onChange={(e) => setLearningStyle(e.target.value)} 
                                className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white font-bold outline-none focus:border-secondary/50 focus:ring-4 focus:ring-secondary/10 transition-all appearance-none"
                            >
                                <option value="balanced" className="bg-slate-900">⚖️ Balanced</option>
                                <option value="practical" className="bg-slate-900">🛠️ Practical / Projects-focused</option>
                                <option value="theory" className="bg-slate-900">📚 Theory-focused</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-6 pt-4">
                        <button 
                            onClick={() => setStep(1)} 
                            className="flex-1 py-4 px-6 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition-all active:scale-95"
                        >
                            Back
                        </button>
                        <button 
                            onClick={runAgents} 
                            className="flex-[2] py-4 px-8 bg-gradient-to-r from-blue-600 via-blue-500 to-purple-500 text-white font-black rounded-xl shadow-2xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 active:scale-95"
                        >
                            Launch AI Agents <Sparkles size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
