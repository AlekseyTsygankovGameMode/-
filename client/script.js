import { sendTurnEval, sendSessionEnd, clientId } from './metrics.js';

const debateContainer = document.getElementById('debate-container');
const debateForm = document.getElementById('debate-form');
const userInput = document.getElementById('user-input');
const statusDiv = document.getElementById('status');
const endSessionBtn = document.getElementById('end-session');

let matchId = null;
let roundIndex = 0;
let history = [];
let sessionActive = true;

function startMatch() {
  matchId = Date.now();
  roundIndex = 0;
  history = [];
  sessionActive = true;
  debateContainer.innerHTML = '';
  statusDiv.textContent = '';
  userInput.value = '';
  userInput.disabled = false;
}

startMatch();

function renderHistory() {
  debateContainer.innerHTML = '';
  history.forEach(turn => {
    const userMsg = document.createElement('div');
    userMsg.className = 'user-msg';
    userMsg.textContent = `Вы: ${turn.user_text}`;
    debateContainer.appendChild(userMsg);

    if (turn.model_text) {
      const modelMsg = document.createElement('div');
      modelMsg.className = 'model-msg';
      modelMsg.textContent = `ИИ: ${turn.model_text}`;
      debateContainer.appendChild(modelMsg);
    }
  });
}

debateForm.onsubmit = async (e) => {
  e.preventDefault();
  if (!sessionActive) return;

  const userText = userInput.value.trim();
  if (!userText) return;

  history.push({ user_text: userText, model_text: null });
  renderHistory();
  userInput.value = '';
  userInput.disabled = true;
  statusDiv.textContent = 'ИИ думает...';

  const messages = history.map(turn => [
    { role: 'user', content: turn.user_text },
    turn.model_text ? { role: 'assistant', content: turn.model_text } : null
  ]).flat().filter(Boolean);

  let modelText = '';
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages })
    });
    const data = await res.json();
    modelText = data.reply || '(нет ответа)';
  } catch {
    modelText = '(ошибка связи с моделью)';
  }

  history[history.length - 1].model_text = modelText;
  renderHistory();
  statusDiv.textContent = '';
  userInput.disabled = false;
  roundIndex += 1;

  sendTurnEval({
    match_id: matchId,
    turn_index: roundIndex,
    user_text: userText,
    model_text: modelText,
    metrics: {},
    claims_checked: false
  });

  if (roundIndex >= 3) endSession();
};

function endSession() {
  if (!sessionActive) return;
  sessionActive = false;
  userInput.disabled = true;
  statusDiv.textContent = 'Матч завершён!';

  const result = Math.random() > 0.5 ? 'win' : 'loss';

  sendSessionEnd({
    username: null,
    display_name: null,
    topic: null,
    total_score: 0,
    result,
    opponent_type: 'ai'
  });
}

endSessionBtn.onclick = endSession;
