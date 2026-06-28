// ============================================================
// FILE: api/chat.js  — Vercel Serverless Function
// ============================================================

export default async function handler(req, res) {
console.log("METHOD =", req.method);
  // Allow CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const GEMINI_KEY = process.env.GEMINI_KEY;

  if (!GEMINI_KEY) {
    return res.status(500).json({ error: "GEMINI_KEY not found in environment variables" });
  }

  try {
    const { messages, systemPrompt } = req.body;

    const geminiMessages = messages.map(function(m) {
      return {
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      };
    });

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + GEMINI_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemPrompt }]
          },
          contents: geminiMessages
        })
      }
    );

    if (!response.ok) {
      const errData = await response.json();
      console.error("Gemini API error:", errData);
      return res.status(500).json({ error: "Gemini API error", details: errData });
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini.";

    return res.status(200).json({ reply });

  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: "Server error: " + error.message });
  }
}
