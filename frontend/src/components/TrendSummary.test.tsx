import { render, screen } from "@testing-library/react";
import TrendSummary, { TrendSummarySkeleton } from "./TrendSummary";
import { MarketThemeSummary } from "@/types";

const VALID_THEMES: MarketThemeSummary[] = [
  {
    theme_id: "theme-001",
    name: "Fed Pivot ใกล้เข้ามา",
    description: "Fed signals a pivot — risk-on mode",
    overall_sentiment: "bullish",
    article_count: 5,
    last_article_at: "2026-06-29T10:00:00Z",
    created_at: "2026-06-29T08:00:00Z",
  },
  {
    theme_id: "theme-002",
    name: "น้ำมันพุ่ง — กดดัน margin",
    description: "Brent crude above $86 pressures margins",
    overall_sentiment: "bearish",
    article_count: 3,
    last_article_at: "2026-06-29T09:00:00Z",
    created_at: "2026-06-29T07:00:00Z",
  },
  {
    theme_id: "theme-003",
    name: "จีนฟื้นตัว",
    description: "China recovery signals mixed",
    overall_sentiment: "neutral",
    article_count: 2,
    last_article_at: "2026-06-29T08:00:00Z",
    created_at: "2026-06-29T06:00:00Z",
  },
];

const FOURTH_THEME: MarketThemeSummary = {
  theme_id: "theme-004",
  name: "หุ้นเทคไทยอ่อนตัว",
  description: "Thai tech stocks weaken",
  overall_sentiment: "bearish",
  article_count: 1,
  last_article_at: "2026-06-29T07:00:00Z",
  created_at: "2026-06-29T05:00:00Z",
};

describe("TrendSummary", () => {
  it("renders each theme name", () => {
    render(<TrendSummary themes={VALID_THEMES} />);
    expect(screen.getByText("Fed Pivot ใกล้เข้ามา")).toBeInTheDocument();
    expect(screen.getByText("น้ำมันพุ่ง — กดดัน margin")).toBeInTheDocument();
    expect(screen.getByText("จีนฟื้นตัว")).toBeInTheDocument();
  });

  it("each theme row is a link to /trends/[theme_id]", () => {
    render(<TrendSummary themes={VALID_THEMES} />);
    const themeLinks = screen
      .getAllByRole("link")
      .filter((l) => l.getAttribute("href")?.startsWith("/trends/"));
    expect(themeLinks).toHaveLength(3);
    expect(themeLinks[0]).toHaveAttribute("href", "/trends/theme-001");
    expect(themeLinks[1]).toHaveAttribute("href", "/trends/theme-002");
    expect(themeLinks[2]).toHaveAttribute("href", "/trends/theme-003");
  });

  it("renders SentimentBadge for each theme", () => {
    render(<TrendSummary themes={VALID_THEMES} />);
    expect(screen.getByLabelText("Market sentiment: bullish")).toBeInTheDocument();
    expect(screen.getByLabelText("Market sentiment: bearish")).toBeInTheDocument();
    expect(screen.getByLabelText("Market sentiment: neutral")).toBeInTheDocument();
  });

  it("renders View all trends link to /trends", () => {
    render(<TrendSummary themes={VALID_THEMES} />);
    const viewAll = screen.getByRole("link", { name: /view all trends/i });
    expect(viewAll).toHaveAttribute("href", "/trends");
  });

  it("more than 3 themes — only top 3 by last_article_at rendered", () => {
    render(<TrendSummary themes={[...VALID_THEMES, FOURTH_THEME]} />);
    expect(screen.queryByText("หุ้นเทคไทยอ่อนตัว")).not.toBeInTheDocument();
    const themeLinks = screen
      .getAllByRole("link")
      .filter((l) => l.getAttribute("href")?.startsWith("/trends/"));
    expect(themeLinks).toHaveLength(3);
  });

  it("null themes renders Trends unavailable error state", () => {
    render(<TrendSummary themes={null} />);
    expect(screen.getByText(/Trends unavailable/)).toBeInTheDocument();
  });

  it("empty themes array renders No active themes today.", () => {
    render(<TrendSummary themes={[]} />);
    expect(screen.getByText("No active themes today.")).toBeInTheDocument();
  });
});

describe("TrendSummarySkeleton", () => {
  it("renders without throwing", () => {
    expect(() => render(<TrendSummarySkeleton />)).not.toThrow();
  });

  it("has role=status and aria-label for screen readers", () => {
    render(<TrendSummarySkeleton />);
    const el = screen.getByRole("status");
    expect(el).toHaveAttribute("aria-label", "Loading market themes");
  });
});
