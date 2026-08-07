import { createServerFn } from "@tanstack/react-start";
import { createServerClient, parseCookieHeader, serializeCookieHeader } from "@supabase/ssr";
import { getRequest, setResponseHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { db, childProfiles, dailyLogs, screeningResults, parentNotes, users } from "@/db";
import { eq, desc, and } from "drizzle-orm";

// ─────────────────────────────────────────────────────────────────────────────
// Supabase server client
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

/** Get the authenticated user ID or throw */
async function requireUserId(): Promise<string> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user.id;
}

// ─────────────────────────────────────────────────────────────────────────────
// Child Profile
// ─────────────────────────────────────────────────────────────────────────────
export const getUserProfileFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const userId = await requireUserId();
    const profile = await db.query.childProfiles.findFirst({
      where: eq(childProfiles.userId, userId),
    });
    return profile ?? null;
  },
);

const SaveProfileSchema = z.object({
  name: z.string().min(1),
  birthDate: z.string(),
});

export const saveUserProfileFn = createServerFn({ method: "POST" })
  .validator((d: unknown) => SaveProfileSchema.parse(d))
  .handler(async ({ data }) => {
    const userId = await requireUserId();

    const existing = await db.query.childProfiles.findFirst({
      where: eq(childProfiles.userId, userId),
    });

    if (existing) {
      await db
        .update(childProfiles)
        .set({ name: data.name, birthDate: data.birthDate, updatedAt: new Date() })
        .where(eq(childProfiles.id, existing.id));
      return { id: existing.id };
    } else {
      const [inserted] = await db
        .insert(childProfiles)
        .values({ userId, name: data.name, birthDate: data.birthDate })
        .returning();
      return { id: inserted!.id };
    }
  });

// ─────────────────────────────────────────────────────────────────────────────
// Daily Logs
// ─────────────────────────────────────────────────────────────────────────────
export const getUserLogsFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const userId = await requireUserId();
    const logs = await db.query.dailyLogs.findMany({
      where: eq(dailyLogs.userId, userId),
      orderBy: [desc(dailyLogs.date)],
    });
    return logs;
  },
);

const SaveLogSchema = z.object({
  date: z.string(),
  minutes: z.number(),
  newWords: z.number(),
  response: z.enum(["Kurang", "Cukup", "Baik", "Sangat Baik"]),
  note: z.string(),
});

export const saveLogFn = createServerFn({ method: "POST" })
  .validator((d: unknown) => SaveLogSchema.parse(d))
  .handler(async ({ data }) => {
    const userId = await requireUserId();

    const profile = await db.query.childProfiles.findFirst({
      where: eq(childProfiles.userId, userId),
    });

    // Upsert: one log per date per user
    const existing = await db.query.dailyLogs.findFirst({
      where: and(eq(dailyLogs.userId, userId), eq(dailyLogs.date, data.date)),
    });

    if (existing) {
      await db
        .update(dailyLogs)
        .set({
          minutes: data.minutes,
          newWords: data.newWords,
          response: data.response,
          note: data.note,
        })
        .where(eq(dailyLogs.id, existing.id));
      return { id: existing.id };
    } else {
      const [inserted] = await db
        .insert(dailyLogs)
        .values({
          userId,
          childId: profile?.id ?? null,
          date: data.date,
          minutes: data.minutes,
          newWords: data.newWords,
          response: data.response,
          note: data.note,
        })
        .returning();
      return { id: inserted!.id };
    }
  });

// ─────────────────────────────────────────────────────────────────────────────
// Screening Results
// ─────────────────────────────────────────────────────────────────────────────
export const getUserScreeningsFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const userId = await requireUserId();
    const screenings = await db.query.screeningResults.findMany({
      where: eq(screeningResults.userId, userId),
      orderBy: [desc(screeningResults.createdAt)],
    });
    return screenings;
  },
);

const SaveScreeningSchema = z.object({
  date: z.string(),
  age: z.number(),
  yesCount: z.number(),
  totalCount: z.number(),
  verdict: z.string(),
});

export const saveScreeningFn = createServerFn({ method: "POST" })
  .validator((d: unknown) => SaveScreeningSchema.parse(d))
  .handler(async ({ data }) => {
    const userId = await requireUserId();

    const profile = await db.query.childProfiles.findFirst({
      where: eq(childProfiles.userId, userId),
    });

    const [inserted] = await db
      .insert(screeningResults)
      .values({
        userId,
        childId: profile?.id ?? null,
        date: data.date,
        age: data.age,
        yesCount: data.yesCount,
        totalCount: data.totalCount,
        verdict: data.verdict,
      })
      .returning();
    return { id: inserted!.id };
  });

// ─────────────────────────────────────────────────────────────────────────────
// Parent Notes
// ─────────────────────────────────────────────────────────────────────────────
export const getUserNoteFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const userId = await requireUserId();
    const note = await db.query.parentNotes.findFirst({
      where: eq(parentNotes.userId, userId),
    });
    return note?.note ?? "";
  },
);

export const saveNoteFn = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.object({ note: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const userId = await requireUserId();

    const profile = await db.query.childProfiles.findFirst({
      where: eq(childProfiles.userId, userId),
    });

    const existing = await db.query.parentNotes.findFirst({
      where: eq(parentNotes.userId, userId),
    });

    if (existing) {
      await db
        .update(parentNotes)
        .set({ note: data.note, updatedAt: new Date() })
        .where(eq(parentNotes.id, existing.id));
    } else {
      await db.insert(parentNotes).values({
        userId,
        childId: profile?.id ?? null,
        note: data.note,
      });
    }
    return { success: true };
  });

