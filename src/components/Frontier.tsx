"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { optimizePortfolio } from "@/api/portfolio";
;

interface FrontierProps {
  stockItems: any[];
}

export default function Frontier({ stockItems }: FrontierProps) {
  const [riskLevel, setRiskLevel] = useState(50);
  const [riskRange, setRiskRange] = useState({ min: 0, max: 0 }); // 🔥 동적 스케일링 추가

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const darkGray = "#111827";
  const lightGray = "#e5e7eb";
  const sliderBackground = `linear-gradient(to right, ${darkGray} 0%, ${darkGray} ${riskLevel}%, ${lightGray} ${riskLevel}%, ${lightGray} 100%)`;

  // 날짜 기본값: 최근 1년
  const today = new Date();
  const lastYear = new Date();
  lastYear.setFullYear(today.getFullYear() - 1);

  const start = lastYear.toISOString().slice(0, 10);
  const end = today.toISOString().slice(0, 10);



  // 🔥 슬라이더 → 실제 target_risk로 변환
  const convertToRealRisk = () => {
    const { min, max } = riskRange;
    if (max <= min) return min;
    return min + (riskLevel / 100) * (max - min);
  };

  const handleRecommend = async () => {
    if (stockItems.length < 2) {
      return Swal.fire("알림", "최소 2개 종목이 필요합니다.", "info");
    }

    const codes = stockItems.map((item: any) => item.code);

    const targetRisk = convertToRealRisk(); // 🔥 스케일링 된 값

    try {
      setLoading(true);
      const res = await optimizeTargetRisk(codes, start, end, targetRisk);
      setResult(res.data);
    } catch (e: any) {
      Swal.fire("오류", e?.response?.data?.detail ?? "최적화 실패", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* 설명 카드 */}
      <section
        style={{
          border: "1px solid #cbd5e1",
          borderRadius: "0.5rem",
          padding: "1.5rem",
          backgroundColor: "white",
        }}
      >
        <h3 style={{ fontWeight: 600, fontSize: "1.5rem", color: "#0f172a" }}>
          효율적 프론티어
        </h3>
        <p style={{ fontSize: "0.875rem", color: "#3c4552" }}>
          리스크와 수익률의 관계를 시각화하고 최적 포트폴리오를 찾아보세요
        </p>
      </section>

      {/* 리스크 허용도 */}
      <section>
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
            <span style={{ fontSize: "1.2rem" }}>🎯</span>
            <p style={{ fontWeight: 600, fontSize: "1.1rem", margin: 0 }}>
              리스크 허용도 설정
            </p>
          </div>

          <p style={{ fontSize: "0.9rem", color: "#6b7280", marginTop: "0.5rem" }}>
            귀하의 리스크 선호도에 맞는 최적 포트폴리오를 찾아드립니다
          </p>

          {/* 슬라이더 */}
          <div style={{ marginTop: "1rem", position: "relative" }}>
            <p style={{ fontWeight: 500 }}>리스크 허용 수준</p>

            {/* 숫자 */}
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "-0.2rem",
                backgroundColor: "#f3f4f6",
                padding: "0.25rem 0.75rem",
                borderRadius: "0.5rem",
                fontWeight: 600,
              }}
            >
              {riskLevel}%
            </div>

            <input
              type="range"
              min={0}
              max={100}
              value={riskLevel}
              onChange={(e) => setRiskLevel(Number(e.target.value))}
              style={{
                width: "100%",
                height: "10px",
                borderRadius: "5px",
                background: sliderBackground,
                appearance: "none",
                cursor: "pointer",
              }}
            />

            <style jsx>{`
              input[type="range"]::-webkit-slider-thumb {
                appearance: none;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: white;
                border: 2px solid #111827;
                cursor: grab;
                margin-top: -5px;
              }
            `}</style>

            {/* 텍스트 */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "0.5rem",
              }}
            >
              <span style={{ color: "#6b7280" }}>보수적</span>
              <span style={{ color: "#6b7280" }}>중립적</span>
              <span style={{ color: "#6b7280" }}>공격적</span>
            </div>
          </div>

          {/* 버튼 */}
          <button
            onClick={handleRecommend}
            disabled={loading}
            style={{
              marginTop: "1.5rem",
              width: "100%",
              backgroundColor: "#16476A",
              color: "white",
              padding: "0.75rem",
              borderRadius: "0.5rem",
              fontWeight: 600,
            }}
          >
            {loading ? "계산 중..." : "최적 포트폴리오 추천받기"}
          </button>

          {/* 결과 */}
          {result && (
            <div
              style={{
                marginTop: "1.5rem",
                backgroundColor: "#E9EFF2",
                borderRadius: "0.75rem",
                padding: "1rem",
                border: "1px solid #cbd5e1",
              }}
            >
              <p style={{ fontWeight: 600 }}>최적 포트폴리오 결과</p>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <p style={{ color: "#6b7280", margin: 0 }}>예상 리스크</p>
                  <p
                    style={{
                      color: "#BF092F",
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      margin: 0,
                    }}
                  >
                    {(result.risk * 100).toFixed(1)}%
                  </p>
                </div>

                <div>
                  <p style={{ color: "#6b7280", margin: 0 }}>기대 수익률</p>
                  <p
                    style={{
                      color: "#3B9797",
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      margin: 0,
                    }}
                  >
                    {(result.expected_return * 100).toFixed(2)}%
                  </p>
                </div>
              </div>

              <p style={{ fontSize: "0.85rem", marginTop: "0.75rem" }}>
                설정하신 리스크 허용도에 따라 최적 조합이 계산되었습니다.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
