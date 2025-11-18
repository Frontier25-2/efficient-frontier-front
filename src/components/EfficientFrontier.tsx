"use client";

import { useState } from "react";
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

interface EfficientFrontierProps {
  stockItems: any[];
}

interface FrontierPoint {
  targetRatio: number;    // 0~1
  risk: number;           // 연간 변동성
  expectedReturn: number; // 연간 기대수익률
}

export default function EfficientFrontier({ stockItems }: EfficientFrontierProps) {
  const [loading, setLoading] = useState(false);
  const [points, setPoints] = useState<FrontierPoint[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 🔥 리스크 허용도 슬라이더 (target-risk 테스트용)
  const [riskLevel, setRiskLevel] = useState(50); // 0~100 %

  // 최근 1년 구간 자동 설정
  const today = new Date();
  const lastYear = new Date();
  lastYear.setFullYear(today.getFullYear() - 1);

  const start = lastYear.toISOString().slice(0, 10);
  const end = today.toISOString().slice(0, 10);

  const handleComputeFrontier = async () => {
    if (!stockItems || stockItems.length < 2) {
      Swal.fire("알림", "효율적 프론티어 계산을 위해 최소 2개 종목이 필요합니다.", "info");
      return;
    }

    const codes = stockItems.map((s: any) => s.code);

    setLoading(true);
    setError(null);
    setPoints([]);

    try {
      const res = await axios.post("http://127.0.0.1:5001/api/optimize/frontier", {
        codes,
        start,
        end,
        // 🔥 필요하면 target-risk 기반 프론티어 확장 가능
        // target_risk: riskLevel / 100
      });

      const raw = res.data?.data ?? res.data;

      let ratios: number[] = [];
      let risks: number[] = [];
      let returns: number[] = [];

      if (Array.isArray(raw)) {
        // 현재 백엔드: [risks, returns, weights_list]
        risks = Array.isArray(raw[0]) ? raw[0] : [];
        returns = Array.isArray(raw[1]) ? raw[1] : [];

        const n = risks.length;
        ratios =
          n > 1 ? Array.from({ length: n }, (_, i) => i / (n - 1)) : [0];
      } else if (raw && typeof raw === "object") {
        ratios = raw.ratios ?? [];
        risks = raw.risks ?? [];
        returns = raw.returns ?? [];
      }

      if (risks.length === 0 || returns.length === 0) {
        setError("유효한 프론티어 점을 계산하지 못했습니다.");
        return;
      }

      const len = Math.min(
        ratios.length || risks.length,
        risks.length,
        returns.length
      );

      const collected: FrontierPoint[] = [];
      for (let i = 0; i < len; i++) {
        collected.push({
          targetRatio:
            ratios.length === len
              ? ratios[i]
              : len > 1
              ? i / (len - 1)
              : 0,
          risk: risks[i],
          expectedReturn: returns[i],
        });
      }

      collected.sort((a, b) => a.risk - b.risk);
      setPoints(collected);
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

  // Chart.js 데이터
  const chartData = {
    labels: points.map((p) => (p.risk * 100).toFixed(1) + "%"),
    datasets: [
      {
        label: "Efficient Frontier",
        data: points.map((p) => ({
          x: p.risk * 100,
          y: p.expectedReturn * 100,
        })),
        borderColor: "#16476A",
        backgroundColor: "#16476A",
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const chartOptions: any = {
    responsive: true,
    plugins: {
      legend: { display: false },
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
      x: { title: { display: true, text: "Risk (연간 변동성 %)" } },
      y: { title: { display: true, text: "Expected Return (연간 %)" } },
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
      <h3 style={{ fontWeight: 600, fontSize: "1.25rem", marginBottom: "0.5rem" }}>
        📈 효율적 프론티어 곡선 (백엔드 실시간 계산)
      </h3>
      <p style={{ fontSize: "0.9rem", color: "#4b5563", marginBottom: "1rem" }}>
        여러 목표 리스크 수준에 대해 백엔드에서 최적 포트폴리오를 계산한 뒤,
        효율적 프론티어 곡선을 그립니다.
      </p>

      {/* 🔥 리스크 허용도 슬라이더 */}
      <div style={{ marginBottom: "1rem" }}>
        <label>🎚 리스크 허용도: {riskLevel}%</label>
        <input
          type="range"
          min={0}
          max={100}
          value={riskLevel}
          onChange={(e) => setRiskLevel(Number(e.target.value))}
          style={{ width: "100%" }}
        />
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
        {loading ? "계산 중..." : "효율적 프론티어 계산하기"}
      </button>

      {error && (
        <p style={{ marginTop: "0.75rem", color: "#b91c1c", fontSize: "0.9rem" }}>
          {error}
        </p>
      )}

      {points.length > 0 && (
        <div style={{ marginTop: "1.5rem" }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      )}

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
              <th style={{ padding: 8 }}>슬라이더 위치(비율)</th>
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

      {!loading && !error && points.length === 0 && (
        <p style={{ marginTop: "1rem", color: "#6b7280", fontSize: "0.9rem" }}>
          상단 버튼을 눌러 효율적 프론티어를 계산해 보세요.
        </p>
      )}
    </div>
  );
}
