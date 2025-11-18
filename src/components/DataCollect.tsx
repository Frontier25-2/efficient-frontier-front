import React, { useState } from "react";

// --- 1. Naver News API 응답 타입 ---
interface NewsItem {
    title: string;
    link: string;
    description: string;
    pubDate: string;
}

// --- 2. 수집된 주식 데이터 타입 ---
interface StockItem {
    code: string;
    name: string;
    price: string;   // "71,200원" 같은 문자열
    change: string;  // "+1.2%", "-0.8%" 같은 문자열
}

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:5001";

// 백엔드 라우트에 맞춘 엔드포인트

const NEWS_ENDPOINT = "/api/search-news";
const STOCK_ENDPOINT = "/api/stock";

export default function DataCollect({ stockItems, setStockItems }: any) {
    // 검색어
    const [searchTerm, setSearchTerm] = useState("");

    // 뉴스 관련 상태
    const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setSearched(false);  // ✨ 검색어 수정하면 “검색 여부” 초기화
    };

    // 등락률 색상
    const getChangeColor = (change: string): string => {
        const num = parseFloat(change);

        if (isNaN(num)) return "#334155";
        if (num < 0) return "#BF092F";
        if (num > 0) return "blue";
        return "#334155";   // 0 %
    };

    // 🔹 검색
    const handleSearch = async () => {
        setSearched(true);   // 🔥 검색 시작 표시

        const q = searchTerm.trim();
        if (!q) {
            alert("검색어를 입력해주세요.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setNewsItems([]);

        // 1) 뉴스 검색
        try {
            const newsRes = await fetch(
                `${API_BASE}${NEWS_ENDPOINT}?query=${encodeURIComponent(q)}`
            );
            if (!newsRes.ok) {
                throw new Error(`뉴스 요청 실패 (status: ${newsRes.status})`);
            }
            const newsJson = await newsRes.json();

            if (newsJson.error) {
                throw new Error(newsJson.error);
            }
            if (newsJson.errorCode) {
                throw new Error(`Naver API Error: ${newsJson.errorMessage}`);
            }

            setNewsItems(newsJson.items || []);

        } catch (e: any) {
            console.error("뉴스 에러:", e);
            // 뉴스 쪽 에러만 먼저 기록 (주식 호출은 계속 진행)
            setError(e.message || "뉴스 데이터를 가져오는 중 오류가 발생했습니다.");

        }
        setIsLoading(false) // 검색 끝
    };

    // 주식 데이터 수집 함수만 별도 분리
    const handleCollect = async () => {
        const q = searchTerm.trim();   // 기존 handleSearch와 같은 구조
        if (!q) {
            alert("검색어를 입력해주세요.");
            return;
        }

        // 🔥 수집 버튼 눌렀으니 항상 에러 초기화
        setError(null);

        try {
            const stockRes = await fetch(
                `${API_BASE}${STOCK_ENDPOINT}?query=${encodeURIComponent(q)}`
            );
            if (!stockRes.ok) {
                throw new Error(`수집 실패. 검색어를 확인해 주세요.`);
            }
            const stockJson = await stockRes.json();

            const item: StockItem = {
                code:
                    stockJson.code ||
                    stockJson.stockCode ||
                    stockJson.ticker ||
                    q,
                name:
                    stockJson.name ||
                    stockJson.stockName ||
                    stockJson.companyName ||
                    q,
                price:
                    stockJson.price ||
                    stockJson.currentPrice ||
                    stockJson.closePrice ||
                    "-",
                change:
                    stockJson.change_rate ||
                    stockJson.changeRate ||
                    stockJson.fluctuationRate ||
                    "0.0%",
            };

            setStockItems((prev) => {
                const exists = prev.find((s) => s.code === item.code);
                if (exists) {
                    return prev.map((s) => (s.code === item.code ? item : s));
                }
                return [...prev, item];
            });
        } catch (e: any) {
            console.error("주식 에러:", e);
            setError((prev) =>
                prev
                    ? `${prev}\n${e.message || "주식 데이터를 가져오는 중 오류가 발생했습니다."}`
                    : e.message || "주식 데이터를 가져오는 중 오류가 발생했습니다."
            );
        }
    };

    // 종목 삭제
    const handleDelete = (code: string) => {
        setStockItems((prev) => prev.filter((s) => s.code !== code));
    };

    return (
        <div>
            {/* ───────────────── 네이버 금융 데이터 수집 섹션 ───────────────── */}
            <section
                style={{
                    border: "1px solid #cbd5e1",
                    borderRadius: "0.5rem",
                    padding: "1rem",
                    width: "100%",
                    backgroundColor: "white",
                    boxSizing: "border-box",
                }}
            >
                <h2
                    style={{
                        fontSize: "1rem",
                        fontWeight: 600,
                        marginBottom: "0.5rem",
                        color: "#0f172a",
                    }}
                >
                    네이버 금융 데이터 수집
                </h2>
                <p
                    style={{
                        fontSize: "0.9rem",
                        color: "#64748b",
                        marginBottom: "1rem",
                    }}
                >
                    종목 코드 또는 종목명을 검색하여 관련 뉴스나 데이터를 수집하세요
                </p>

                <div style={{ display: "flex", gap: "0.5rem", width: "100%" }}>
                    <input
                        type="text"
                        placeholder="종목 검색 (예: 삼성전자, 005930)"
                        value={searchTerm}
                        onChange={handleInputChange}
                        style={{
                            flex: 1,
                            padding: "0.5rem 0.75rem",
                            borderRadius: "0.5rem",
                            border: "1px solid #cbd5e1",
                            fontSize: "0.9rem",
                        }}
                    />
                    {/* 검색 버튼 */}
                    <button
                        onClick={handleSearch}
                        style={{
                            backgroundColor: "#1d4ed8",
                            color: "white",
                            borderRadius: "0.5rem",
                            padding: "0.5rem 1rem",
                            border: "none",
                            fontSize: "0.9rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "background-color 0.2s ease",
                            flexShrink: 0,
                        }}
                        type="button"
                        disabled={isLoading}
                    >
                        {isLoading ? "검색 중..." : "검색"}
                    </button>
                    {/* 수집 버튼도 동작은 동일하게 두고 싶으면 동일 함수 사용 */}
                    <button
                        onClick={handleCollect}
                        style={{
                            backgroundColor: "#16476A",
                            color: "white",
                            borderRadius: "0.5rem",
                            padding: "0.5rem 1rem",
                            border: "none",
                            fontSize: "0.9rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "background-color 0.2s ease",
                            flexShrink: 0,
                        }}
                        type="button"
                        disabled={isLoading}
                    >
                        수집
                    </button>
                </div>

                {/* 에러 메시지 */}
                {error && (
                    <p
                        style={{
                            marginTop: "0.75rem",
                            color: "#b91c1c",
                            fontSize: "0.85rem",
                            whiteSpace: "pre-wrap",
                        }}
                    >
                        {error}
                    </p>
                )}

                {/* 뉴스 결과 */}
                {newsItems.length > 0 && (
                    <div
                        style={{
                            marginTop: "1.25rem",
                            maxHeight: "260px",
                            overflowY: "auto",
                            border: "1px solid #e5e7eb",
                            borderRadius: "0.5rem",
                            padding: "0.75rem",
                            backgroundColor: "#f9fafb",
                        }}
                    >
                        <h3
                            style={{
                                fontWeight: 600,
                                marginBottom: "0.5rem",
                                color: "#0f172a",
                            }}
                        >
                            뉴스 검색 결과
                        </h3>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.5rem",
                            }}
                        >
                            {newsItems.map((item, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        padding: "0.5rem 0.3rem",
                                        borderBottom: "1px solid #e5e7eb",
                                    }}
                                >
                                    <a
                                        href={item.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            fontWeight: 600,
                                            color: "#1d4ed8",
                                            textDecoration: "none",
                                        }}
                                    >
                                        {item.title}
                                    </a>
                                    <p
                                        style={{
                                            fontSize: "0.85rem",
                                            color: "#4b5563",
                                            marginTop: "0.25rem",
                                        }}
                                    >
                                        {item.description}
                                    </p>
                                    <p
                                        style={{
                                            fontSize: "0.75rem",
                                            color: "#9ca3af",
                                            marginTop: "0.25rem",
                                        }}
                                    >
                                        {item.pubDate}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 결과 없을 때 */}
                {searched && !isLoading && !error && newsItems.length === 0 && (
                    <p
                        style={{
                            marginTop: "0.75rem",
                            fontSize: "0.85rem",
                            color: "#6b7280",
                        }}
                    >
                        '{searchTerm}'에 대한 뉴스 검색 결과가 없습니다.
                    </p>
                )}
            </section>

            {/* ───────────────── 수집된 주식 데이터 섹션 ───────────────── */}
            <section
                style={{
                    marginTop: "2rem",
                    border: "1px solid #cbd5e1",
                    borderRadius: "0.5rem",
                    padding: "1rem",
                    width: "100%",
                    backgroundColor: "white",
                    boxSizing: "border-box",
                }}
            >
                <div
                    style={{
                        paddingLeft: "0.5rem",
                        maxWidth: "100%",
                        overflowX: "auto",
                    }}
                >
                    {/* 제목 + 경고 문구를 같은 라인에 배치 */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "0.5rem",
                        }}
                    >
                        <h3
                            style={{
                                fontWeight: 600,
                                color: "#0f172a",
                                margin: 0,
                            }}
                        >
                            수집된 주식 데이터
                        </h3>

                        {stockItems.length < 5 && (
                            <span
                                style={{
                                    color: "#BF092F",
                                    fontSize: "0.875rem",
                                    fontWeight: 600,
                                }}
                            >
                                데이터를 5개 수집해 보세요!
                            </span>
                        )}
                    </div>

                    <p
                        style={{
                            fontSize: "0.875rem",
                            color: "#64748b",
                            marginBottom: "1rem",
                        }}
                    >
                        총 {stockItems.length}개 종목
                    </p>

                    <table
                        style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            textAlign: "left",
                            fontSize: "0.9rem",
                            color: "#334155",
                        }}
                    >
                        <thead>
                            <tr>
                                <th
                                    style={{
                                        padding: "0.5rem",
                                        borderBottom: "1px solid #e5e7eb",
                                    }}
                                >
                                    종목코드
                                </th>
                                <th
                                    style={{
                                        padding: "0.5rem",
                                        borderBottom: "1px solid #e5e7eb",
                                    }}
                                >
                                    종목명
                                </th>
                                <th
                                    style={{
                                        padding: "0.5rem",
                                        borderBottom: "1px solid #e5e7eb",
                                    }}
                                >
                                    현재가
                                </th>
                                <th
                                    style={{
                                        padding: "0.5rem",
                                        borderBottom: "1px solid #e5e7eb",
                                    }}
                                >
                                    등락률
                                </th>
                                <th
                                    style={{
                                        padding: "0.5rem",
                                        borderBottom: "1px solid #e5e7eb",
                                        width: "40px",
                                    }}
                                >
                                    삭제
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {stockItems.map((item) => (
                                <tr
                                    key={item.code}
                                    style={{
                                        borderBottom: "1px solid #f1f5f9",
                                    }}
                                >
                                    <td style={{ padding: "0.5rem" }}>
                                        {item.code}
                                    </td>
                                    <td style={{ padding: "0.5rem" }}>
                                        {item.name}
                                    </td>
                                    <td style={{ padding: "0.5rem" }}>
                                        {item.price}
                                    </td>
                                    <td
                                        style={{
                                            padding: "0.5rem",
                                            color: getChangeColor(item.change),
                                            fontWeight: 600,
                                        }}
                                    >
                                        {(() => {
                                            const num = parseFloat(item.change); // "5.45%" → 5.45, "-3.2%" → -3.2
                                            const sign = num > 0 ? "+" : num < 0 ? "-" : "";
                                            return sign + Math.abs(num) + "%";
                                        })()}
                                    </td>
                                    <td style={{ padding: "0.5rem" }}>
                                        <button
                                            type="button"
                                            style={{
                                                background: "transparent",
                                                border: "none",
                                                color: "black",
                                                fontWeight: "bold",
                                                fontSize: "1.1rem",
                                                cursor: "pointer",
                                            }}
                                            aria-label={`종목 ${item.name} 삭제`}
                                            onClick={() =>
                                                handleDelete(item.code)
                                            }
                                        >
                                            ×
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {stockItems.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        style={{
                                            padding: "0.75rem",
                                            textAlign: "center",
                                            color: "#9ca3af",
                                            fontSize: "0.9rem",
                                        }}
                                    >
                                        아직 수집된 종목이 없습니다. 상단에서
                                        종목을 검색·수집해주세요.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
