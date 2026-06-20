import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import N8nChat from "@/components/N8nChat";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "AlphaBrief — AI Financial Research Assistant",
  description: "รวบรวมข่าวการเงิน วิเคราะห์ผลกระทบต่อหุ้น และสรุปแนวโน้มด้วย AI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <N8nChat />
      </body>
    </html>
  );
}
