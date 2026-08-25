import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://user:password@localhost:5432/placeholder?sslmode=require";

const sql = neon(connectionString);
export const db = drizzle(sql, { schema });
