export default async function handler(req, res) {
  try {
    if (req.method === "OPTIONS") {
      res.setHeader("Access-Control-Allow-Origin", "https://store.seomew.com");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      return res.status(200).end();
    }
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { messages = [] } = req.body || {};

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.3,
        messages: [
          { role: "system", content: `
Sen Ideasoft’un performans yönetim asistanısın. Görevlerin:
1) Kullanıcıdan departman, rol, dönem, taslak hedef topla.
2) 2–3 Objective ve her biri için SMART KR öner.
3) Taslak varsa doğrula, hizala, puanla.
4) Türkçe özet + JSON çıktı üret.
Kısa, net, motive edici konuş.
          `},
          ...messages
        ]
      })
    });

    if (!r.ok) return res.status(r.status).json({ error: await r.text() });
    const data = await r.json();

    res.setHeader("Access-Control-Allow-Origin", "https://store.seomew.com");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.json({ reply: data.choices?.[0]?.message?.content?.trim() ?? "" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
}
