import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { History, Trash2, X } from "lucide-react";

interface Props {
    history: any[];
    onSelect: (roadmap: any) => void;
    onDelete: (id: string) => void;
    onClose: () => void;
}

export default function RoadmapHistory({ history, onSelect, onDelete, onClose }: Props) {
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
            background: "rgba(2, 6, 23, 0.8)", backdropFilter: "blur(10px)",
            zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
        }}>
            <div style={{
                width: "100%", maxWidth: "600px", background: "#0f172a", borderRadius: "24px",
                border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
                overflow: "hidden", display: "flex", flexDirection: "column", maxHeight: "80vh"
            }}>
                <div style={{ padding: "24px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <History size={20} color="#a855f7" />
                        <h2 style={{ color: "white", fontSize: "1.2rem", fontWeight: 700 }}>Roadmap History</h2>
                    </div>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)" }}>
                        <X size={24} />
                    </button>
                </div>

                <div data-lenis-prevent style={{ flex: 1, overflowY: "auto", maxHeight: "calc(80vh - 90px)", padding: "16px" }}>
                    {history.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "40px", color: "rgba(255,255,255,0.4)" }}>No roadmaps generated yet.</div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {history.map((item, i) => (
                                <div key={item.id} style={{
                                    padding: "16px", borderRadius: "16px", background: "rgba(255,255,255,0.03)",
                                    border: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center"
                                }}>
                                    <div 
                                        onClick={() => onSelect(item)}
                                        style={{ cursor: "pointer", flex: 1 }}
                                    >
                                        <div style={{ color: "white", fontWeight: 600, marginBottom: "4px" }}>{item.target_role}</div>
                                        <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}>
                                            Generated on {new Date(item.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => onDelete(item.id)}
                                        style={{ padding: "8px", borderRadius: "8px", background: "rgba(239,68,68,0.1)", border: "none", cursor: "pointer" }}
                                    >
                                        <Trash2 size={16} color="#ef4444" />
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
