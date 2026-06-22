import { render, screen } from "@testing-library/react";
import DailyBriefCard, { DailyBriefCardSkeleton, DailyBriefCardError } from "./DailyBriefCard";
import { DailyBrief } from "@/types";

const VALID_BRIEF: DailyBrief = {
  overall_sentiment: "bullish",
  key_developments: [
    "SET Index rose 0.8% on strong banking sector",
    "SCB reported Q2 profit above estimates",
    "Oil prices stabilized overnight",
  ],
  opportunities: ["Banking sector shows momentum"],
  risks: ["Global rate uncertainty remains"],
  generated_at: "2026-06-22T00:05:00Z",
  brief_date: "2026-06-22",
  is_fallback: false,
};

const FALLBACK_BRIEF: DailyBrief = {
  ...VALID_BRIEF,
  brief_date: "2026-06-21",
  is_fallback: true,
};

const DISCLAIMER = "AI-generated market summary for informational purposes only. Not investment advice.";

describe("DailyBriefCard", () => {
  describe("normal state", () => {
    it("renders without throwing", () => {
      expect(() => render(<DailyBriefCard brief={VALID_BRIEF} />)).not.toThrow();
    });

    it("renders AI Daily Brief heading", () => {
      render(<DailyBriefCard brief={VALID_BRIEF} />);
      expect(screen.getByText("AI Daily Brief")).toBeInTheDocument();
    });

    it("renders SentimentBadge with BULLISH label", () => {
      render(<DailyBriefCard brief={VALID_BRIEF} />);
      expect(screen.getByText("BULLISH")).toBeInTheDocument();
    });

    it("renders all key_developments items", () => {
      render(<DailyBriefCard brief={VALID_BRIEF} />);
      expect(screen.getByText("SET Index rose 0.8% on strong banking sector")).toBeInTheDocument();
      expect(screen.getByText("SCB reported Q2 profit above estimates")).toBeInTheDocument();
      expect(screen.getByText("Oil prices stabilized overnight")).toBeInTheDocument();
    });

    it("renders inline disclaimer text", () => {
      render(<DailyBriefCard brief={VALID_BRIEF} />);
      expect(screen.getByText(DISCLAIMER)).toBeInTheDocument();
    });
  });

  describe("fallback state (is_fallback: true)", () => {
    it("renders without throwing", () => {
      expect(() => render(<DailyBriefCard brief={FALLBACK_BRIEF} />)).not.toThrow();
    });

    it("shows today's brief is being prepared indicator", () => {
      render(<DailyBriefCard brief={FALLBACK_BRIEF} />);
      expect(screen.getByText(/Today's brief is being prepared/i)).toBeInTheDocument();
    });

    it("disclaimer is still present in fallback state", () => {
      render(<DailyBriefCard brief={FALLBACK_BRIEF} />);
      expect(screen.getByText(DISCLAIMER)).toBeInTheDocument();
    });
  });

  describe("DailyBriefCardSkeleton", () => {
    it("renders without throwing", () => {
      expect(() => render(<DailyBriefCardSkeleton />)).not.toThrow();
    });

    it("has role='status' for screen reader announcement", () => {
      render(<DailyBriefCardSkeleton />);
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("contains no spinner", () => {
      render(<DailyBriefCardSkeleton />);
      expect(screen.queryByRole("img", { name: /spin/i })).toBeNull();
    });
  });

  describe("DailyBriefCardError", () => {
    it("renders without throwing", () => {
      expect(() => render(<DailyBriefCardError />)).not.toThrow();
    });

    it("shows Daily Brief unavailable message", () => {
      render(<DailyBriefCardError />);
      expect(screen.getByText(/Daily Brief unavailable/i)).toBeInTheDocument();
    });
  });
});
