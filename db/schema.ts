import {
  pgTable,
  text,
  integer,
  serial,
  timestamp,
  boolean,
  json,
  primaryKey,
} from "drizzle-orm/pg-core";

// 👤 Пользовательский профиль (анонимный или с ником)
export const profiles = pgTable("profiles", {
  clientId: text("client_id").primaryKey(),
  username: text("username"),
  displayName: text("display_name"),
  lastSeen: timestamp("last_seen", { withTimezone: true }),
});

// 📊 ELO-рейтинг и статистика
export const ratings = pgTable("ratings", {
  clientId: text("client_id").primaryKey(),
  elo: integer("elo").notNull(),
  wins: integer("wins").notNull(),
  losses: integer("losses").notNull(),
  games: integer("games").notNull(),
});

// 🧠 Раунды (TURN_EVAL)
export const rounds = pgTable("rounds", {
  id: serial("id").primaryKey(),
  clientId: text("client_id").notNull(),
  matchId: integer("match_id").notNull(),
  turnIndex: integer("turn_index").notNull(),
  userText: text("user_text").notNull(),
  modelText: text("model_text").notNull(),
  metrics: json("metrics").notNull(),
  claimsChecked: boolean("claims_checked").notNull(),
});

// 🏁 Завершённые матчи (SESSION_END)
export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  clientId: text("client_id").notNull(),
  topic: text("topic"),
  opponentType: text("opponent_type").default("ai"),
  score: integer("score").notNull(),
  eloDelta: integer("elo_delta").notNull(),
  endedAt: timestamp("ended_at", { withTimezone: true }).notNull(),
});