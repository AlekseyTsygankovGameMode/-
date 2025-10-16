import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const config = {
  runtime: "edge",
};

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "METHOD_NOT_ALLOWED" }), {
      status: 405,
    });
  }

  const body = await req.json();
  const {
    topic = "",
    userArg = "",
    history = [],
  } = body;

  const cleanArg = String(userArg || "").replace(/\s+/g, " ").trim();
  if (cleanArg.length < 3) {
    return new Response(JSON.stringify({ code: "EMPTY_ARG" }), { status: 422 });
  }

  const messages = [
    {
      role: "system",
      content: `You are a concise but sharp debate opponent. Topic: "${topic}". Respond with 2–4 sentences, direct and specific.`,
    },
    ...(Array.isArray(history) ? history : []),
    { role: "user", content: cleanArg },
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      max_tokens: 250,
      messages,
    });

    const reply =
      completion.choices?.[0]?.message?.content || "I don't have a response right now.";

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[api/chat] error:", err?.response?.data || err?.message || err);
    return new Response(JSON.stringify({ error: "OPENAI_FAIL" }), { status: 500 });
  }
}
