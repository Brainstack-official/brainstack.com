```javascript
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method Not Allowed"
    });
  }

  try {
    const { messages, system } = req.body;

    const prompt =
      system +
      "\n\n" +
      messages.map(m => `${m.role}: ${m.content}`).join("\n");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000
          }
        })
      }
    );

    const data = await response.json();

    // If Gemini returns an error
    if (!response.ok) {
      console.error("Gemini Error:", data);

      return res.status(response.status).json({
        error: data.error?.message || "Gemini API Error"
      });
    }

    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't generate a reply.";

    return res.status(200).json({
      content: [
        {
          text: reply
        }
      ]
    });

  } catch (err) {
    console.error("Server Error:", err);

    return res.status(500).json({
      error: err.message || "Internal Server Error"
    });
  }
}
```
