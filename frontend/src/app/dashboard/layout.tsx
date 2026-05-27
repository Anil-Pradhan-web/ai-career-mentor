"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { Menu, X } from "lucide-react";
import VoiceAssistant from "@/components/VoiceAssistant";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [showSidebar, setShowSidebar] = useState(false);

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#020617", position: "relative", overflow: "hidden", color: "#F8FAFC" }}>
            {/* Ambient Background Glows */}
            <div style={{ position: "absolute", top: "0", left: "0", right: "0", bottom: "0", overflow: "hidden", zIndex: 0, pointerEvents: "none" }}>
                <div style={{ position: "absolute", top: "-10%", left: "-5%", width: "40%", height: "40%", background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)", filter: "blur(60px)" }} />
                <div style={{ position: "absolute", bottom: "-10%", right: "-5%", width: "40%", height: "40%", background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)", filter: "blur(60px)" }} />
            </div>

            {/* Global Floating Toggle Button */}
            <button 
                onClick={() => setShowSidebar(!showSidebar)}
                style={{ 
                    position: "fixed",
                    top: "24px",
                    left: showSidebar ? "280px" : "24px",
                    background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "white", 
                    width: "48px",
                    height: "48px",
                    borderRadius: "16px", 
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxShadow: "0 10px 30px rgba(79, 70, 229, 0.3)",
                    zIndex: 200,
                }}
            >
                {showSidebar ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Sidebar Overlay for Mobile/Tablet */}
            {showSidebar && (
                <div 
                    onClick={() => setShowSidebar(false)}
                    style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 100, transition: "opacity 0.3s" }}
                />
            )}

            {/* Collapsible Sidebar */}
            <div style={{ 
                position: "fixed", 
                top: 0, 
                left: showSidebar ? 0 : "-260px", 
                width: "260px", 
                height: "100vh", 
                zIndex: 101, 
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: showSidebar ? "20px 0 50px rgba(0,0,0,0.5)" : "none"
            }}>
                <Sidebar />
            </div>

            {/* Main Content Area */}
            <div style={{ 
                flex: 1, 
                marginLeft: 0, 
                transition: "all 0.4s",
                width: "100%",
                minHeight: "100vh",
                position: "relative",
                zIndex: 1
            }}>
                {children}
            </div>

            {/* Floating Voice Assistant */}
            <VoiceAssistant />
        </div>
    );
}

