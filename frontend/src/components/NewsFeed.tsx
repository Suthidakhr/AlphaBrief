"use client";
import { useState } from "react";
import { NewsItem } from "@/types";
import NewsCard from "@/components/NewsCard";

const ALL = "ทั้งหมด";

interface Props {
  news: NewsItem[];
}

export default function NewsFeed({ news }: Props) {
  const categories = [ALL, ...Array.from(new Set(news.map((n) => n.category)))];
  const [active, setActive] = useState(ALL);

  const filtered = active === ALL ? news : news.filter((n) => n.category === active);

  return (
    <>
      <div className="flex gap-2 flex-wrap mb-6">
        {categories.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className="px-4 py-1.5 rounded-full text-sm font-medium border transition-colors"
            style={
              active === tab
                ? { backgroundColor: "#4A342A", color: "#D7C9B8", borderColor: "#4A342A" }
                : { backgroundColor: "white", color: "#4A342A", borderColor: "rgba(74,52,42,0.2)" }
            }>
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((item) => (
          <NewsCard key={item.id} news={item} />
        ))}
        {filtered.length === 0 && (
          <p className="text-center py-12 text-sm" style={{ color: "#B2967D" }}>
            ไม่พบข่าวในหมวดนี้
          </p>
        )}
      </div>
    </>
  );
}
