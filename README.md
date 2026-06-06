# Himanshu Jain — AI Portfolio Copilot

An interactive personal portfolio with an AI Career Copilot that answers questions about my skills, projects, experience, and background — grounded entirely in my own data, no hallucinations.

**Live:** [himanshu-jain.onrender.com](https://himanshu-jain.onrender.com) *(update after deploy)*
**GitHub:** [github.com/Himanshu-coder101/portfolio](https://github.com/Himanshu-coder101/portfolio)

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express |
| AI | Groq API (llama-3.1-8b-instant) |
| Data | portfolio.json (structured JSON) |
| Deployment | Render (full-stack) |

---

## Architecture

```
Browser (HTML/CSS/JS)
       │
       │  POST /api/chat  (no API key here)
       ▼
Express Server (Render)
       │
       │  GROQ_API_KEY from environment variable
       ▼
Groq API → llama-3.1-8b-instant
       │
       ▼
Reply → Browser
```

- The frontend is served as static files from the Express server's `public/` folder.
- The Groq API key lives only in Render's environment variables — never in client code.
- An in-memory cache on the server returns repeated questions instantly without using API tokens.
- The AI system prompt is built from `portfolio.json` at runtime, grounding every answer in real data.

---

## Project Structure

```
himanshu-portfolio/
├── public/                  # Frontend (served as static files)
│   ├── index.html
│   ├── style.css
│   ├── main.js              # Calls /api/chat, no key exposed
│   └── portfolio.json       # Single source of truth for all data
├── server/
│   ├── server.js            # Express server + Groq proxy
│   ├── package.json
│   └── .env.example         
├── .gitignore
├── sample_qa_pairs.md
└── README.md
```

---

## AI Design

**How grounding works:**
`portfolio.json` is loaded by the frontend and injected into every API call as a system prompt. The model is instructed to answer only from that data and say "I don't have that info" for anything outside it.

**Prompt structure:**
```
System: You are an AI Career Copilot for Himanshu Jain. Answer in 2-3 sentences using only the info below...
        [About, Education, Skills, Projects, Experience, Interests, Contact]

User: [question]
Assistant: [answer]
```

**Edge case handling:**
- Unknown questions → model responds with "I don't have that information available"
- Repeated questions → served from server-side in-memory cache
- API errors → friendly error message shown in chat UI

---

## Local Setup

### Prerequisites
- Node.js v18+
- A Groq API key — get one free at [console.groq.com](https://console.groq.com)

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/Himanshu-coder101/portfolio.git
cd portfolio

# 2. Install server dependencies
cd server
npm install

# 3. Create your .env file
cp .env.example .env
# Edit .env and add your GROQ_API_KEY

# 4. Start the server
node server.js

# 5. Open http://localhost:8000 in your browser
```

---

## Deployment (Render)

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Set these settings:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. Add environment variable: `GROQ_API_KEY` = your key
6. Click Deploy

---

## Challenges

**API key security**
Initially the Groq key was hardcoded in `main.js`, making it visible to anyone who opened DevTools or read the GitHub repo. Fixed by moving all Groq calls to an Express proxy server — the key now lives only in environment variables.

**Keeping AI grounded**
Without careful prompt design, the model would occasionally invent details. Fixed by injecting the full `portfolio.json` as a structured system prompt and explicitly instructing the model not to invent information.

---

## Future Plans

- Add a contact form using Web3Forms or EmailJS
- Stream AI responses token-by-token for a better chat feel
- Add typing indicators and timestamps to chat UI
- Dark/light theme toggle
- Deploy to a custom domain
- Adding voice activation in ai chat bots

---

Built as part of Caarya Innovative Solutions — AI Track · May–July 2026
