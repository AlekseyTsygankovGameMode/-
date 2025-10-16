import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const queryClient = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(queryClient);