import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("Missing DATABASE_URL. Please check your .env file or environment variables.");
}

export default defineConfig({
  schema: "./db/schema.ts",     // ✅ путь к твоей текущей схеме
  out: "./migrations",          // куда сохраняются миграции
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});