// ─────────────────────────────────────────────────────────────────────────────
// Migration — one-time import from localStorage payload
// ─────────────────────────────────────────────────────────────────────────────
const MigrationSchema = z.object({
  profile: z.object({ name: z.string(), birthDate: z.string() }),
  logs: z.array(
    z.object({
      date: z.string(),
      minutes: z.number(),
      newWords: z.number(),
      response: z.enum(["Kurang", "Cukup", "Baik", "Sangat Baik"]),
      note: z.string(),
    }),
  ),
  screenings: z.array(
    z.object({
      id: z.string(),
      date: z.string(),
      age: z.number(),
      yes: z.number(),
      total: z.number(),
      verdict: z.string(),
    }),
  ),
  parentNote: z.string(),
});

export const migrateLocalStorageFn = createServerFn({ method: "POST" })
  .validator((d: unknown) => MigrationSchema.parse(d))
  .handler(async ({ data }) => {
    const userId = await requireUserId();

    // 1. Upsert child profile
    let profileId: string;
    const existing = await db.query.childProfiles.findFirst({
      where: eq(childProfiles.userId, userId),
    });

    if (existing) {
      await db
        .update(childProfiles)
        .set({ name: data.profile.name, birthDate: data.profile.birthDate })
        .where(eq(childProfiles.id, existing.id));
      profileId = existing.id;
    } else {
      const [inserted] = await db
        .insert(childProfiles)
        .values({ userId, name: data.profile.name, birthDate: data.profile.birthDate })
        .returning();
      profileId = inserted!.id;
    }

    // 2. Insert logs (skip duplicates)
    for (const log of data.logs) {
      const dup = await db.query.dailyLogs.findFirst({
        where: and(eq(dailyLogs.userId, userId), eq(dailyLogs.date, log.date)),
      });
      if (!dup) {
        await db.insert(dailyLogs).values({
          userId,
          childId: profileId,
          date: log.date,
          minutes: log.minutes,
          newWords: log.newWords,
          response: log.response,
          note: log.note,
        });
      }
    }

    // 3. Insert screenings
    for (const s of data.screenings) {
      await db.insert(screeningResults).values({
        userId,
        childId: profileId,
        date: s.date,
        age: s.age,
        yesCount: s.yes,
        totalCount: s.total,
        verdict: s.verdict,
      });
    }

    // 4. Upsert parent note
    if (data.parentNote) {
      const existingNote = await db.query.parentNotes.findFirst({
        where: eq(parentNotes.userId, userId),
      });
      if (existingNote) {
        await db
          .update(parentNotes)
          .set({ note: data.parentNote })
          .where(eq(parentNotes.id, existingNote.id));
      } else {
        await db.insert(parentNotes).values({ userId, childId: profileId, note: data.parentNote });
      }
    }

    return { success: true };
  });

// ─────────────────────────────────────────────────────────────────────────────
// Reset all user data
// ─────────────────────────────────────────────────────────────────────────────
export const resetUserDataFn = createServerFn({ method: "POST" }).handler(
  async () => {
    const userId = await requireUserId();
    // Cascade deletes handle logs, screenings, notes
    await db.delete(childProfiles).where(eq(childProfiles.userId, userId));
    return { success: true };
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// Admin: get all users with stats
// ─────────────────────────────────────────────────────────────────────────────
export const adminGetAllUsersFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const userId = await requireUserId();
    const me = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!me?.isAdmin) throw new Error("Forbidden");

    const allUsers = await db.query.users.findMany({
      orderBy: [desc(users.createdAt)],
    });

    // Enrich with profile info
    const enriched = await Promise.all(
      allUsers.map(async (u) => {
        const profile = await db.query.childProfiles.findFirst({
          where: eq(childProfiles.userId, u.id),
        });
        const logCount = await db.query.dailyLogs.findMany({
          where: eq(dailyLogs.userId, u.id),
        });
        const screeningCount = await db.query.screeningResults.findMany({
          where: eq(screeningResults.userId, u.id),
        });
        return {
          ...u,
          childName: profile?.name ?? null,
          childBirthDate: profile?.birthDate ?? null,
          logCount: logCount.length,
          screeningCount: screeningCount.length,
        };
      }),
    );

    return enriched;
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// Admin: get user detail
// ─────────────────────────────────────────────────────────────────────────────
export const adminGetUserDetailFn = createServerFn({ method: "GET" })
  .validator((d: unknown) => z.object({ targetUserId: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    const me = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!me?.isAdmin) throw new Error("Forbidden");

    const user = await db.query.users.findFirst({
      where: eq(users.id, data.targetUserId),
    });
    if (!user) throw new Error("User not found");

    const profile = await db.query.childProfiles.findFirst({
      where: eq(childProfiles.userId, data.targetUserId),
    });

    const logs = await db.query.dailyLogs.findMany({
      where: eq(dailyLogs.userId, data.targetUserId),
      orderBy: [desc(dailyLogs.date)],
    });

    const screenings = await db.query.screeningResults.findMany({
      where: eq(screeningResults.userId, data.targetUserId),
      orderBy: [desc(screeningResults.createdAt)],
    });

    const note = await db.query.parentNotes.findFirst({
      where: eq(parentNotes.userId, data.targetUserId),
    });

    return { user, profile, logs, screenings, parentNote: note?.note ?? "" };
  });

// ─────────────────────────────────────────────────────────────────────────────
// Admin: toggle is_admin
// ─────────────────────────────────────────────────────────────────────────────
export const adminToggleAdminFn = createServerFn({ method: "POST" })
  .validator((d: unknown) =>
    z.object({ targetUserId: z.string(), isAdmin: z.boolean() }).parse(d),
  )
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    const me = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!me?.isAdmin) throw new Error("Forbidden");

    await db
      .update(users)
      .set({ isAdmin: data.isAdmin })
      .where(eq(users.id, data.targetUserId));

    return { success: true };
  });
