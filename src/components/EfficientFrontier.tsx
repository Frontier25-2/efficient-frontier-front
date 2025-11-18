"use client";

import { useState, useMemo } from "react";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import Swal from "sweetalert2";
import axios from "axios";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

// 마커별 색상
const markerColors: Record<string, string> = {
  max_diversification: "#E91E63",
  max_sharpe: "#FF5722",
  min_volatility: "#4CAF50",
  risk_parity: "#3F51B5",
};

interface EfficientFrontierProps {
  stockItems: any[];
}

interface FrontierPoint {
  targetRatio: number;    // 0~1, 샘플 위치
  risk: number;           // 연간 변동성
  expectedReturn: number; // 연간 기대수익률
  weights: number[];      // 각 자산 비중
}

interface MarkerPoint {
  name: string;           // max_sharpe, min_volatility 등
  risk: number;
  expectedReturn: number;
  weights: number[];
}

export default function EfficientFrontier({ stockItems }: EfficientFrontierProps) {
  const [loading, setLoading] = useState(false);
  const [points, setPoints] = useState<FrontierPoint[]>([]);
  const [markers, setMarkers] = useState<MarkerPoint[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 🔥 기간 선택 상태 (기본 1년)
  const [range, setRange] = useState<"1M" | "3M" | "6M" | "1Y" | "3Y">("1Y");

  // 🔥 리스크 허용도 슬라이더 (0~100%)
  const [riskLevel, setRiskLevel] = useState(50);

  // 선택된 리스크 허용도에 맞는 추천 포트폴리오
  const selectedPoint = useMemo(() => {
    if (points.length === 0) return null;

    const risks = points.map((p) => p.risk);
    const minRisk = Math.min(...risks);
    const maxRisk = Math.max(...risks);

    if (!isFinite(minRisk) || !isFinite(maxRisk) || maxRisk <= minRisk) {
      return points[0];
    }

    const t = riskLevel / 100; // 0~1
    const targetRisk = minRisk + t * (maxRisk - minRisk);

    // targetRisk 에 가장 가까운 프론티어 상의 점 선택
    let best = points[0];
    let bestDiff = Math.abs(points[0].risk - targetRisk);

    for (const p of points) {
      const diff = Math.abs(p.risk - targetRisk);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = p;
      }
    }
    return best;
  }, [points, riskLevel]);

  // 기간 → start / end 계산
  const getDateRange = () => {
    const today = new Date();
    const end = today.toISOString().slice(0, 10);
    const startDate = new Date(today);

    switch (range) {
      case "1M":
        startDate.setMonth(today.getMonth() - 1);
        break;
      case "3M":
        startDate.setMonth(today.getMonth() - 3);
        break;
      case "6M":
        startDate.setMonth(today.getMonth() - 6);
        break;
      case "1Y":
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      case "3Y":
        startDate.setFullYear(today.getFullYear() - 3);
        break;
    }

    const start = startDate.toISOString().slice(0, 10);
    return { start, end };
  };

   const handleComputeFrontier = async () => {
    if (!stockItems || stockItems.length < 2) {
      Swal.fire(
        "알림",
        "효율적 프론티어 계산을 위해 최소 2개 종목이 필요합니다.",
        "info"
      );
      return;
    }

    const codes = stockItems.map((s: any) => s.code);
    const { start, end } = getDateRange();

    // 🔥 Thunder Client에서 쓸 수 있는 요청 바디를 콘솔에 찍기
    console.log(
      "🔎 Thunder Client 요청 바디 예시 ↓↓↓\n",
      JSON.stringify(
        {
          codes,
          start,
          end,
          range, // 기간 정보 (백엔드는 써도 되고 무시해도 됨)
        },
        null,
        2
      )
    );

    setLoading(true);
    setError(null);
    setPoints([]);
    setMarkers([]);

    try {
      const res = await axios.post("http://127.0.0.1:5000/api/frontier", {
        codes,
        start,
        end,
        range,
      });

      const raw = res.data;
      const frontierRaw = raw?.frontier;
      const markersRaw = raw?.markers;

      if (!Array.isArray(frontierRaw) || frontierRaw.length === 0) {
        setError("유효한 프론티어 점을 계산하지 못했습니다.");
        return;
      }

      const n = frontierRaw.length;
      const collected: FrontierPoint[] = frontierRaw.map(
        (p: any, idx: number) => ({
          risk: Number(p.risk) || 0,
          expectedReturn: Number(p.return) || 0,
          targetRatio: n > 1 ? idx / (n - 1) : 0,
          weights: Array.isArray(p.weights) ? p.weights : [],
        })
      );

      collected.sort((a, b) => a.risk - b.risk);
      setPoints(collected);

      if (markersRaw && typeof markersRaw === "object") {
        const markerList: MarkerPoint[] = Object.entries(markersRaw).map(
          ([key, val]: [string, any]) => ({
            name: key,
            risk: Number(val.risk) || 0,
            expectedReturn: Number(val.return) || 0,
            weights: Array.isArray(val.weights) ? val.weights : [],
          })
        );
        setMarkers(markerList);
      }
    } catch (err: any) {
      console.error("efficient frontier error:", err);
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        "데이터 처리 중 오류가 발생했습니다.";
      setError(msg);
      Swal.fire("오류", msg, "error");
    } finally {
      setLoading(false);
    }
  };


  // Chart.js 데이터 (x,y 좌표 기반)
  const chartData = {
    datasets: [
      // 프론티어 전체 선
      {
        label: "Efficient Frontier",
        data: points.map((p) => ({
          x: p.risk * 100,           // X = Risk (%)
          y: p.expectedReturn * 100, // Y = Return (%)
        })),
        borderColor: "#16476A",
        backgroundColor: "#16476A",
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
      },

      // key 포트폴리오들 (각각 다른 색 점)
      ...markers.map((m) => ({
        label: m.name,
        data: [
          {
            x: m.risk * 100,
            y: m.expectedReturn * 100,
          },
        ],
        showLine: false,
        pointRadius: 7,
        pointHoverRadius: 9,
        backgroundColor: markerColors[m.name] || "#000000",
        borderColor: markerColors[m.name] || "#000000",
      })),

      // 🔥 리스크 허용도 기반 추천 포트폴리오 (주황색 점)
      ...(selectedPoint
        ? [
            {
              label: "추천 포트폴리오 (리스크 허용도)",
              data: [
                {
                  x: selectedPoint.risk * 100,
                  y: selectedPoint.expectedReturn * 100,
                },
              ],
              showLine: false,
              pointRadius: 9,
              pointHoverRadius: 11,
              backgroundColor: "#FFA000",
              borderColor: "#FFA000",
            },
          ]
        : []),
    ],
  };

  const chartOptions: any = {
    responsive: true,
    parsing: false, // {x,y} 그대로 사용
    plugins: {
      legend: { display: true },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const x = ctx.parsed.x;
            const y = ctx.parsed.y;
            return `리스크: ${x.toFixed(2)}%, 기대수익률: ${y.toFixed(2)}%`;
          },
        },
      },
    },
    scales: {
      x: {
        type: "linear",
        title: { display: true, text: "Risk (연간 변동성 %)" },
        ticks: {
          callback: (value: any) => `${Number(value).toFixed(1)}%`,
        },
      },
      y: {
        title: { display: true, text: "Expected Return (연간 %)" },
        ticks: {
          callback: (value: any) => `${Number(value).toFixed(1)}%`,
        },
      },
    },
  };

  return (
    <div
      style={{
        marginTop: "2rem",
        padding: "1.5rem",
        borderRadius: "1rem",
        border: "1px solid #cbd5e1",
        backgroundColor: "white",
      }}
    >
      <h3
        style={{
          fontWeight: 600,
          fontSize: "1.25rem",
          marginBottom: "0.5rem",
        }}
      >
        📈 효율적 프론티어 곡선 (백엔드 실시간 계산)
      </h3>
      <p
        style={{
          fontSize: "0.9rem",
          color: "#4b5563",
          marginBottom: "1rem",
        }}
      >
        상단 리스크 허용 수준과 기간을 선택하면, 해당 조건에 맞는 효율적 프론티어와
        추천 포트폴리오를 확인할 수 있습니다.
      </p>

      {/* 🔥 리스크 허용도 슬라이더 */}
      <div style={{ marginBottom: "1rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "0.25rem",
          }}
        >
          <span style={{ fontWeight: 500 }}>리스크 허용 수준</span>
          <span>{riskLevel}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={riskLevel}
          onChange={(e) => setRiskLevel(Number(e.target.value))}
          style={{ width: "100%" }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.8rem",
            marginTop: "0.25rem",
            color: "#6b7280",
          }}
        >
          <span>보수적</span>
          <span>중립적</span>
          <span>공격적</span>
        </div>
      </div>

      {/* 🔥 기간 선택 버튼들 */}
      <div
        style={{
          marginBottom: "1rem",
          display: "flex",
          gap: "0.5rem",
          flexWrap: "wrap",
        }}
      >
        {["1M", "3M", "6M", "1Y", "3Y"].map((v) => (
          <button
            key={v}
            onClick={() => setRange(v as any)}
            style={{
              padding: "0.35rem 0.8rem",
              borderRadius: "0.5rem",
              border:
                range === v ? "2px solid #16476A" : "1px solid #d1d5db",
              backgroundColor: range === v ? "#e0ecf8" : "white",
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            {v}
          </button>
        ))}
      </div>

      <button
        onClick={handleComputeFrontier}
        disabled={loading}
        style={{
          padding: "0.6rem 1.2rem",
          borderRadius: "0.5rem",
          border: "none",
          backgroundColor: "#16476A",
          color: "white",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        {loading
          ? "계산 중..."
          : `효율적 프론티어 계산하기 (기간: ${range})`}
      </button>

      {error && (
        <p
          style={{
            marginTop: "0.75rem",
            color: "#b91c1c",
            fontSize: "0.9rem",
          }}
        >
          {error}
        </p>
      )}

      {points.length > 0 && (
        <div style={{ marginTop: "1.5rem" }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      )}

      {/* 프론티어 표 */}
      {points.length > 0 && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "0.85rem",
            marginTop: "1.25rem",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f3f4f6" }}>
              <th style={{ padding: 8 }}>샘플 위치(비율)</th>
              <th style={{ padding: 8 }}>실제 리스크</th>
              <th style={{ padding: 8 }}>기대수익률</th>
            </tr>
          </thead>
          <tbody>
            {points.map((p, i) => (
              <tr key={i}>
                <td style={{ padding: 8 }}>
                  {(p.targetRatio * 100).toFixed(1)}%
                </td>
                <td style={{ padding: 8 }}>{(p.risk * 100).toFixed(2)}%</td>
                <td style={{ padding: 8 }}>
                  {(p.expectedReturn * 100).toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* 🔍 슬라이더 기준 추천 포트폴리오 요약 */}
      {selectedPoint && (
        <div style={{ marginTop: "1.25rem" }}>
          <h4
            style={{
              fontWeight: 600,
              fontSize: "1rem",
              marginBottom: "0.5rem",
            }}
          >
            🔍 현재 리스크 허용 수준 기준 추천 포트폴리오
          </h4>
          <p style={{ fontSize: "0.9rem", marginBottom: "0.25rem" }}>
            리스크: {(selectedPoint.risk * 100).toFixed(2)}% / 기대수익률:{" "}
            {(selectedPoint.expectedReturn * 100).toFixed(2)}%
          </p>
          {selectedPoint.weights.length > 0 && (
            <p style={{ fontSize: "0.85rem", color: "#4b5563" }}>
              비중: {selectedPoint.weights.map((w) => w.toFixed(3)).join(", ")}
            </p>
          )}
        </div>
      )}

      {!loading && !error && points.length === 0 && (
        <p
          style={{
            marginTop: "1rem",
            color: "#6b7280",
            fontSize: "0.9rem",
          }}
        >
          위에서 기간과 리스크 허용 수준을 선택한 뒤, 버튼을 눌러 효율적
          프론티어를 계산해 보세요.
        </p>
      )}
    </div>
  );
}
