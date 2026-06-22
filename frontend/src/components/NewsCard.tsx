import Link from "next/link";
import { NewsItem } from "@/types";
import SentimentBadge from "./SentimentBadge";
import AIInsightBox from "./AIInsightBox";

const CATEGORY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  "ดอกเบี้ยโลก": { bg: "#fef3c7", text: "#92400e", label: "RATES" },
  "พลังงาน":     { bg: "#fff7ed", text: "#9a3412", label: "ENERGY" },
  "หุ้นไทย":    { bg: "#f0fdf4", text: "#14532d", label: "SET" },
  "เทคโนโลยี":  { bg: "#faf5ff", text: "#581c87", label: "TECH" },
  "ตลาดโลก":    { bg: "#eff6ff", text: "#1e3a8a", label: "GLOBAL" },
};

const DIRECTION_LABEL: Record<string, string> = {
  positive: "rising",
  negative: "falling",
  neutral: "unchanged",
};

const DIRECTION_ARROW: Record<string, string> = {
  positive: "▲",
  negative: "▼",
  neutral: "–",
};

const BADGE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  positive: { bg: "#dcfce7", text: "#15803d", border: "#86efac" },
  negative: { bg: "#fee2e2", text: "#dc2626", border: "#fca5a5" },
  neutral:  { bg: "#f5f5f4", text: "#6b6560", border: "#e7e5e4" },
};

function relativeTime(isoString: string): string {
  const hours = Math.floor(
    Math.max(0, Date.now() - new Date(isoString).getTime()) / (1000 * 60 * 60)
  );
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "1 day ago" : `${days} days ago`;
}

interface Props { news: NewsItem }

export default function NewsCard({ news }: Props) {
  const cat = CATEGORY_STYLES[news.category] ?? { bg: "#f5f5f4", text: "#44403c", label: news.category };

  return (
    <article
      className="bg-white rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer focus-within:shadow-[0_0_0_2px_#ffffff,0_0_0_4px_#4A342A]"
      style={{
        border: "1px solid rgba(74,52,42,0.1)",
        borderLeft: news.featured ? "3px solid #B2967D" : undefined,
        borderLeftColor: news.featured ? "#B2967D" : undefined,
      }}
    >
      <Link href={`/news/${news.id}`} className="block px-5 py-4 focus:outline-none">
        {/* Row 1: headline + SentimentBadge */}
        <div className="flex items-start gap-2 mb-3">
          <h2 className="text-[15px] font-bold leading-snug flex-1" style={{ color: "#4A342A" }}>
            {news.headline}
          </h2>
          {news.ai_analysis !== null && (
            <div className="flex-shrink-0 mt-0.5">
              <SentimentBadge sentiment={news.ai_analysis.sentiment} />
            </div>
          )}
        </div>

        {/* AIInsightBox — always rendered, handles pending state internally */}
        <div className="mb-3">
          <AIInsightBox analysis={news.ai_analysis} />
        </div>

        {/* Stock badges row — hidden when pending */}
        {news.ai_analysis !== null && news.stock_impacts.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {news.stock_impacts.map((impact) => {
              const colors = BADGE_COLORS[impact.direction] ?? BADGE_COLORS.neutral;
              return (
                <span
                  key={impact.symbol}
                  aria-label={`${impact.symbol}: ${DIRECTION_LABEL[impact.direction] ?? "unchanged"}`}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-bold border"
                  style={{
                    backgroundColor: colors.bg,
                    color: colors.text,
                    borderColor: colors.border,
                  }}
                >
                  <span aria-hidden="true">{DIRECTION_ARROW[impact.direction] ?? "–"}</span>
                  {impact.symbol}
                </span>
              );
            })}
          </div>
        )}

        {/* Khaki divider */}
        <hr className="my-2" style={{ borderColor: "rgba(74,52,42,0.1)" }} />

        {/* Footer: source · relative time + category tag */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "#6b6560" }}>
            <span>{news.source}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{relativeTime(news.published_at)}</span>
          </div>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded tracking-widest"
            style={{ backgroundColor: cat.bg, color: cat.text }}
          >
            {cat.label}
          </span>
        </div>
      </Link>
    </article>
  );
}
