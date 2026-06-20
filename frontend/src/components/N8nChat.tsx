"use client";
import { useEffect } from "react";

export default function N8nChat() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/@n8n/chat/dist/style.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.type = "module";
    script.innerHTML = `
      import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';
      createChat({
        webhookUrl: 'https://stdkn.app.n8n.cloud/webhook/596bf97f-155d-4b22-a964-669953f19238/chat',
        initialMessages: [
          'สวัสดีครับ! ผมคือ ASK AI',
          'ถามได้เลยครับ เช่น วิเคราะห์หุ้น PTT, สรุปข่าวพลังงานวันนี้, หรือแนวโน้มตลาด',
        ],
        i18n: {
          en: {
            title: 'ASK AI',
            subtitle: 'ผู้ช่วย AI ด้านการเงินและการลงทุน',
            footer: '',
            getStarted: 'เริ่มสนทนา',
            inputPlaceholder: 'ถามเกี่ยวกับหุ้น ข่าว หรือการลงทุน...',
            closeButtonTooltip: 'ปิด',
          },
        },
      });
    `;
    document.body.appendChild(script);
  }, []);

  return null;
}
