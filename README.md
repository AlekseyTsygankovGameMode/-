# Game Mode Alpha — Debate Micro-Pilot

A self-adaptive, moderation-first debate loop with **ephemeral sessions** and a real-time **ELO leaderboard**.  
Built for fast iteration, clean feedback, and measurable alignment.


---

## ⚡ Quickstart

1. `git clone` → `npm install`
2. Create `.env` from `.env.example` and set:
   ```env
   OPENAI_API_KEY=sk-...
   DATABASE_URL=postgres://...
   ```
3. Run locally:
   ```bash
   npm run dev
   ```
4. Push schema to Supabase:
   ```bash
   npx drizzle-kit push
   ```

---

## 🧠 API Routes (Edge Functions)

### `POST /api/chat`
- Input: `{ messages: ChatMessage[] }`
- Output: `{ reply: string }`

Sends a chat turn and gets a response from the model.

---

### `POST /api/metrics`
Supports two types:

#### `TURN_EVAL`
```json
{
  "type": "TURN_EVAL",
  "client_id": "abc123",
  "match_id": 123456,
  "turn_index": 1,
  "user_text": "argument",
  "model_text": "response",
  "metrics": {},
  "claims_checked": false
}
```

#### `SESSION_END`
```json
{
  "type": "SESSION_END",
  "client_id": "abc123",
  "username": null,
  "display_name": null,
  "topic": null,
  "total_score": 0,
  "result": "win",
  "opponent_type": "ai"
}
```

---

## 🔐 Safety Architecture

- Session-bound logic only — **no logs, no PII**.
- Moderation-first input pipeline.
- Adaptive rollback if moderation or drift triggers.
- Anonymous client ID (localStorage-based).

> **Built for trust, not tracking.**

---

## 📈 Metrics Engine

Uses Supabase with Drizzle ORM to track:

- `ELO`, `wins`, `losses`, `games`
- Match metadata (`opponent_type`, `topic`)
- Turn-level history (`TURN_EVAL` records)

---

## 🧭 Roadmap

- [ ] Leaderboard: **Today / Week / All-Time**
- [ ] Bo3 / Bo5 rounds
- [ ] Opponent styles: passive, aggressive, sarcastic
- [ ] Judge module v1 (rubric scoring)
- [ ] Daily quests, share badge (PNG)
- [ ] Profile linking via nickname (optional auth later)

---

## 🧪 Stack

- Vite + Vanilla JS
- Edge API via Vercel
- Supabase + Drizzle ORM
- OpenAI (chat completions)
- TailwindCSS

---

## 📄 License

MIT — Alexey Tsygankov, 2025
