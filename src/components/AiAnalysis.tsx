"use client";

import React, { useState, useEffect } from "react";
import { Send } from "lucide-react";

export default function AiAnalysis() {
    const [inputValue, setInputValue] = useState("");
    const [time, setTime] = useState("");

    useEffect(() => {
        const now = new Date();

        // 시간 포맷 (예: 오전 08:56)
        const hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, "0");
        const isAm = hours < 12;
        const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
        const ampm = isAm ? "오전" : "오후";
        const formattedTime = `${ampm} ${formattedHours}:${minutes}`;

        setTime(formattedTime);
    }, []);

    const handleQuickQuestion = (text: string) => {
        setInputValue(text);
    };

    return (
        <div>
            {/* 제목 */}
            <h3
                style={{
                    fontWeight: 600,
                    fontSize: "1.5rem",
                    color: "#0f172a",
                    marginBottom: 8,
                }}
            >
                AI 분석 도우미
            </h3>
            <p style={{ fontSize: "0.875rem", color: "#3c4552" }}>
                포트폴리오 분석 결과를 AI와 함께 검토하세요
            </p>

            {/* 상단 2개 컨테이너 */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "2%",
                    marginTop: "1.5rem",
                }}
            >
                {/* 투자 목표 설정 */}
                <div
                    style={{
                        marginTop: "0.5rem",
                        border: "1px solid #cbd5e1",
                        borderRadius: "1rem",
                        padding: "1.5rem",
                        backgroundColor: "white",
                        width: "49%",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ fontSize: "1.2rem" }}>🎯</span>
                        <p
                            style={{
                                fontWeight: 600,
                                fontSize: "1rem",
                                color: "#111827",
                                margin: 0,
                            }}
                        >
                            투자 목표 설정
                        </p>
                    </div>
                    <input
                        type="text"
                        placeholder="예: 은퇴 자금 마련, 자녀 교육비 등"
                        style={{
                            width: "95%",
                            marginTop: "1rem",
                            border: "1px solid #d1d5db",
                            borderRadius: "0.5rem",
                            padding: "0.75rem 1rem",
                            fontSize: "0.9rem",
                            color: "#111827",
                            outline: "none",
                            backgroundColor: "#f9fafb",
                        }}
                    />
                </div>

                {/* 리스크 선호도 */}
                <div
                    style={{
                        marginTop: "0.5rem",
                        border: "1px solid #cbd5e1",
                        borderRadius: "1rem",
                        padding: "1.5rem",
                        backgroundColor: "white",
                        width: "49%",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ fontSize: "1.2rem" }}>📈</span>
                        <p
                            style={{
                                fontWeight: 600,
                                fontSize: "1rem",
                                color: "#111827",
                                margin: 0,
                            }}
                        >
                            리스크 선호도
                        </p>
                    </div>
                    <input
                        type="text"
                        placeholder="예: 보수적, 중립적, 공격적"
                        style={{
                            width: "95%",
                            marginTop: "1rem",
                            border: "1px solid #d1d5db",
                            borderRadius: "0.5rem",
                            padding: "0.75rem 1rem",
                            fontSize: "0.9rem",
                            color: "#111827",
                            outline: "none",
                            backgroundColor: "#f9fafb",
                        }}
                    />
                </div>
            </div>

            {/* 대화형 분석 */}
            <div
                style={{
                    marginTop: "2rem",
                    border: "1px solid #cbd5e1",
                    borderRadius: "1rem",
                    padding: "1.5rem",
                    backgroundColor: "white",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "1.2rem" }}>🤖</span>
                    <p
                        style={{
                            fontWeight: 600,
                            fontSize: "1rem",
                            color: "#111827",
                            margin: 0,
                        }}
                    >
                        대화형 분석
                    </p>
                </div>

                <p
                    style={{
                        fontSize: "0.9rem",
                        color: "#6b7280",
                        marginTop: "0.5rem",
                    }}
                >
                    포트폴리오에 대해 궁금한 점을 물어보세요
                </p>

                {/* AI 메시지 박스 */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.75rem",
                        marginTop: "1rem",
                    }}
                >
                    {/* 로봇 아이콘 */}
                    <div
                        style={{
                            fontSize: "1.2rem",
                            backgroundColor: "#e2e8f0",
                            borderRadius: "50%",
                            width: "2rem",
                            height: "2rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#334155",
                        }}
                    >
                        🤖
                    </div>

                    {/* 메시지 본문 */}
                    <div
                        style={{
                            backgroundColor: "#f9fafb",
                            borderRadius: "0.75rem",
                            padding: "1rem",
                            border: "1px solid #e5e7eb",
                            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
                            maxWidth: "70%",
                        }}
                    >
                        <p
                            style={{
                                fontSize: "0.9rem",
                                color: "#374151",
                                margin: 0,
                                lineHeight: 1.6,
                            }}
                        >
                            안녕하세요! 저는 AI 자산배분 분석 도우미입니다. 효율적 프론티어 분석
                            결과를 바탕으로 귀하의 투자 목표와 리스크 성향에 맞는 최적의
                            포트폴리오를 추천해드리겠습니다. 무엇을 도와드릴까요?
                        </p>
                        <p
                            style={{
                                fontSize: "0.75rem",
                                color: "#6b7280",
                                marginTop: "0.5rem",
                            }}
                        >
                            {time}
                        </p>
                    </div>
                </div>

                {/* 추천 질문 버튼 */}
                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.5rem",
                        marginTop: "1rem",
                    }}
                >
                    {[
                        "최대 샤프 포트폴리오에 대해 설명해주세요",
                        "현재 시장 상황에서 추천하는 전략은?",
                        "리스크를 줄이려면 어떻게 해야 하나요?",
                        "분산 투자의 장점은 무엇인가요?",
                    ].map((q, i) => (
                        <button
                            key={i}
                            onClick={() => handleQuickQuestion(q)}
                            style={{
                                border: "1px solid #d1d5db",
                                backgroundColor: "#f3f4f6",
                                borderRadius: "2rem",
                                padding: "0.5rem 1rem",
                                fontSize: "0.85rem",
                                color: "#111827",
                                cursor: "pointer",
                                transition: "all 0.15s ease-in-out",
                                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "#e5e7eb"; // hover
                                e.currentTarget.style.transform = "translateY(-1px)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "#f3f4f6";
                                e.currentTarget.style.transform = "translateY(0)";
                            }}
                            onMouseDown={(e) => {
                                e.currentTarget.style.transform = "scale(0.97)"; // 클릭 시 살짝 작아짐
                                e.currentTarget.style.boxShadow = "inset 0 2px 4px rgba(0,0,0,0.1)";
                            }}
                            onMouseUp={(e) => {
                                e.currentTarget.style.transform = "scale(1)";
                                e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.05)";
                            }}
                        >
                            {q}
                        </button>
                    ))}
                </div>

                {/* 입력창 */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginTop: "1rem",
                    }}
                >
                    <input
                        type="text"
                        placeholder="메시지를 입력하세요..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        style={{
                            flex: 1,
                            border: "1px solid #d1d5db",
                            borderRadius: "0.75rem",
                            padding: "0.75rem 1rem",
                            fontSize: "0.9rem",
                            outline: "none",
                            backgroundColor: "#f9fafb",
                        }}
                    />
                    <button
                        style={{
                            backgroundColor: "#0f4c81",
                            border: "none",
                            borderRadius: "0.75rem",
                            padding: "0.65rem 0.9rem",
                            cursor: "pointer",
                        }}
                    >
                        <Send size={18} color="white" />
                    </button>
                </div>
            </div>
        </div>
    );
}
