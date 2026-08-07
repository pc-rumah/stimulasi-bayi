import { createServerFn } from "@tanstack/react-start";
import { createServerClient, parseCookieHeader, serializeCookieHeader } from "@supabase/ssr";
import { getRequest, setResponseHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { db, users } from "@/db";
import { eq } from "drizzle-orm";

// ─────────────────────────────────────────────────────────────────────────────
// Helper: build a Supabase server client wired to the current request/response
// ─────────────────────────────────────────────────────────────────────────────
function createSupabaseServerClient() {
  const request = getRequest();
  const cookieHeader = request?.headers.get("cookie") ?? "";

  return createServerClient(
    process.env["VITE_SUPABASE_URL"]!,
    process.env["VITE_SUPABASE_KEY"]!,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(cookieHeader);
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            setResponseHeader(
              "Set-Cookie",
              serializeCookieHeader(name, value, options),
            );
          });
        },
      },
    },
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// getSession — returns { user, isAdmin } or null
// ─────────────────────────────────────────────────────────────────────────────
export const getSessionFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    // Fetch is_admin from our users table
    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, user.id),
    });

    return {
      id: user.id,
      email: user.email ?? "",
      isAdmin: dbUser?.isAdmin ?? false,
    };
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// login
// ─────────────────────────────────────────────────────────────────────────────
const LoginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const loginFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => LoginSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) throw new Error(error.message);
    return { success: true };
  });

// ─────────────────────────────────────────────────────────────────────────────
// register
// ─────────────────────────────────────────────────────────────────────────────
const RegisterSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const registerFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => RegisterSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = createSupabaseServerClient();
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (error) throw new Error(error.message);
    if (!authData.user) throw new Error("Registrasi gagal");

    // Insert into our users table
    await db
      .insert(users)
      .values({
        id: authData.user.id,
        email: data.email,
        isAdmin: false,
      })
      .onConflictDoNothing();

    return { success: true };
  });

// ─────────────────────────────────────────────────────────────────────────────
// logout
// ─────────────────────────────────────────────────────────────────────────────
export const logoutFn = createServerFn({ method: "POST" }).handler(async () => {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  return { success: true };
});
