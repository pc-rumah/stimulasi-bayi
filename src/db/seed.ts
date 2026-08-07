/**
 * Seed script — creates the first admin user in Supabase Auth + users table.
 *
 * Usage:
 *   npx tsx src/db/seed.ts
 *
 * Set these env vars first (or add to .env.local):
 *   ADMIN_EMAIL=admin@example.com
 *   ADMIN_PASSWORD=yourSecurePassword123
 *   VITE_SUPABASE_URL=https://...
 *   VITE_SUPABASE_KEY=<service_role key>  ← NOT the anon key
 *
 * IMPORTANT: For admin user creation you MUST use the Supabase service_role key,
 * NOT the publishable anon key. Get it from:
 * Supabase Dashboard → Project Settings → API → service_role (secret)
 */

import { createClient } from "@supabase/supabase-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users } from "./schema";
import { eq } from "drizzle-orm";
import "dotenv/config";

const SUPABASE_URL = process.env["VITE_SUPABASE_URL"];
const SUPABASE_SERVICE_KEY = process.env["SUPABASE_SERVICE_KEY"]; // service_role key
const ADMIN_EMAIL = process.env["ADMIN_EMAIL"] ?? "admin@speechpro.id";
const ADMIN_PASSWORD = process.env["ADMIN_PASSWORD"] ?? "admin123456";
const DATABASE_URL = process.env["DATABASE_URL"] ?? "";

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error(
    "❌  Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_KEY in environment.\n" +
      "    Get the service_role key from Supabase Dashboard → Project Settings → API.",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const client = postgres(DATABASE_URL, { prepare: false });
const db = drizzle(client, { schema: { users } });

async function main() {
  console.log(`\n🌱  Seeding admin user: ${ADMIN_EMAIL}`);

  // 1. Create in Supabase Auth
  const { data, error } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
  });

  if (error) {
    if (error.message.includes("already been registered") || error.message.includes("already registered")) {
      console.log("ℹ️  User sudah ada di Supabase Auth, lanjut ke DB...");
      // Fetch existing user
      const { data: list } = await supabase.auth.admin.listUsers();
      const existing = list?.users.find((u) => u.email === ADMIN_EMAIL);
      if (!existing) throw new Error("Cannot find existing user");
      await upsertDbUser(existing.id);
    } else {
      console.error("❌  Supabase Auth error:", error.message);
      process.exit(1);
    }
  } else {
    console.log("✅  Supabase Auth user created:", data.user.id);
    await upsertDbUser(data.user.id);
  }

  await client.end();
  console.log("\n🎉  Admin seed selesai!");
  console.log(`   Email   : ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  console.log("\n   ⚠️  Segera ganti password setelah login pertama!\n");
}

async function upsertDbUser(userId: string) {
  const existing = await db.query.users.findFirst({ where: eq(users.id, userId) });

  if (existing) {
    await db.update(users).set({ isAdmin: true }).where(eq(users.id, userId));
    console.log("✅  DB user diupdate menjadi admin.");
  } else {
    await db.insert(users).values({ id: userId, email: ADMIN_EMAIL, isAdmin: true });
    console.log("✅  DB user dibuat sebagai admin.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
