"use client";
// Copyright (c) 2026 Anil Pradhan. All rights reserved.
// Unauthorized copying of this file, via any medium is strictly prohibited.
// Proprietary and confidential.

import { useState, useEffect } from "react";
import { Zap, BrainCircuit, Sparkles } from "lucide-react";

// Model names that match backend config.py:
//   NVIDIA_MODEL = "deepseek-ai/deepseek-v4-pro"
//   GROQ_MODEL   = "llama-3.3-70b-versatile"
//   GOOGLE_MODEL = "gemini-2.5-flash"
const PROVIDER_LABELS: Record<string, { label: string; model: string; icon: any }> = {
  nvidia: { label: "DeepSeek V4 Pro", model: "deepseek-ai/deepseek-v4-pro", icon: BrainCircuit },
  groq:   { label: "Llama 3.3 70B",   model: "llama-3.3-70b-versatile",      icon: Zap },
  google: { label: "Gemini 2.5 Flash", model: "gemini-2.5-flash",            icon: Sparkles },
};

interface ModelSelectorProps {
  onProviderChange?: (provider: string) => void;
  className?: string;
  allowedProviders?: ("nvidia" | "groq" | "google")[];
  onlyNvidiaGroq?: boolean;
}

export default function ModelSelector({
  onProviderChange,
  className = "",
  allowedProviders,
  onlyNvidiaGroq = false
}: ModelSelectorProps) {
  // Determine effective allowed providers based on props
  let effectiveAllowed: ("nvidia" | "groq" | "google")[] = ["nvidia", "groq", "google"];
  if (allowedProviders) {
    effectiveAllowed = allowedProviders;
  } else if (onlyNvidiaGroq) {
    effectiveAllowed = ["nvidia", "groq"];
  }

  const [provider, setProvider] = useState("nvidia");

  useEffect(() => {
    const saved = localStorage.getItem("preferred_provider");
    
    // If the saved provider is allowed on this page, use it
    if (saved && effectiveAllowed.includes(saved as any)) {
      setProvider(saved);
      if (onProviderChange) onProviderChange(saved);
    } else {
      // Otherwise, select the first allowed provider from the list
      const defaultProv = effectiveAllowed[0] || "nvidia";
      setProvider(defaultProv);
      localStorage.setItem("preferred_provider", defaultProv);
      if (onProviderChange) onProviderChange(defaultProv);
    }
  }, [JSON.stringify(effectiveAllowed)]);

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
      {effectiveAllowed.map(p => {
        const info = PROVIDER_LABELS[p];
        const Icon = info.icon;
        const isActive = provider === p;
        const bgColor = "transparent";
        let activeBg = "transparent";
        let activeColor = "rgba(156, 163, 175, 1)";

        if (isActive) {
          if (p === "nvidia") {
            activeBg = "linear-gradient(135deg, #76b900 0%, #4c8a00 100%)";
            activeColor = "white";
          } else if (p === "groq") {
            activeBg = "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)";
            activeColor = "white";
          } else if (p === "google") {
            activeBg = "linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)";
            activeColor = "white";
          }
        }

        return (
          <button
            key={p}
            onClick={() => handleToggle(p)}
            title={`Model: ${info.model}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              fontSize: '0.75rem',
              fontWeight: isActive ? 700 : 500,
              borderRadius: '6px',
              transition: 'all 0.2s',
              border: 'none',
              cursor: 'pointer',
              background: isActive ? activeBg : bgColor,
              color: isActive ? activeColor : "rgba(156, 163, 175, 1)",
            }}
          >
            <Icon size={14} />
            {info.label}
          </button>
        );
      })}
    </div>
  );
}