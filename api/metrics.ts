import { db } from "../db/client";
import { profiles, ratings, rounds, matches } from "../db/schema";
import { eq, sql } from "drizzle-orm";

export const config = {
  runtime: "edge",
};

function computeElo(current: number, scored: number, opponent = 1200) {
  const expected = 1 / (1 + Math.pow(10, (opponent - current) / 400));
  const k = 32;
  const delta = Math.round(k * (scored - expected));
  return { next: Math.max(100, current + delta), delta };
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), { status: 405 });
  }

  try {
    const body = await req.json();

    if (body.type === "TURN_EVAL") {
      await db.insert(rounds).values({
        clientId: body.client_id,
        matchId: body.match_id,
        turnIndex: body.turn_index,
        userText: body.user_text,
        modelText: body.model_text,
        metrics: body.metrics ?? {},
        claimsChecked: !!body.claims_checked,
      });
      return new Response(JSON.stringify({ ok: true }));
    }

    if (body.type === "SESSION_END") {
      const now = new Date();

      await db
        .insert(profiles)
        .values({
          clientId: body.client_id,
          username: body.username ?? null,
          displayName: body.display_name ?? null,
          lastSeen: now,
        })
        .onConflictDoUpdate({
          target: profiles.clientId,
          set: {
            username: body.username ?? sql`EXCLUDED.username`,
            displayName: body.display_name ?? sql`EXCLUDED.display_name`,
            lastSeen: now,
          },
        });

      const [curr] = await db
        .select({
          elo: ratings.elo,
          wins: ratings.wins,
          losses: ratings.losses,
          games: ratings.games,
        })
        .from(ratings)
        .where(eq(ratings.clientId, body.client_id))
        .limit(1);

      const currentElo = curr?.elo ?? 1200;
      const scoreNum = body.result === "win" ? 1 : body.result === "draw" ? 0.5 : 0;
      const { next, delta } = computeElo(currentElo, scoreNum);

      const wins = (curr?.wins ?? 0) + (body.result === "win" ? 1 : 0);
      const losses = (curr?.losses ?? 0) + (body.result === "loss" ? 1 : 0);
      const games = (curr?.games ?? 0) + 1;

      await db
        .insert(ratings)
        .values({ clientId: body.client_id, elo: next, wins, losses, games })
        .onConflictDoUpdate({
          target: ratings.clientId,
          set: { elo: next, wins, losses, games },
        });

      await db.insert(matches).values({
        clientId: body.client_id,
        topic: body.topic ?? null,
        opponentType: body.opponent_type ?? "ai",
        score: body.total_score ?? 0,
        eloDelta: delta,
        endedAt: now,
      });

      return new Response(
        JSON.stringify({ ok: true, elo: next, eloDelta: delta, wins, losses, games }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ ok: false, error: "Unknown type" }), { status: 400 });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e?.message ?? "Unexpected error" }), {
      status: 500,
    });
  }
}
