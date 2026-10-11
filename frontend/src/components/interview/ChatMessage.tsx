import React, { useState } from "react";
import { Bot, User, Sparkles, ChevronDown, ChevronUp, Target, HelpCircle, Layers } from "lucide-react";

interface Props {
    msg: {
        role: string;
        content: string;
        type?: string;
        ideal_model_answer?: string;
        company_principle_alignment?: string;
        follow_up_prompt?: string;
        phase_title?: string;
        question_number?: number;
        total_questions?: number;
    };
    codingMode: boolean;
    isSpeaking?: boolean;
}

function renderMessageContent(content: string, isCandidate = false): React.ReactNode {
    if (!content) return null;
    const codeBlockRegex = /```(?:([a-zA-Z0-9+#-]+)\n)?([\s\S]*?)```/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = codeBlockRegex.exec(content)) !== null) {
        const textBefore = content.slice(lastIndex, match.index);
        if (textBefore) {
            parts.push(
                <span key={`text-${lastIndex}`} style={{ whiteSpace: "pre-wrap" }}>
                    {textBefore}
                </span>
            );
        }

        parts.push(
            <pre
                key={`code-${match.index}`}
                style={{
                    background: isCandidate ? "rgba(15, 23, 42, 0.92)" : "var(--bg-base)",
                    padding: "14px 18px",
                    borderRadius: "var(--radius-lg)",
                    overflowX: "auto",
                    overflowY: "auto",
                    maxHeight: "300px",
                    margin: "12px 0",
                    whiteSpace: "pre",
                    fontFamily: "var(--font-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                    fontSize: "0.8125rem",
                    border: isCandidate ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid var(--border-default)",
                    color: isCandidate ? "#f1f5f9" : "var(--fg-secondary)"
                }}
            >
                <code>{match[2]}</code>
            </pre>
        );

        lastIndex = match.index + match[0].length;
    }

    const textAfter = content.slice(lastIndex);
    if (textAfter) {
        parts.push(
            <span key={`text-${lastIndex}`} style={{ whiteSpace: "pre-wrap" }}>
                {textAfter}
            </span>
        );
    }

    return <>{parts}</>;
}

export const ChatMessage = React.memo(({ msg, codingMode, isSpeaking }: Props) => {
    const [showModelAnswer, setShowModelAnswer] = useState(false);

    if (msg.role === "system" || !msg.content.trim()) return null;

    const isInterviewer = msg.role === "interviewer" || msg.role === "interviewer_stream";
    const isCandidate = msg.role === "candidate";

    return (
        <div
            className="animate-fade-in"
            style={{
                display: "flex",
                gap: "12px",
                marginBottom: "20px",
                maxWidth: isCandidate ? "80%" : "88%",
                alignSelf: isCandidate ? "flex-end" : "flex-start",
                flexDirection: isCandidate ? "row-reverse" : "row",
            }}
        >
            <div style={{ flexShrink: 0, marginTop: "2px" }}>
                {isInterviewer ? (
                    <div
                        className={isSpeaking ? "speaking-pulse" : ""}
                        style={{
                            width: "32px", height: "32px",
                            background: "var(--brand-gradient)",
                            borderRadius: "var(--radius-md)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "white",
                            boxShadow: isSpeaking ? "0 0 12px rgba(59, 130, 246, 0.3)" : "none"
                        }}
                    >
                        <Bot size={16} />
                    </div>
                ) : (
                    <div style={{
                        width: "32px", height: "32px",
                        background: "var(--bg-muted)",
                        borderRadius: "var(--radius-md)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "var(--fg-muted)"
                    }}>
                        <User size={16} />
                    </div>
                )}
            </div>
            <div
                style={{
                    flex: 1, minWidth: 0,
                    padding: "14px 16px",
                    background: isCandidate ? "var(--brand)" : "var(--bg-surface)",
                    borderRadius: isCandidate ? "var(--radius-lg) var(--radius-lg) var(--radius-sm) var(--radius-lg)" : "var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm)",
                    border: isCandidate ? "none" : "1px solid var(--border-subtle)",
                    maxHeight: isCandidate ? "380px" : undefined,
                    overflowY: isCandidate ? "auto" : undefined,
                }}
            >
                {/* Phase & Competency Alignment Badges */}
                {isInterviewer && (msg.phase_title || msg.company_principle_alignment) && (
                    <div className="mb-2.5 flex flex-wrap items-center gap-2">
                        {msg.phase_title && (
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-purple-300 bg-purple-950/60 border border-purple-800/60 px-2 py-0.5 rounded shadow-sm">
                                <Layers size={12} className="text-purple-400 shrink-0" />
                                <span>{msg.phase_title}</span>
                            </div>
                        )}
                        {msg.company_principle_alignment && (
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-blue-300 bg-blue-950/50 border border-blue-800/50 px-2 py-0.5 rounded">
                                <Target size={12} className="text-blue-400 shrink-0" />
                                <span>Competency: {msg.company_principle_alignment}</span>
                            </div>
                        )}
                    </div>
                )}

                <div style={{
                    color: isCandidate ? "#ffffff" : "var(--fg-primary)",
                    fontSize: "0.875rem", lineHeight: "1.65", wordBreak: "break-word"
                }}>
                    {renderMessageContent(msg.content, isCandidate)}
                </div>

                {/* Follow up prompt pill if provided */}
                {isInterviewer && msg.follow_up_prompt && (
                    <div className="mt-3 pt-2.5 border-t border-border-subtle flex items-start gap-2 text-xs text-text-muted">
                        <HelpCircle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                        <span><strong className="text-text-secondary">Next Drill:</strong> {msg.follow_up_prompt}</span>
                    </div>
                )}

                {/* Staff-Level Model Answer Breakdown */}
                {isInterviewer && msg.ideal_model_answer && (
                    <div className="mt-3 pt-2.5 border-t border-border-subtle">
                        <button
                            onClick={() => setShowModelAnswer(!showModelAnswer)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                            <Sparkles size={13} />
                            <span>{showModelAnswer ? "Hide Staff-Level Blueprint" : "View Staff-Level Blueprint"}</span>
                            {showModelAnswer ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </button>

                        {showModelAnswer && (
                            <div className="mt-2.5 p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-xs text-emerald-200/90 leading-relaxed font-sans whitespace-pre-wrap animate-fade-in">
                                {msg.ideal_model_answer}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
});

ChatMessage.displayName = "ChatMessage";
