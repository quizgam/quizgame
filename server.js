// server.js — AI proxy example (Node/Express)
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// simple endpoint for AI feedback
app.post('/api/ai/feedback', async (req, res) => {
  const { mode, userText, prompt } = req.body;
  // validate
  if(!userText) return res.status(400).json({ error: 'Missing userText' });

  // Build a prompt for the LLM
  const rolePrompt = (mode === 'speaking')
    ? `You are an expert English tutor. Evaluate the user's spoken sentence for pronunciation hints, grammar corrections and a short suggested improved phrasing.`
    : `You are an expert English tutor. Provide grammar corrections, idiomatic improvements, and suggestions to improve clarity.`;

  const system = rolePrompt;
  const user = `User text: "${userText}". Context prompt: "${prompt||''}". Provide concise feedback (2-4 bullet points) and a corrected version.`;

  try{
    // Example calling OpenAI-compatible API (replace with your provider)
    const OPENAI_KEY = process.env.OPENAI_API_KEY;
    if(!OPENAI_KEY) return res.status(500).json({ error: 'AI key not configured on server.' });

    const payload = {
      model: "gpt-4o-mini", // change depending on provider / plan
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ],
      max_tokens: 400,
      temperature: 0.2
    };

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method:'POST',
      headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer '+OPENAI_KEY },
      body: JSON.stringify(payload)
    });
    const data = await r.json();
    const answer = (data.choices && data.choices[0] && data.choices[0].message) ? data.choices[0].message.content : JSON.stringify(data);
    res.json({ feedback: answer });
  }catch(err){
    console.error(err);
    res.status(500).json({ error: 'AI error', details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log('AI proxy running on', PORT));
