import { TrendItem } from "@/types";
import clsx from "clsx";

interface Props { trends: TrendItem[] }

export default function TrendSummary({ trends }: Props) {
  return (
    <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "rgba(74,52,42,0.1)" }}>
      <div className="px-4 py-3 border-b flex items-center justify-between"
        style={{ borderColor: "rgba(74,52,42,0.08)", backgroundColor: "#F5F1EA" }}>
        <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#7D5A44" }}>
          Weekly Themes
        </span>
        <span className="text-xs" style={{ color: "#B2967D" }}>แนวโน้มสัปดาห์</span>
      </div>

      <div className="divide-y" style={{ "--tw-divide-color": "rgba(74,52,42,0.06)" } as React.CSSProperties}>
        {trends.map((trend) => (
          <div key={trend.rank} className="px-4 py-3 flex gap-3">
            <span className="text-xs font-black w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ backgroundColor: "#F5F1EA", color: "#B2967D" }}>
              {trend.rank}
            </span>
            <div className="min-w-0">
              <div className="text-sm font-semibold leading-snug mb-1" style={{ color: "#4A342A" }}>
                {trend.title}
              </div>
              <div className="text-xs leading-relaxed mb-2" style={{ color: "#78716c" }}>
                {trend.description}
              </div>
              <span className={clsx(
                "inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded tracking-wide",
                trend.sentiment === "bullish" && "bg-green-50 text-green-700",
                trend.sentiment === "bearish" && "bg-red-50 text-red-600",
                trend.sentiment === "neutral" && "bg-stone-100 text-stone-500"
              )}>
                {trend.sentiment === "bullish" && "▲ BULLISH"}
                {trend.sentiment === "bearish" && "▼ BEARISH"}
                {trend.sentiment === "neutral" && "– NEUTRAL"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
