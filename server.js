require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(bodyParser.json());

/* --- Route de test (page d'accueil) --- */
app.get("/", (req, res) => {
  res.send("✅ Backend is running!");
});

/* --- Feedback IA (GPT) --- */
app.post("/api/ai/feedback", async (req, res) => {
  const { mode, userText, targetLang } = req.body;
  if (!userText) return res.status(400).json({ error: "Missing userText" });

  const langName =
    targetLang === "fr" ? "French" : targetLang === "de" ? "German" : "English";

  const systemPrompt = `You are an expert ${langName} tutor. 
Correct mistakes, suggest improvements, and provide clear explanations for ${mode} exercises.`;

  const userPrompt = `Mode: ${mode}\nLanguage: ${langName}\nStudent text: "${userText}"\nPlease:
1. Give a corrected version
2. List 2-3 improvement tips
3. Propose one short follow-up exercise.`;

  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // GPT-5 si dispo
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 500,
        temperature: 0.3
      })
    });

    const data = await r.json();
    if (data.error) throw new Error(data.error.message);

    const answer = data.choices?.[0]?.message?.content || "No response.";
    res.json({ feedback: answer });
  } catch (err) {
    console.error("AI error:", err.message);
    res.status(500).json({ error: "AI request failed", details: err.message });
  }
});

/* --- Text-to-Speech (TTS) --- */
app.post("/api/ai/tts", async (req, res) => {
  const { text, lang } = req.body;
  if (!text) return res.status(400).json({ error: "Missing text" });

  try {
    const r = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        voice: lang === "fr" ? "alloy" : lang === "de" ? "verse" : "aria",
        input: text
      })
    });

    if (!r.ok) {
      const err = await r.text();
      throw new Error(err);
    }

    res.setHeader("Content-Type", "audio/mpeg");
    r.body.pipe(res);
  } catch (err) {
    console.error("TTS error:", err.message);
    res.status(500).json({ error: "TTS failed", details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Backend running on http://localhost:${PORT}`)
);
