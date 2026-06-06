// ── CONFIG ──────────────────────────────────────────────
// API key is now on the server — never exposed in client code
const API_URL = '/api/chat';

// ── LOAD DATA ────────────────────────────────────────────
let portfolioData = null;

async function init() {
  const res = await fetch('portfolio.json');
  portfolioData = await res.json();
  renderAll();
}

function renderAll() {
  renderHero();
  renderAbout();
  renderSkills();
  renderProjects();
  renderExperience();
  renderEducation();
  renderContact();
  renderSamples();
}

// ── RENDER FUNCTIONS ─────────────────────────────────────

function renderHero() {
  const d = portfolioData;
  document.getElementById('hero-name').textContent = d.name;
  document.getElementById('hero-headline').textContent = d.headline;
  document.getElementById('hero-location').textContent = '📍 ' + d.location;
  document.getElementById('hero-email').href = 'mailto:' + d.email;
}

function renderAbout() {
  const d = portfolioData;
  document.getElementById('about-text').textContent = d.about;
  const container = document.getElementById('interests');
  d.interests.forEach(i => {
    const span = document.createElement('span');
    span.className = 'tag';
    span.textContent = i;
    container.appendChild(span);
  });
}

function renderSkills() {
  const s = portfolioData.skills;

  const groups = [
    { label: 'Programming Languages', items: s.programming_languages },
    { label: 'Web Development',       items: s.web_development },
    { label: 'Low-Level',             items: s.low_level_programming },
    { label: 'Computer Science',      items: s.computer_science.map(n => ({ name: n, level: 'Core' })) }
  ];

  const grid = document.getElementById('skills-grid');
  grid.innerHTML = '';

  groups.forEach(g => {
    const div = document.createElement('div');
    div.className = 'skill-group';
    div.innerHTML = `<h3>${g.label}</h3><div class="skill-list"></div>`;
    const list = div.querySelector('.skill-list');

    g.items.forEach(item => {
      const row = document.createElement('div');
      row.className = 'skill-item';
      const lvlClass = item.level === 'Intermediate' ? 'skill-level intermediate' : 'skill-level';
      row.innerHTML = `<span class="skill-name">${item.name}</span>
                       <span class="${lvlClass}">${item.level}</span>`;
      list.appendChild(row);
    });

    grid.appendChild(div);
  });
}

function renderProjects() {
  const container = document.getElementById('projects-grid');
  container.innerHTML = '';

  portfolioData.projects.forEach(p => {
    const card = document.createElement('div');
    card.className = 'project-card';

    const techTags = p.technologies
      .map(t => `<span class="tag">${t}</span>`)
      .join('');

    const githubLink = p.github
      ? `<a class="project-github" href="${p.github}" target="_blank" rel="noopener">View on GitHub →</a>`
      : '';

    card.innerHTML = `
      <div class="project-header">
        <span class="project-title">${p.title}</span>
        <span class="project-status">${p.status}</span>
      </div>
      <p class="project-desc">${p.description}</p>
      <div class="project-tech">${techTags}</div>
      ${githubLink}
    `;
    container.appendChild(card);
  });
}

