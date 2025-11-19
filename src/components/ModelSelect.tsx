"use client";

import React, { useState, useEffect } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:5001";

type Portfolio = {
  id: string;
  title: string;
  subtitle: string;
  api: string;
  icon: string;
  color: string;
};

const portfolios: Portfolio[] = [
  {
    id: "minVar",
    title: "최소 분산 포트폴리오",
    subtitle: "Minimum Variance",
    api: "/api/optimize/min-variance",
    icon: "🛡️",
    color: "#3B9797",
  },
  {
    id: "maxSharpe",
    title: "최대 샤프 비율",
    subtitle: "Maximum Sharpe",
    api: "/api/optimize/max-sharpe",
    icon: "📈",
    color: "#BF092F",
  },
  {
    id: "riskParity",
    title: "리스크 패리티",
    subtitle: "Risk Parity",
    api: "/api/optimize/risk-parity",
    icon: "⚖️",
    color: "#244272",
  },
  {
    id: "maxDivers",
    title: "최대 분산비율",
    subtitle: "Maximum Diversification",
    api: "/api/optimize/max-diversification",
    icon: "⚡",
    color: "#000",
  },
];

interface ModelSelectProps {
  stockItems: any[];
  selectedModel?: Portfolio | null;
  onChange?: (model: Portfolio | null) => void;
}

export default function ModelSelect({
  stockItems,
  selectedModel,
  onChange,
}: ModelSelectProps) {
  // 🔥 부모가 준 selectedModel을 기준으로 초기 상태 설정
  const [selectedId, setSelectedId] = useState<string | null>(
    selectedModel?.id ?? null
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // 부모의 selectedModel이 바뀌면, 내부 selectedId도 동기화
  useEffect(() => {
    setSelectedId(selectedModel?.id ?? null);
  }, [selectedModel]);

  const activeModel =
    portfolios.find((p) => p.id === selectedId) ?? null;

  const codes = stockItems?.map((s: any) => s.code);
  const start = stockItems?.[0]?.start;
  const end = stockItems?.[0]?.end;

  const handleOptimize = async () => {
    if (!activeModel) return;

    if (!codes || codes.length < 5) {
      alert("최소 5개 종목이 필요합니다.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`${API_BASE}${activeModel.api}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codes, start, end }),
      });

      const json = await res.json();
      setResult(json);
    } catch (err) {
      alert("최적화 요청 실패");
      console.error(err);
    }

    setLoading(false);
  };

  const renderWeightTable = () => {
    if (!result || !result.weights) return null;

    return (
      <table
        style={{
          width: "100%",
          marginTop: "16px auto",
          borderCollapse: "collapse",
          fontSize: "0.9rem",
        }}
      >
        <thead>
          <tr style={{ background: "#f3f4f6" }}>
            <th style={{ padding: 8, borderBottom: "1px solid #ddd" }}>종목코드</th>
            <th style={{ padding: 8, borderBottom: "1px solid #ddd" }}>비중 (%)</th>
          </tr>
        </thead>
        <tbody>
          {result.weights.map((w: number, i: number) => (
            <tr key={i}>
              <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>{codes[i]}</td>
              <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>
                {(w * 100).toFixed(2)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>📈 자산배분 모델 선택</h2>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
        {portfolios.map((p) => {
          const selected = p.id === selectedId;
          return (
            <button
              key={p.id}
               onClick={() => {
                setSelectedId(p.id);
                // 🔥 여기서 부모에게 선택된 모델 전달
                if (onChange) onChange(p);
              }}
              style={{
                flex: "1 1 45%",
                borderRadius: 12,
                padding: 20,
                background: "white",
                border: selected ? `3px solid ${p.color}` : "1px solid #ccc",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 10 }}>{p.icon}</div>
              <div style={{ fontWeight: 600 }}>{p.title}</div>
              <div style={{ color: "#666", fontSize: 14 }}>{p.subtitle}</div>
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 24, textAlign: "center" }}>
        <button
          onClick={handleOptimize}
          disabled={!activeModel || loading}
          style={{
            padding: "12px 24px",
            fontSize: 16,
            fontWeight: 600,
            color: "white",
            backgroundColor: activeModel ? "#b91c1c" : "#999",
            borderRadius: 8,
            border: "none",
            cursor: activeModel ? "pointer" : "not-allowed",
          }}
        >
          {loading ? "계산 중..." : "선택한 모델로 포트폴리오 구성하기"}
        </button>
      </div>

      {result && (
        <div
          style={{
            marginTop: 32,
            background: "white",
            borderRadius: 12,
            padding: 20,
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          }}
        >
          <h3 style={{ marginBottom: 12 }}>📊 최적화 결과</h3>

          <p>
            <strong>리스크:</strong> {(result.risk * 100).toFixed(2)}%
          </p>
          <p>
            <strong>기대수익률:</strong> {(result.expected_return * 100).toFixed(2)}%
          </p>

          {renderWeightTable()}
        </div>
      )}
    </div>
  );
}
