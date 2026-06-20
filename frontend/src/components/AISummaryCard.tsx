import { AISummary } from "@/types";

interface Props { summary: AISummary }

export default function AISummaryCard({ summary }: Props) {
  return (
    <div className="rounded-xl overflow-hidden border" style={{ borderColor: "rgba(74,52,42,0.1)" }}>
      <div className="px-4 py-3 flex items-center gap-2.5"
        style={{ backgroundColor: "#4A342A" }}>
        <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: "rgba(215,201,184,0.2)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D7C9B8" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4M12 8h.01"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-white">AI Daily Brief</div>
          <div className="text-xs" style={{ color: "rgba(215,201,184,0.5)" }}>{summary.date}</div>
        </div>
        <span className="text-xs font-bold px-2 py-0.5 rounded tracking-widest"
          style={{ backgroundColor: "rgba(215,201,184,0.15)", color: "#D7C9B8" }}>
          GPT-4o
        </span>
      </div>

      <div className="bg-white px-4 py-4">
        <p className="text-sm leading-relaxed mb-4" style={{ color: "#7D5A44" }}>
          {summary.overview}
        </p>

        <div className="space-y-2 mb-4">
          {summary.key_points.map((pt, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-xs font-bold mt-0.5 flex-shrink-0 w-4 h-4 rounded-sm flex items-center justify-center"
                style={{ backgroundColor: "#F5F1EA", color: "#B2967D" }}>{i + 1}</span>
              <p className="text-xs leading-relaxed" style={{ color: "#78716c" }}>{pt}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t text-xs"
          style={{ borderColor: "rgba(74,52,42,0.08)" }}>
          <span style={{ color: "#B2967D" }}>SET Target Range</span>
          <span className="font-bold font-mono" style={{ color: "#4A342A" }}>
            {summary.set_range_low.toLocaleString()} – {summary.set_range_high.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
