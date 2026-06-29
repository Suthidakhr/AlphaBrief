import { render, screen } from "@testing-library/react";
import SectorHeatmap, { SectorHeatmapSkeleton } from "./SectorHeatmap";
import { SectorPerformance } from "@/types";

const UPDATED_AT = "2026-06-27T03:00:00Z";

const VALID_SECTORS: SectorPerformance[] = [
  { sector_name: "ก่อสร้าง", change_pct: 2.41, direction: "positive", top_article_id: "news-001", updated_at: UPDATED_AT },
  { sector_name: "เกษตร", change_pct: -0.08, direction: "neutral", top_article_id: null, updated_at: UPDATED_AT },
  { sector_name: "สายการบิน", change_pct: -1.21, direction: "negative", top_article_id: null, updated_at: UPDATED_AT },
];

describe("SectorHeatmap", () => {
  // Existing tests — preserved
  it("renders each sector name", () => {
    render(<SectorHeatmap sectors={VALID_SECTORS} />);
    expect(screen.getByText("ก่อสร้าง")).toBeInTheDocument();
    expect(screen.getByText("เกษตร")).toBeInTheDocument();
    expect(screen.getByText("สายการบิน")).toBeInTheDocument();
  });

  it("positive sector renders with + prefix", () => {
    render(<SectorHeatmap sectors={VALID_SECTORS} />);
    expect(screen.getByText("+2.41%")).toBeInTheDocument();
  });

  it("negative sector renders negative percentage without + prefix", () => {
    render(<SectorHeatmap sectors={VALID_SECTORS} />);
    expect(screen.getByText("-1.21%")).toBeInTheDocument();
  });

  it("neutral sector renders without + prefix", () => {
    render(<SectorHeatmap sectors={VALID_SECTORS} />);
    expect(screen.getByText("-0.08%")).toBeInTheDocument();
  });

  it("renders with empty sectors array without throwing", () => {
    expect(() => render(<SectorHeatmap sectors={[]} />)).not.toThrow();
  });

  // New tests — AC5: error state
  it("null sectors shows Sector data unavailable", () => {
    render(<SectorHeatmap sectors={null} />);
    expect(screen.getByText(/Sector data unavailable/)).toBeInTheDocument();
  });

  // New tests — AC3: link navigation
  it("each sector cell is a link to /news?category=[sector_name]", () => {
    render(<SectorHeatmap sectors={VALID_SECTORS} />);
    const links = screen.getAllByRole("link");
    expect(links.length).toBe(VALID_SECTORS.length);
    expect(links[0]).toHaveAttribute(
      "href",
      `/news?category=${encodeURIComponent(VALID_SECTORS[0].sector_name)}`
    );
  });

  // New tests — AC1: isFinite guard
  it("change_pct NaN renders — not throw", () => {
    const snap: SectorPerformance[] = [
      { ...VALID_SECTORS[0], change_pct: NaN },
    ];
    render(<SectorHeatmap sectors={snap} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  // New tests — AC2: Tailwind token classes
  it("positive cell has bg-positive-bg class", () => {
    const { container } = render(<SectorHeatmap sectors={VALID_SECTORS} />);
    expect(container.querySelector(".bg-positive-bg")).toBeInTheDocument();
  });

  it("negative cell has bg-negative-bg class", () => {
    const { container } = render(<SectorHeatmap sectors={VALID_SECTORS} />);
    expect(container.querySelector(".bg-negative-bg")).toBeInTheDocument();
  });

  it("neutral cell has bg-neutral-bg class", () => {
    const { container } = render(<SectorHeatmap sectors={VALID_SECTORS} />);
    expect(container.querySelector(".bg-neutral-bg")).toBeInTheDocument();
  });

  // New tests — AC6: focus ring
  it("sector cell link has espresso focus ring class", () => {
    const { container } = render(<SectorHeatmap sectors={VALID_SECTORS} />);
    const link = container.querySelector("a");
    expect(link?.className).toContain(
      "focus-visible:shadow-[0_0_0_2px_#ffffff,0_0_0_4px_#4A342A]"
    );
  });
});

describe("SectorHeatmapSkeleton", () => {
  it("renders without throwing", () => {
    expect(() => render(<SectorHeatmapSkeleton />)).not.toThrow();
  });

  it("has role=status and aria-label for screen readers", () => {
    const { container } = render(<SectorHeatmapSkeleton />);
    const el = container.querySelector('[role="status"]');
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute("aria-label", "Loading sector data");
  });
});
