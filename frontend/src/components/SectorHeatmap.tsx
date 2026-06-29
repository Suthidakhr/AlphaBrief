import Link from "next/link";
import { clsx } from "clsx";
import { SectorPerformance } from "@/types";

interface Props {
  sectors: SectorPerformance[] | null;
}

const DIR_STYLES: Record<string, { cell: string; pct: string }> = {
  positive: { cell: "bg-positive-bg", pct: "text-positive" },
  neutral:  { cell: "bg-neutral-bg",  pct: "text-neutral-text" },
  negative: { cell: "bg-negative-bg", pct: "text-negative" },
};

const CARD_SHELL = "bg-white rounded-xl border overflow-hidden";
const CARD_BORDER = { borderColor: "rgba(74,52,42,0.1)" };
const HEADER_BORDER = { borderColor: "rgba(74,52,42,0.08)", backgroundColor: "#F5F1EA" };

function CardHeader() {
  return (
    <div
      className="px-4 py-3 border-b flex items-center justify-between"
      style={HEADER_BORDER}
    >
      <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#7D5A44" }}>
        Sector Heatmap
      </span>
      <span className="text-xs" style={{ color: "#B2967D" }}>กลุ่มอุตสาหกรรม</span>
    </div>
  );
}

export function SectorHeatmapSkeleton() {
  return (
    <div className={CARD_SHELL} style={CARD_BORDER} role="status" aria-label="Loading sector data">
      <div className="px-4 py-3 border-b animate-pulse" style={HEADER_BORDER}>
        <div className="h-3 bg-linen rounded w-32" />
      </div>
      <div className="p-3 grid grid-cols-3 gap-1.5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-lg h-14 bg-linen animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default function SectorHeatmap({ sectors }: Props) {
  if (sectors === null) {
    const attemptedAt = new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Bangkok",
    });
    return (
      <div className={CARD_SHELL} style={CARD_BORDER}>
        <CardHeader />
        <div className="px-4 py-4 text-xs" style={{ color: "#6b6560" }}>
          Sector data unavailable · Last attempted {attemptedAt} BKK
        </div>
      </div>
    );
  }

  if (sectors.length === 0) return null;

  return (
    <div className={CARD_SHELL} style={CARD_BORDER}>
      <CardHeader />
      <div className="p-3 grid grid-cols-3 gap-1.5">
        {sectors.map((sector) => {
          const s = DIR_STYLES[sector.direction] ?? DIR_STYLES.neutral;
          const pctText = isFinite(sector.change_pct)
            ? `${sector.change_pct >= 0 ? "+" : ""}${sector.change_pct.toFixed(2)}%`
            : "—";
          return (
            <Link
              key={sector.sector_name}
              href={`/news?category=${encodeURIComponent(sector.sector_name)}`}
              className={clsx(
                "rounded-lg p-2.5 text-center block",
                s.cell,
                "focus:outline-none focus-visible:shadow-[0_0_0_2px_#ffffff,0_0_0_4px_#4A342A]",
              )}
            >
              <div className="text-xs font-semibold mb-0.5" style={{ color: "#4A342A" }}>
                {sector.sector_name}
              </div>
              <div className={clsx("text-sm font-bold font-mono", s.pct)}>
                {pctText}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
