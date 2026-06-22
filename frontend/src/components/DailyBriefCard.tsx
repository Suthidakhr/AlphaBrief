import { DailyBrief } from "@/types";
import SentimentBadge from "./SentimentBadge";

const SENTIMENT_OVERVIEW: Record<string, string> = {
  bullish: "Markets are showing bullish momentum today.",
  bearish: "Markets are facing bearish pressure today.",
  neutral: "Markets are showing neutral momentum today.",
};

function formatBkkDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatBkkTime(isoString: string): string {
  const time = new Date(isoString).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Bangkok",
  });
  return `${time} BKK`;
}

const AI_ICON = (
  <div
    className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
    style={{ backgroundColor: "rgba(215,201,184,0.2)" }}
  >
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#D7C9B8"
      strokeWidth="2.5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  </div>
);

export default function DailyBriefCard({ brief }: { brief: DailyBrief }) {
  const overview = SENTIMENT_OVERVIEW[brief.overall_sentiment] ?? "Market data is available for today.";
  const dateLabel = formatBkkDate(brief.brief_date);
  const timeLabel = formatBkkTime(brief.generated_at);

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "1px solid rgba(74,52,42,0.1)" }}
    >
      {/* Zone 1 — espresso header */}
      <div
        className="px-4 py-3 flex items-start gap-2.5"
        style={{ backgroundColor: "#4A342A" }}
      >
        {AI_ICON}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-white">AI Daily Brief</div>
          <div
            className="text-xs"
            style={{ color: "rgba(215,201,184,0.5)" }}
            aria-hidden="true"
          >
            ภาพรวมตลาด
          </div>
          {brief.is_fallback && (
            <div className="text-xs mt-0.5" style={{ color: "rgba(215,201,184,0.5)" }}>
              Today&#39;s brief is being prepared
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <SentimentBadge sentiment={brief.overall_sentiment} />
          <span className="text-xs" style={{ color: "rgba(215,201,184,0.7)" }}>
            {dateLabel}
          </span>
        </div>
      </div>

      {/* Zone 2 — white body */}
      <div className="bg-white px-4 py-4">
        <p className="text-sm leading-relaxed mb-4" style={{ color: "#7D5A44" }}>
          {overview}
        </p>

        <div className="space-y-2 mb-4">
          {brief.key_developments.map((item, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span
                className="text-xs font-bold mt-0.5 flex-shrink-0 w-4 h-4 rounded-sm flex items-center justify-center"
                style={{ backgroundColor: "#F5F1EA", color: "#B2967D" }}
              >
                {i + 1}
              </span>
              <p className="text-xs leading-relaxed" style={{ color: "#78716c" }}>
                {item}
              </p>
            </div>
          ))}
        </div>

        <div
          className="pt-3 border-t text-xs"
          style={{ borderColor: "rgba(74,52,42,0.08)" }}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span style={{ color: "#B2967D" }}>{timeLabel}</span>
            {brief.is_fallback && (
              <span style={{ color: "#6b6560" }}>(From yesterday)</span>
            )}
          </div>
          <p style={{ color: "#6b6560", fontSize: "10px" }}>
            AI-generated market summary for informational purposes only. Not investment advice.
          </p>
        </div>
      </div>
    </div>
  );
}

export function DailyBriefCardSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading daily brief"
      className="rounded-xl overflow-hidden"
      style={{ border: "1px solid rgba(74,52,42,0.1)" }}
    >
      {/* Zone 1 skeleton — espresso bg */}
      <div className="px-4 py-3 animate-pulse" style={{ backgroundColor: "#4A342A" }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded flex-shrink-0"
            style={{ backgroundColor: "rgba(215,201,184,0.2)" }}
          />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 rounded" style={{ backgroundColor: "rgba(215,201,184,0.25)", width: "60%" }} />
            <div className="h-3 rounded" style={{ backgroundColor: "rgba(215,201,184,0.15)", width: "40%" }} />
          </div>
        </div>
      </div>

      {/* Zone 2 skeleton — white bg */}
      <div className="bg-white px-4 py-4 animate-pulse space-y-2">
        <div className="h-3 bg-linen rounded" style={{ width: "90%" }} />
        <div className="h-3 bg-linen rounded" style={{ width: "80%" }} />
        <div className="h-3 bg-linen rounded" style={{ width: "70%" }} />
        <div className="h-3 bg-linen rounded mt-3" style={{ width: "45%" }} />
      </div>
    </div>
  );
}

export function DailyBriefCardError() {
  const attempted = formatBkkTime(new Date().toISOString());

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "1px solid rgba(74,52,42,0.1)" }}
    >
      {/* Zone 1 — espresso header */}
      <div
        className="px-4 py-3 flex items-center gap-2.5"
        style={{ backgroundColor: "#4A342A" }}
      >
        {AI_ICON}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-white">AI Daily Brief</div>
          <div
            className="text-xs"
            style={{ color: "rgba(215,201,184,0.5)" }}
            aria-hidden="true"
          >
            ภาพรวมตลาด
          </div>
        </div>
      </div>

      {/* Zone 2 — error message */}
      <div className="bg-white px-4 py-4">
        <p className="text-sm" style={{ color: "#6b6560" }}>
          Daily Brief unavailable · Last attempted {attempted}
        </p>
      </div>
    </div>
  );
}
