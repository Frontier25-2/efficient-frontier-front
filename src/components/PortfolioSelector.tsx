import { optimizePortfolio } from "@/api/portfolio";

const handleSubmit = async () => {
  try {
    const result = await optimizePortfolio({
      model: selectedModel,     // "max-sharpe"
      codes: selectedCodes,     // ["005930", ...]
      start: startDate,
      end: endDate,
      risk: riskLevel / 100,    // 슬라이더 30 → 0.3 변환
    });

    console.log("최적화 결과:", result.data);

    setPortfolio(result.data);

  } catch (e) {
    console.error(e);
  }
};

<ModelSelect onChange={setSelectedModel} />
