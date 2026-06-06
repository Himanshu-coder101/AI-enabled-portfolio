const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

// Serve static frontend files from public/
app.use(express.static(path.join(__dirname, '../public')));

// In-memory cache for repeated questions
const cache = {};

// POST /api/chat — proxy to Groq, key stays server-side
app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  // Cache check on last user message
  const lastUser = [...messages].reverse().find(m => m.role === 'user');
  const cacheKey = lastUser ? lastUser.content.trim().toLowerCase() : null;
  if (cacheKey && cache[cacheKey]) {
    return res.json({ reply: cache[cacheKey] });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages,
        max_tokens: 300
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const reply = data.choices?.[0]?.message?.content || 'Sorry, something went wrong.';

    if (cacheKey) cache[cacheKey] = reply;

    res.json({ reply });
  } catch (err) {
    console.error('Groq API error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// Catch-all: serve index.html for any other route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
