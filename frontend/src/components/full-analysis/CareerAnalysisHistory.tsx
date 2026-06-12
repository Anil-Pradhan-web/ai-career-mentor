import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { History, Trash2, X, BrainCircuit, MapPin, Clock } from "lucide-react";

interface Props {
    history: any[];
    onSelect: (analysis: any) => void;
    onDelete: (id: string) => void;
    onClose: () => void;
}

export default function CareerAnalysisHistory({ history, onSelect, onDelete, onClose }: Props) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Prevent body from scrolling behind the history modal
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "unset";
        };
    }, []);

    if (!mounted) return null;

    return createPortal(
        <div style={{
            position: "fixed", top: 0, left: 0, width: "100%", height: "100vh",
            background: "rgba(2, 6, 23, 0.8)", backdropFilter: "blur(12px)",
            zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
        }}>
            <div style={{
                width: "100%", maxWidth: "650px", background: "#0f172a", borderRadius: "28px",
                border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.6)",
                overflow: "hidden", display: "flex", flexDirection: "column", maxHeight: "80vh"
            }}>
                {/* Header */}
                <div style={{ 
                    padding: "24px 32px", 
                    borderBottom: "1px solid rgba(255,255,255,0.06)", 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center",
                    background: "rgba(255,255,255,0.01)"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <BrainCircuit size={24} color="#a855f7" />
                        <div>
                            <h2 style={{ color: "white", fontSize: "1.25rem", fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif" }}>Career OS History</h2>
                            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", marginTop: "2px" }}>Access or clean your compiled career reports</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        style={{ 
                            background: "rgba(255,255,255,0.05)", 
                            border: "none", 
                            cursor: "pointer", 
                            color: "rgba(255,255,255,0.6)",
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.2s"
                        }}
                        className="hover:bg-white/10 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* History List */}
                <div data-lenis-prevent style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
                    {history.length === 0 ? (
                        <div style={{ 
                            textAlign: "center", 
                            padding: "60px 20px", 
                            color: "rgba(255,255,255,0.4)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "16px"
                        }}>
                            <History size={40} style={{ opacity: 0.2 }} />
                            <span>No full career analyses generated yet.</span>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            {history.map((item) => (
                                <div 
                                    key={item.id} 
                                    style={{
                                        padding: "20px", 
                                        borderRadius: "20px", 
                                        background: "rgba(255,255,255,0.02)",
                                        border: "1px solid rgba(255,255,255,0.05)", 
                                        display: "flex", 
                                        justifyContent: "space-between", 
                                        alignItems: "center",
                                        transition: "all 0.3s ease",
                                    }}
                                    className="hover:border-purple-500/30 hover:bg-white/[0.04] group"
                                >
                                    <div 
                                        onClick={() => onSelect(item)}
                                        style={{ cursor: "pointer", flex: 1, paddingRight: "16px" }}
                                    >
                                        <div style={{ 
                                            color: "white", 
                                            fontWeight: 700, 
                                            fontSize: "1.05rem", 
                                            marginBottom: "6px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px"
                                        }}>
                                            <span>{item.target_role}</span>
                                            <span style={{ 
                                                fontSize: "0.75rem", 
                                                padding: "2px 8px", 
                                                background: "rgba(168,85,247,0.1)", 
                                                borderRadius: "100px", 
                                                color: "#c084fc",
                                                fontWeight: 600
                                            }}>
                                                Report
                                            </span>
                                        </div>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}>
                                            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                <MapPin size={13} style={{ color: "#06b6d4" }} /> {item.location}
                                            </span>
                                            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                <Clock size={13} /> {new Date(item.created_at).toLocaleDateString(undefined, {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric"
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(item.id);
                                        }}
                                        style={{ 
                                            padding: "10px", 
                                            borderRadius: "12px", 
                                            background: "rgba(239,68,68,0.08)", 
                                            border: "1px solid rgba(239,68,68,0.15)", 
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            transition: "all 0.2s"
                                        }}
                                        className="hover:bg-red-500 hover:border-red-500 hover:text-white text-red-400"
                                        title="Delete Career Analysis"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
