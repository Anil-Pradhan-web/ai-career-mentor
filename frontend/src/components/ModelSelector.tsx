"use client";

import { useState, useEffect } from "react";
import { Zap, Sparkles, BrainCircuit } from "lucide-react";

interface ModelSelectorProps {
  onProviderChange?: (provider: string) => void;
  className?: string;
  onlyNvidiaGroq?: boolean;
}

export default function ModelSelector({ onProviderChange, className = "", onlyNvidiaGroq = false }: ModelSelectorProps) {
  const [provider, setProvider] = useState("nvidia");

  useEffect(() => {
    let saved = localStorage.getItem("preferred_provider");
    if (onlyNvidiaGroq && saved === "google") {
      saved = "nvidia";
      localStorage.setItem("preferred_provider", "nvidia");
    }
    
    if (saved) {
      setProvider(saved);
      if (onProviderChange) onProviderChange(saved);
    } else {
      // Default to nvidia if no preference saved
      localStorage.setItem("preferred_provider", "nvidia");
      if (onProviderChange) onProviderChange("nvidia");
    }
  }, [onlyNvidiaGroq]);

  const handleToggle = (newProvider: string) => {
    setProvider(newProvider);
    localStorage.setItem("preferred_provider", newProvider);
    if (onProviderChange) onProviderChange(newProvider);
  };

  return (
    <div className={`flex items-center gap-2 p-1 bg-gray-900/50 border border-gray-800 rounded-lg w-fit ${className}`} style={{
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      padding: '4px',
      background: 'rgba(15, 23, 42, 0.5)',
      border: '1px solid rgba(31, 41, 55, 1)',
      borderRadius: '8px',
      width: 'fit-content'
    }}>
      <button
        onClick={() => handleToggle("nvidia")}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          fontSize: '0.75rem',
          fontWeight: 600,
          borderRadius: '6px',
          transition: 'all 0.2s',
          border: 'none',
          cursor: 'pointer',
          background: provider === "nvidia" ? "linear-gradient(135deg, #76b900 0%, #4c8a00 100%)" : "transparent", // NVIDIA Green gradient
          color: provider === "nvidia" ? "white" : "rgba(156, 163, 175, 1)",
        }}
      >
        <BrainCircuit size={14} />
        NVIDIA NIM (Prod)
      </button>
      <button
        onClick={() => handleToggle("groq")}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          fontSize: '0.75rem',
          fontWeight: 500,
          borderRadius: '6px',
          transition: 'all 0.2s',
          border: 'none',
          cursor: 'pointer',
          background: provider === "groq" ? "var(--brand-gradient, linear-gradient(135deg, #6366f1 0%, #a855f7 100%))" : "transparent",
          color: provider === "groq" ? "white" : "rgba(156, 163, 175, 1)",
        }}
      >
        <Zap size={14} />
        Groq (Fast)
      </button>
      {!onlyNvidiaGroq && (
        <button
          onClick={() => handleToggle("google")}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            fontSize: '0.75rem',
            fontWeight: 500,
            borderRadius: '6px',
            transition: 'all 0.2s',
            border: 'none',
            cursor: 'pointer',
            background: provider === "google" ? "var(--brand-gradient, linear-gradient(135deg, #6366f1 0%, #a855f7 100%))" : "transparent",
            color: provider === "google" ? "white" : "rgba(156, 163, 175, 1)",
          }}
        >
          <Sparkles size={14} />
          Gemini (Backup)
        </button>
      )}
    </div>
  );
}
