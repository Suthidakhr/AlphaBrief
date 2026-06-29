import Link from "next/link";
import { clsx } from "clsx";
import { MarketThemeSummary } from "@/types";
import SentimentBadge from "@/components/SentimentBadge";

interface Props {
  themes: MarketThemeSummary[] | null;
}

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
        Weekly Themes
      </span>
      <span className="text-xs" style={{ color: "#B2967D" }}>แนวโน้มสัปดาห์</span>
    </div>
  );
}

export function TrendSummarySkeleton() {
  return (
    <div className={CARD_SHELL} style={CARD_BORDER} role="status" aria-label="Loading market themes">
      <div className="px-4 py-3 border-b animate-pulse" style={HEADER_BORDER}>
        <div className="h-3 bg-linen rounded w-28" />
      </div>
      <div
        className="divide-y"
        style={{ "--tw-divide-color": "rgba(74,52,42,0.06)" } as React.CSSProperties}
      >
        {[1, 2, 3].map((i) => (
          <div key={i} className="px-4 py-3 flex items-center justify-between gap-3 animate-pulse">
            <div className="h-3 bg-linen rounded flex-1" />
            <div className="h-3 bg-linen rounded w-20 flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TrendSummary({ themes }: Props) {
  if (themes === null) {
    const attemptedAt = new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Bangkok",
    });
    return (
      <div className={CARD_SHELL} style={CARD_BORDER}>
        <CardHeader />
        <div className="px-4 py-4 text-xs" style={{ color: "#6b6560" }}>
          Trends unavailable · Last attempted {attemptedAt} BKK
        </div>
      </div>
    );
  }

  if (themes.length === 0) {
    return (
      <div className={CARD_SHELL} style={CARD_BORDER}>
        <CardHeader />
        <div className="px-4 py-4 text-xs" style={{ color: "#6b6560" }}>
          No active themes today.
        </div>
      </div>
    );
  }

  const topThemes = themes
    .slice()
    .sort((a, b) => new Date(b.last_article_at).getTime() - new Date(a.last_article_at).getTime())
    .slice(0, 3);

  return (
    <div className={CARD_SHELL} style={CARD_BORDER}>
      <CardHeader />
      <div
        className="divide-y"
        style={{ "--tw-divide-color": "rgba(74,52,42,0.06)" } as React.CSSProperties}
      >
        {topThemes.map((theme) => (
          <Link
            key={theme.theme_id}
            href={`/trends/${encodeURIComponent(theme.theme_id)}`}
            className={clsx(
              "px-4 py-3 flex items-center justify-between gap-3",
              "hover:bg-stone-50 transition-colors",
              "focus:outline-none focus-visible:shadow-[0_0_0_2px_#ffffff,0_0_0_4px_#4A342A]",
            )}
          >
            <span className="text-[13px] font-medium min-w-0 truncate" style={{ color: "#4A342A" }}>
              {theme.name}
            </span>
            <SentimentBadge sentiment={theme.overall_sentiment} />
          </Link>
        ))}
      </div>
      <div
        className="px-4 py-3 border-t flex justify-end"
        style={{ borderColor: "rgba(74,52,42,0.06)" }}
      >
        <Link
          href="/trends"
          className="text-xs font-bold tracking-widest uppercase hover:underline focus:outline-none focus-visible:shadow-[0_0_0_2px_#ffffff,0_0_0_4px_#4A342A]"
          style={{ color: "#B2967D" }}
        >
          View all trends →
        </Link>
      </div>
    </div>
  );
}
