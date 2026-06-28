// ============================================================
// FILE: api/chat.js
// This is a Vercel Serverless Function.
// It keeps your Gemini API key 100% hidden from users.
// ============================================================

export default async function handler(req, res) {

  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Get the API key from Vercel Environment Variables (never exposed to users)
  const GEMINI_KEY = process.env.GEMINI_KEY;

  if (!GEMINI_KEY) {
    return res.status(500).json({ error: "API key not configured" });
  }

  try {
    const { messages, systemPrompt } = req.body;

    // Call Gemini API from the server side
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + GEMINI_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemPrompt }]
          },
          contents: messages.map(function(m) {
            return {
              role: m.role === "assistant" ? "model" : "user",
              parts: [{ text: m.content }]
            };
          })
        })
      }
    );

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text ||
                  "Sorry, I didn't get a response. Please try again!";

    return res.status(200).json({ reply });

  } catch (error) {
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}