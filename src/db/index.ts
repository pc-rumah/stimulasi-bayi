import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

config({ path: ".env.local" });
config();

const connectionString = process.env["DATABASE_URL"] || "";

// For Supabase pooler / transaction mode, prepare: false prevents unsupported prepared statement errors
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });

export * from "./schema";
