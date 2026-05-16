import React from "react";

interface Props {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthCard({ children, title, subtitle }: Props) {
  return (
    <div className="w-full max-w-md p-10 rounded-3xl bg-surface backdrop-blur-3xl border border-border shadow-2xl animate-fade-up">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-white mb-2 font-display">
          {title}
        </h1>
        <p className="text-slate-400 text-sm">
          {subtitle}
        </p>
      </div>
      {children}
    </div>
  );
}
