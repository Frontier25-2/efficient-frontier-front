import api from "./api";

export function getWeights(payload: any) {
  return api.post("/analytics/weights", payload);
}

export function getFrontier(payload: any) {
  return api.post("/analytics/frontier", payload);
}

export function runBacktest(payload: any) {
  return api.post("/analytics/backtest", payload);
}

export function getSummary(payload: any) {
  return api.post("/analytics/summary", payload);
}