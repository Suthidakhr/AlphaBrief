import Navbar from "@/components/Navbar";

export default function AboutPage() {
  return (
    <>
      <Navbar />

      {/* Page header bar */}
      <div
        className="border-b px-6 py-3"
        style={{ backgroundColor: "#F5F1EA", borderColor: "rgba(74,52,42,0.1)" }}
      >
        <h1 className="text-base font-bold" style={{ color: "#4A342A" }}>
          About ASK{" "}
          <span className="font-normal text-sm ml-1" style={{ color: "#B2967D" }}>
            เกี่ยวกับ
          </span>
        </h1>
      </div>

      <main id="main-content" className="max-w-3xl mx-auto px-4 py-8 pb-tab-safe">

        {/* Section 1: Product Description and Scope */}
        <section className="mb-8">
          <h2 className="text-base font-bold mb-3" style={{ color: "#4A342A" }}>
            1. Product Description and Scope
          </h2>
          <div className="space-y-2 text-sm leading-relaxed" style={{ color: "#6b6560" }}>
            <p>
              ASK (Aware Signals &amp; Knowledge) is an AI-powered financial research assistant
              designed for Thai retail investors. It aggregates financial news from multiple sources
              and applies AI analysis to help you understand why market events matter — not to tell
              you what to trade.
            </p>
            <p>
              ASK covers: market news summaries, sentiment analysis of news items, market overview
              indices, sector performance snapshots, and trend summaries.
            </p>
            <p>
              ASK does not cover: portfolio management, trade execution, personalized investment
              advice, or real-time price feeds.
            </p>
          </div>
        </section>

        {/* Section 2: AI Analysis Limitations */}
        <section className="mb-8">
          <h2 className="text-base font-bold mb-3" style={{ color: "#4A342A" }}>
            2. AI Analysis Limitations
          </h2>
          <div className="space-y-2 text-sm leading-relaxed" style={{ color: "#6b6560" }}>
            <p>
              AI analysis on this platform is generated automatically using large language models.
              It is based on publicly available information and may not reflect real-time market
              conditions — there may be processing delays between events and their analysis.
            </p>
            <p>
              AI-generated analysis may contain errors, omissions, or inaccuracies. The models are
              trained on historical data and cannot predict future market movements or guarantee any
              financial outcome.
            </p>
            <p>
              Analysis should be used to form your own questions and research, not as a basis for
              investment decisions. Always verify information from primary sources before acting.
            </p>
          </div>
        </section>

        {/* Section 3: Data Sources */}
        <section className="mb-8">
          <h2 className="text-base font-bold mb-3" style={{ color: "#4A342A" }}>
            3. Data Sources Used
          </h2>
          <div className="space-y-2 text-sm leading-relaxed" style={{ color: "#6b6560" }}>
            <p>
              News content is aggregated from publicly available Thai and international financial
              news sources. Market data is sourced from publicly available exchange feeds.
              AI analysis is generated via large language models (GPT-4o).
            </p>
            <p>
              Data may be delayed and is not guaranteed to be complete, accurate, or up to date.
              ASK makes no warranty regarding the reliability or timeliness of any data displayed.
            </p>
          </div>
        </section>

        {/* Section 4: No Investment Advice */}
        <section className="mb-8">
          <h2 className="text-base font-bold mb-3" style={{ color: "#4A342A" }}>
            4. No Investment Advice
          </h2>
          <div className="space-y-2 text-sm leading-relaxed" style={{ color: "#6b6560" }}>
            <p>
              ASK is for educational and informational purposes only. Nothing on this platform
              constitutes investment advice, a recommendation to buy or sell any security, or a
              solicitation of any investment activity.
            </p>
            <p>
              Past analysis or market commentary displayed on this platform does not predict future
              results. You should consult a qualified, licensed financial advisor before making any
              investment decision.
            </p>
          </div>
        </section>

        {/* Section 5: Full Regulatory Disclaimer — non-removable structural JSX (FR-A04, NFR-C01) */}
        <section className="mb-8">
          <h2 className="text-base font-bold mb-3" style={{ color: "#4A342A" }}>
            5. Full Regulatory Disclaimer
          </h2>
          <div
            className="rounded-lg p-4 text-sm leading-relaxed"
            style={{
              backgroundColor: "#F5F1EA",
              borderLeft: "2px solid #B2967D",
              color: "#6b6560",
            }}
          >
            <p>
              ASK is not licensed, authorized, registered, or regulated by any financial regulatory
              authority in Thailand or elsewhere, including the Securities and Exchange Commission
              (SEC Thailand), the Bank of Thailand, or any equivalent body.
            </p>
            <p className="mt-3">
              The developers and operators of ASK are not responsible for any investment decisions
              made based on content from this platform. Use of this platform is entirely at your
              own risk.
            </p>
            <p className="mt-3 font-medium" style={{ color: "#4A342A" }}>
              AI-generated analysis is for informational purposes only and does not constitute
              investment advice. Always consult a qualified financial advisor before making
              investment decisions.
            </p>
          </div>
        </section>

      </main>

      <footer
        className="border-t mt-8 px-6 py-5 flex items-center justify-between text-xs"
        style={{
          backgroundColor: "#4A342A",
          borderColor: "rgba(215,201,184,0.1)",
          color: "rgba(215,201,184,0.4)",
        }}
      >
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm" style={{ color: "#D7C9B8" }}>
            ASK
          </span>
          <span>·</span>
          <span>AI Financial Research Assistant</span>
        </div>
        <div>For educational purposes only. Not investment advice.</div>
      </footer>
    </>
  );
}
