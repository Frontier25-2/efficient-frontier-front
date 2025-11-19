"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import DataCollect from "@/components/DataCollect";
import ModelSelect from "@/components/ModelSelect";
import EfficientFrontier from "@/components/EfficientFrontier";
import AiAnalysis from "@/components/AiAnalysis";

// 탭 설정
const tabs = [
  { id: "data", label: "자료 수집", icon: "🗄️" },
  { id: "model", label: "모델 추천", icon: "📈" },
  { id: "efficient", label: "효율적 프론티어", icon: "📊" },
  { id: "ai", label: "AI 분석", icon: "💬" },
];

export default function Page() {
  const [selectedTab, setSelectedTab] = useState("data");
  const [stockItems, setStockItems] = useState([]);

  // 🔥 선택된 모델 저장
  const [selectedModel, setSelectedModel] = useState<any | null>(null);

  // 공통 스타일
  const navStyle = {
    display: "flex",
    backgroundColor: "white",
    borderRadius: "0.5rem",
    boxShadow:
      "0 4px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
    marginTop: "1rem",
    padding: "0.25rem",
    width: "var(--screen-width-80)",
    marginLeft: "auto",
    marginRight: "auto",
  };

  const buttonBaseStyle = {
    display: "flex",
    alignItems: "center",
    flexGrow: 1,
    justifyContent: "center",
    gap: "0.5rem",
    paddingLeft: "1.5rem",
    paddingRight: "1.5rem",
    paddingTop: "0.5rem",
    paddingBottom: "0.5rem",
    borderRadius: "0.5rem",
    whiteSpace: "nowrap",
    cursor: "pointer",
    border: "none",
    outline: "none",
    fontSize: "1rem",
    fontWeight: "500",
    userSelect: "none",
    transition: "background-color 0.2s ease, color 0.2s ease",
  };

  // 🔥 contentStyle 복구
  const contentStyle = {
    width: "var(--screen-width-80)",
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: "2rem",
    padding: "0rem",
    fontSize: "1rem",
    color: "#374151",
  };

  return (
    <main style={{ padding: "1rem" }}>
      {/* 탭 네비게이션 */}
      <nav style={navStyle}>
        {tabs.map((tab) => {
          const isSelected = selectedTab === tab.id;

          const isDisabledTab =
            stockItems.length < 5 &&
            (tab.id === "model" || tab.id === "efficient" || tab.id === "ai");

          const buttonStyle = {
            ...buttonBaseStyle,
            backgroundColor: isSelected ? "#16476A" : "transparent",
            color: isSelected ? "white" : "#374151",
            opacity: isDisabledTab ? 0.4 : 1,
          };

          return (
            <button
              key={tab.id}
              onClick={() => {
                if (isDisabledTab && tab.id !== "data") {
                  Swal.fire({
                    title: "알림",
                    text: "수집 데이터를 5개 이상 모아보세요!",
                    icon: "info",
                    confirmButtonText: "확인",
                  });
                } else {
                  setSelectedTab(tab.id);
                }
              }}
              role="tab"
              aria-selected={isSelected}
              style={buttonStyle}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* 탭 콘텐츠 */}
      <section style={contentStyle}>
        {/* 📌 자료 수집 */}
        {selectedTab === "data" && (
          <DataCollect setStockItems={setStockItems} stockItems={stockItems} />
        )}

        {/* 📌 모델 선택 */}
        {selectedTab === "model" && (
          <ModelSelect
            stockItems={stockItems}
            selectedModel={selectedModel}
            onChange={(model) => {
              console.log("선택된 모델:", model);
              setSelectedModel(model);
            }}
          />
        )}

        {/* 📌 효율적 프론티어 & Frontier */}
        {selectedTab === "efficient" && (
          <>
            <div style={{ marginTop: "3rem" }}>
              <EfficientFrontier
                stockItems={stockItems}
                selectedModel={selectedModel}
              />
            </div>
          </>
        )}

        {/* 📌 AI 분석 */}
        {selectedTab === "ai" && <AiAnalysis />}
      </section>
    </main>
  );
}