function renderExperience() {
  const container = document.getElementById('experience-list');
  if (!container || !portfolioData.experience) return;
  container.innerHTML = '';

  portfolioData.experience.forEach(exp => {
    const card = document.createElement('div');
    card.className = 'edu-card';
    card.innerHTML = `
      <div class="edu-icon">💼</div>
      <div>
        <div class="edu-institution">${exp.company}</div>
        <div class="edu-degree">${exp.description}</div>
        <div class="tag-row">
          <span class="edu-badge">${exp.duration}</span>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderEducation() {
  const e = portfolioData.education;
  document.getElementById('edu-institution').textContent = e.institution;
  document.getElementById('edu-degree').textContent = `${e.degree} · ${e.branch}`;
  document.getElementById('edu-year').textContent = e.year;
  document.getElementById('edu-sem').textContent = e.semester;
}

function renderContact() {
  const c = portfolioData.contact;
  document.getElementById('contact-email').href = `mailto:${c.email}`;
  document.getElementById('contact-email-text').textContent = c.email;

  const li = document.getElementById('contact-linkedin');
  if (c.linkedin) {
    li.href = c.linkedin;
  } else {
    li.style.display = 'none';
  }

  const gh = document.getElementById('contact-github');
  if (c.github) {
    gh.href = c.github;
  } else {
    gh.style.display = 'none';
  }
}

function renderSamples() {
  const container = document.getElementById('sample-questions');
  const show = portfolioData.sample_questions.slice(0, 5);
  show.forEach(q => {
    const btn = document.createElement('button');
    btn.className = 'sample-btn';
    btn.textContent = q;
    btn.onclick = () => sendMessage(q);
    container.appendChild(btn);
  });
}

// ── AI CHAT ──────────────────────────────────────────────

const chatHistory = [];

function buildSystemPrompt() {
  const d = portfolioData;

  const skills = [
    ...d.skills.programming_languages,
    ...d.skills.web_development,
    ...d.skills.low_level_programming
  ].map(s => s.name + ' (' + s.level + ')').join(', ')
  + ', ' + d.skills.computer_science.join(', ');

  const projects = d.projects
    .map(p => p.title + ': ' + p.description)
    .join(' | ');

  const experience = (d.experience || [])
    .map(e => `${e.company} (${e.duration}): ${e.description}`)
    .join(' | ');

  return `You are an AI Career Copilot for ${d.name}. Answer in 2-3 sentences using only the info below. If something isn't here, say you don't have that info.

About: ${d.about}
Education: ${d.education.degree} in ${d.education.branch} at ${d.education.institution} (${d.education.year}). Also studied at Silver Oak School (CBSE, 97%).
Skills: ${skills}
Projects: ${projects}
Experience: ${experience}
Interests: ${d.interests.join(', ')}
Contact: ${d.email} | ${d.contact.linkedin}`;
}

function appendMessage(role, text) {
  const win = document.getElementById('chat-window');
  const div = document.createElement('div');
  div.className = `message ${role}`;
  div.textContent = text;
  win.appendChild(div);
  win.scrollTop = win.scrollHeight;
  return div;
}

async function sendMessage(text) {
  const input = document.getElementById('chat-input');
  const btn = document.getElementById('send-btn');
  const query = text || input.value.trim();
  if (!query) return;

  input.value = '';
  appendMessage('user', query);
  chatHistory.push({ role: 'user', content: query });

  const typingEl = appendMessage('bot typing', 'Thinking...');
  btn.disabled = true;

  try {
    const messages = [
      { role: 'system', content: buildSystemPrompt() },
      ...chatHistory
    ];

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages })
    });

    const data = await res.json();

    if (data.error) {
      typingEl.remove();
      appendMessage('bot', 'Error: ' + data.error);
      return;
    }

    typingEl.remove();
    appendMessage('bot', data.reply);
    speakReply(data.reply);
    chatHistory.push({ role: 'assistant', content: data.reply });

  } catch (err) {
    typingEl.remove();
    appendMessage('bot', `Error: ${err.message}`);
    console.error('Full error:', err);
  }

  btn.disabled = false;
}

// ── NAV ──────────────────────────────────────────────────

function toggleMenu() {
  document.getElementById('nav-links').classList.toggle('open');
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => {
      document.getElementById('nav-links').classList.remove('open');
    });
  });

  document.getElementById('chat-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  init();
});

// ── VOICE ─────────────────────────────────────────────────

let recognition = null;
let isListening = false;
let selectedVoice = null;

// Loading available voices and populate the dropdown
function loadVoices() {
  const select = document.getElementById('voice-select');
  if (!select) return;
  const voices = window.speechSynthesis.getVoices();
  select.innerHTML = '';
  voices.forEach((v, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `${v.name} (${v.lang})`;
    select.appendChild(opt);
  });
  // Default to first English voice
  const engIndex = voices.findIndex(v => v.lang.startsWith('en'));
  if (engIndex >= 0) {
    select.value = engIndex;
    selectedVoice = voices[engIndex];
  }
  select.onchange = () => {
    selectedVoice = voices[parseInt(select.value)];
  };
}

// Voices load async — handle both immediate and delayed
if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = loadVoices;
  loadVoices();
}

function toggleMic() {
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    alert('Voice input is not supported in this browser. Try Chrome or Edge.');
    return;
  }

  if (isListening) {
    recognition.stop();
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = true;  // Show text live as you speak
  recognition.continuous = false;

  const micBtn = document.getElementById('mic-btn');
  const input = document.getElementById('chat-input');

  recognition.onstart = () => {
    isListening = true;
    micBtn.textContent = '🔴';
    micBtn.title = 'Listening... click to stop';
    input.placeholder = 'Listening...';
  };

  recognition.onresult = (e) => {
    // Build transcript from all results so far
    let interim = '';
    let final = '';
    for (let i = 0; i < e.results.length; i++) {
      if (e.results[i].isFinal) {
        final += e.results[i][0].transcript;
      } else {
        interim += e.results[i][0].transcript;
      }
    }
    // Show live text in input box — user can edit before sending
    input.value = final || interim;
  };

  recognition.onend = () => {
    isListening = false;
    micBtn.textContent = '🎤';
    micBtn.title = 'Speak';
    input.placeholder = 'Ask me anything about Himanshu...';
    // Don't auto-send — let user review and hit Send or Enter
  };

  recognition.onerror = (e) => {
    isListening = false;
    micBtn.textContent = '🎤';
    input.placeholder = 'Ask me anything about Himanshu...';
    if (e.error !== 'no-speech') {
      console.error('Speech recognition error:', e.error);
    }
  };

  recognition.start();
}

// Read AI reply aloud using selected voice
function speakReply(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  if (selectedVoice) utterance.voice = selectedVoice;
  utterance.rate = 1;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}
