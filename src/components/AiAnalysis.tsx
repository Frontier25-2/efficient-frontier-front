"use client";

import React, { useState, useEffect, FormEvent } from "react"; // FormEvent 추가
import { Send } from "lucide-react";

// 메시지 객체의 타입을 정의합니다.
interface Message {
    sender: "user" | "ai";
    text: string;
    time: string;
}

export default function AiAnalysis() {
    const [inputValue, setInputValue] = useState("");
    
    // 초기 시간 설정 (AI 첫인사)
const [time, setTime] = useState("");
useEffect(() => {
    setTime(getFormattedTime());
}, []);

// [신규] 채팅 내역을 관리할 state
const [messages, setMessages] = useState<Message[]>([]);

// [신규] API 호출 중 로딩 상태를 관리할 state
const [isLoading, setIsLoading] = useState(false);

// [신규] AI 첫인사 메시지를 time state가 설정된 후 추가합니다.
useEffect(() => {
    if (time && messages.length === 0) {
        setMessages([
            {
                sender: "ai",
                text: "안녕하세요! 저는 AI 자산배분 분석 도우미입니다. 효율적 프론티어 분석 결과를 바탕으로 귀하의 투자 목표와 리스크 성향에 맞는 최적의 포트폴리오를 추천해드리겠습니다. 무엇을 도와드릴까요?",
                time: time,
            },
        ]);
    }
}, [time, messages.length]); // time과 messages.length를 의존성 배열에 추가


// 현재 시간을 포맷팅하는 헬퍼 함수
const getFormattedTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const isAm = hours < 12;
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    const ampm = isAm ? "오전" : "오후";
    return `${ampm} ${formattedHours}:${minutes}`;
};

const handleQuickQuestion = (text: string) => {
    setInputValue(text);
    // (선택) 빠른 질문도 바로 전송하게 하려면
    // handleSubmit(text); // 폼 이벤트가 없으므로 handleSubmit을 약간 수정해야 함
};


// [신규] 메시지 전송 및 API 호출 핸들러
const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); // 폼의 기본 새로고침 동작 방지
    const userMessageText = inputValue.trim();

    if (!userMessageText) return; // 빈 메시지는 전송하지 않음

    const currentTime = getFormattedTime();
    
    // 1. 사용자 메시지를 채팅 내역에 추가
    const userMessage: Message = {
        sender: "user",
        text: userMessageText,
        time: currentTime,
    };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    setInputValue("");      // 입력창 비우기
    setIsLoading(true);     // 로딩 상태 시작

    try {
        // 2. Flask 백엔드(/chat)에 API 요청
        const response = await fetch("http://127.0.0.1:5001/chat", { 
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ message: userMessageText }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json(); // { "reply": "AI의 응답..." }

        // 3. AI의 응답을 채팅 내역에 추가
        const aiMessage: Message = {
            sender: "ai",
            text: data.reply,
            time: getFormattedTime(),
        };
        setMessages(prevMessages => [...prevMessages, aiMessage]);

    } catch (error) {
        console.error("AI 챗봇 응답 오류:", error);
        // 4. 에러 발생 시 에러 메시지 추가
        const errorMessage: Message = {
            sender: "ai",
            text: "죄송합니다. AI 응답을 가져오는 중 오류가 발생했습니다. 백엔드 서버가 실행 중인지 확인해주세요.",
            time: getFormattedTime(),
        };
        setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
        setIsLoading(false); // 로딩 상태 종료
    }
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
        {/* ... (중략: 투자 목표, 리스크 선호도 부분은 동일) ... */}
        
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
            {/* ... (중략: 대화형 분석 타이틀) ... */}
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
            {/* ... */}


            {/* [수정] AI 메시지 박스 -> 채팅 내역 렌더링 */}
            {/* 기존의 하드코딩된 AI 메시지 박스 대신,
                messages state를 순회하며 동적으로 채팅 버블을 그립니다.
            */}
            <div 
                style={{ 
                    maxHeight: "400px", 
                    overflowY: "auto", 
                    paddingRight: "10px",
                    marginTop: "1rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem"
                }}
            >
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "0.75rem",
                            // 사용자가 보낸 메시지는 오른쪽 정렬
                            justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
                        }}
                    >
                        {/* AI 아이콘 (AI 메시지일 때만 보임) */}
                        {msg.sender === "ai" && (
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
                                    flexShrink: 0,
                                }}
                            >
                                🤖
                            </div>
                        )}

                        {/* 메시지 본문 */}
                        <div
                            style={{
                                backgroundColor: msg.sender === "user" ? "#dbeafe" : "#f9fafb", // 사용자(파랑) / AI(회색)
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
                                    // pre-wrap: 긴 텍스트 줄바꿈
                                    whiteSpace: "pre-wrap", 
                                }}
                            >
                                {msg.text}
                            </p>
                            <p
                                style={{
                                    fontSize: "0.75rem",
                                    color: "#6b7280",
                                    marginTop: "0.5rem",
                                    textAlign: "right", // 시간은 오른쪽
                                }}
                            >
                                {msg.time}
                            </p>
                        </div>
                    </div>
                ))}

                {/* [신규] 로딩 인디케이터 */}
                {isLoading && (
                     <div style={{ 
                         display: "flex", 
                         justifyContent: "flex-start", 
                         gap: "0.75rem", 
                         alignItems: "center" 
                     }}>
                        {/* 로봇 아이콘 (스타일 재사용) */}
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
                                flexShrink: 0,
                            }}
                        >
                            🤖
                        </div>

                        {/* 메시지 본문 (스타일 재사용) */}
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
                            <p style={{ 
                                fontSize: "0.9rem", 
                                color: "#6b7280", 
                                margin: 0, 
                                lineHeight: 1.6 
                            }}>
                                AI가 답변을 생성 중입니다...
                            </p>
                        </div>
                    </div>
                )}
            </div> {/* 🚨 오류 수정 1: 스크롤되는 채팅창(div)을 여기서 닫습니다. */}


            {/* 추천 질문 버튼 */}
            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                    marginTop: "1.5rem", // 채팅창과 간격
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
                            e.currentTarget.style.backgroundColor = "#e5e7eb";
                            e.currentTarget.style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#f3f4f6";
                            e.currentTarget.style.transform = "translateY(0)";
                        }}
                    >
                        {q}
                    </button>
                ))}
            </div>

            {/* [수정] 입력창 (form으로 감싸기) */}
            <form
                onSubmit={handleSubmit} // form에 onSubmit 이벤트 연결
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
                    disabled={isLoading} // 로딩 중에는 입력 비활성화
                    style={{
                        flex: 1,
                        border: "1px solid #d1d5db",
                        borderRadius: "0.75rem",
                        padding: "0.75rem 1rem",
                        fontSize: "0.9rem",
                        outline: "none",
                        backgroundColor: isLoading ? "#e5e7eb" : "#f9fafb", // 로딩 중 배경색
                    }}
                />
                <button
                    type="submit" // 버튼 타입을 'submit'으로 변경
                    disabled={isLoading} // 로딩 중에는 버튼 비활성화
                    style={{
                        backgroundColor: isLoading ? "#6b7280" : "#0f4c81", // 비활성화 색상
                        border: "none",
                        borderRadius: "0.75rem",
                        padding: "0.65rem 0.9rem",
                        cursor: isLoading ? "not-allowed" : "pointer",
                        transition: "background-color 0.2s"
                    }}
                >
                    <Send size={18} color="white" />
                </button>
            </form>
        </div>
    </div> // 🚨 오류 수정 2: 최상단(Root) <div>를 닫는 태그가 누락되었습니다.
    );
}