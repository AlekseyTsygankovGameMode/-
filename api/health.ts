export const config = {
  runtime: "edge",
};

export default async function handler(_req: Request): Promise<Response> {
  return new Response(
    JSON.stringify({
      ok: true,
      time: Date.now(),
      hasKey: Boolean(process.env.OPENAI_API_KEY),
      env: process.env.VERCEL_ENV || "unknown",
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
