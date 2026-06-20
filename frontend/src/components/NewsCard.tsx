import { NewsItem } from "@/types";
import clsx from "clsx";

const CATEGORY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  "ดอกเบี้ยโลก": { bg: "#fef3c7", text: "#92400e", label: "RATES" },
  "พลังงาน":     { bg: "#fff7ed", text: "#9a3412", label: "ENERGY" },
  "หุ้นไทย":    { bg: "#f0fdf4", text: "#14532d", label: "SET" },
  "เทคโนโลยี":  { bg: "#faf5ff", text: "#581c87", label: "TECH" },
  "ตลาดโลก":    { bg: "#eff6ff", text: "#1e3a8a", label: "GLOBAL" },
  "การเงิน":     { bg: "#f0fdfa", text: "#134e4a", label: "FINANCE" },
};

interface Props { news: NewsItem }

export default function NewsCard({ news }: Props) {
  const cat = CATEGORY_STYLES[news.category] ?? { bg: "#f5f5f4", text: "#44403c", label: news.category };

  return (
    <article className={clsx(
      "bg-white rounded-xl border transition-all duration-200 hover:shadow-md cursor-pointer overflow-hidden",
      news.featured ? "border-l-[3px]" : "border"
    )}
      style={{
        borderColor: "rgba(74,52,42,0.1)",
        borderLeftColor: news.featured ? "#B2967D" : undefined,
      }}>

      <div className="flex items-center gap-3 px-5 pt-4 pb-0">
        <span className="text-xs font-bold px-2 py-0.5 rounded tracking-widest"
          style={{ backgroundColor: cat.bg, color: cat.text }}>
          {cat.label}
        </span>
        <span className="text-xs" style={{ color: "#B2967D" }}>{news.source}</span>
        <span className="text-xs ml-auto tabular-nums" style={{ color: "#D7C9B8" }}>{news.published_at}</span>
      </div>

      <div className="px-5 pt-3 pb-4">
        <h2 className="text-[15px] font-bold leading-snug mb-2" style={{ color: "#4A342A" }}>
          {news.title}
        </h2>
        <p className="text-sm leading-relaxed mb-4 line-clamp-2" style={{ color: "#78716c" }}>
          {news.summary}
        </p>

        <div className="rounded-lg p-3 mb-3 flex gap-2.5"
          style={{ backgroundColor: "#F5F1EA", borderLeft: "2px solid #B2967D" }}>
          <div className="flex-shrink-0 mt-0.5">
            <div className="w-4 h-4 rounded-sm flex items-center justify-center"
              style={{ backgroundColor: "#B2967D" }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 14v-4m0-4h.01"/>
              </svg>
            </div>
          </div>
          <p className="text-[13px] leading-relaxed" style={{ color: "#7D5A44" }}>
            {news.ai_analysis}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {news.stock_impacts.map((impact) => (
            <span key={impact.symbol}
              className={clsx(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-bold border",
                impact.direction === "positive" && "bg-green-50 text-green-700 border-green-200",
                impact.direction === "negative" && "bg-red-50 text-red-700 border-red-200",
                impact.direction === "neutral" && "bg-stone-50 text-stone-500 border-stone-200"
              )}>
              {impact.direction === "positive" && <span className="text-[10px]">▲</span>}
              {impact.direction === "negative" && <span className="text-[10px]">▼</span>}
              {impact.direction === "neutral" && <span className="text-[10px]">–</span>}
              {impact.symbol}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
