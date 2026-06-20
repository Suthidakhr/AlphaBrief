import { MarketIndex } from "@/types";

interface Props { indices: MarketIndex[] }

export default function MarketOverviewWidget({ indices }: Props) {
  return (
    <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "rgba(74,52,42,0.1)" }}>
      <div className="px-4 py-3 border-b flex items-center justify-between"
        style={{ borderColor: "rgba(74,52,42,0.08)", backgroundColor: "#F5F1EA" }}>
        <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#7D5A44" }}>
          Market Indices
        </span>
        <span className="text-xs" style={{ color: "#B2967D" }}>ดัชนีตลาด</span>
      </div>
      <div className="divide-y" style={{ "--tw-divide-opacity": "0.06" } as React.CSSProperties}>
        {indices.map((idx) => (
          <div key={idx.symbol} className="flex items-center justify-between px-4 py-2.5 hover:bg-stone-50 transition-colors">
            <div>
              <div className="text-sm font-semibold" style={{ color: "#4A342A" }}>{idx.name}</div>
              <div className="text-xs mt-0.5 font-mono" style={{ color: "#B2967D" }}>{idx.symbol}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold font-mono" style={{ color: "#4A342A" }}>
                {idx.price.toLocaleString()}
              </div>
              <div className={`text-xs font-semibold font-mono flex items-center justify-end gap-0.5 mt-0.5 ${
                idx.change >= 0 ? "text-green-600" : "text-red-500"
              }`}>
                {idx.change >= 0 ? "▲" : "▼"} {Math.abs(idx.change_pct).toFixed(2)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
