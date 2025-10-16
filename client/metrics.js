function getClientId() {
  let id = localStorage.getItem('client_id');
  if (!id) {
    id = Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
    localStorage.setItem('client_id', id);
  }
  return id;
}

const clientId = getClientId();

export async function sendTurnEval({ match_id, turn_index, user_text, model_text, metrics, claims_checked }) {
  try {
    await fetch('/api/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'TURN_EVAL',
        client_id: clientId,
        match_id,
        turn_index,
        user_text,
        model_text,
        metrics,
        claims_checked
      })
    });
  } catch (e) {
    console.warn('TURN_EVAL не отправлен:', e);
  }
}

export async function sendSessionEnd({ username, display_name, topic, total_score, result, opponent_type }) {
  try {
    await fetch('/api/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'SESSION_END',
        client_id: clientId,
        username,
        display_name,
        topic,
        total_score,
        result,
        opponent_type
      })
    });
  } catch (e) {
    console.warn('SESSION_END не отправлен:', e);
  }
}

export { clientId };
