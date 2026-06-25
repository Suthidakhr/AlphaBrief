import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { api } from "@/lib/api";
import DailyBriefServer from "./DailyBriefServer";

vi.mock("@/lib/api", () => ({
  api: { getDailyBrief: vi.fn() },
}));

const MOCK_BRIEF = {
  overall_sentiment: "bullish" as const,
  key_developments: ["SET rose 0.8%", "SCB gains"],
  opportunities: ["Banking sector"],
  risks: ["Global rate uncertainty"],
  generated_at: "2026-06-22T00:05:00Z",
  brief_date: "2026-06-22",
  is_fallback: false,
};

describe("DailyBriefServer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders DailyBriefCard when brief is available", async () => {
    vi.mocked(api.getDailyBrief).mockResolvedValue(MOCK_BRIEF);
    render(await DailyBriefServer());
    expect(screen.getByText("AI Daily Brief")).toBeInTheDocument();
  });

  it("renders DailyBriefCardError when api throws a network error", async () => {
    vi.mocked(api.getDailyBrief).mockRejectedValue(new Error("Network error"));
    render(await DailyBriefServer());
    expect(screen.getByText(/Daily Brief unavailable/)).toBeInTheDocument();
  });

  it("renders DailyBriefCardError when api returns 404", async () => {
    vi.mocked(api.getDailyBrief).mockRejectedValue(
      new Error("API error: 404 /daily-brief/")
    );
    render(await DailyBriefServer());
    expect(screen.getByText(/Daily Brief unavailable/)).toBeInTheDocument();
  });
});
