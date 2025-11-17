import client from "./client";

// 통합 포트폴리오 최적화 API
export async function optimizePortfolio({ model, codes, start, end, risk }) {
  return client.post("/api/optimize/model", {
    model,
    codes,
    start,
    end,
    risk,
  });
}
