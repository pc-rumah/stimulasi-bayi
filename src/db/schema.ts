import {
  pgTable,
  uuid,
  varchar,
  integer,
  text,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

// Users table — mirrors Supabase Auth users
export const users = pgTable("users", {
  id: uuid("id").primaryKey(), // matches auth.users.id from Supabase
  email: varchar("email", { length: 255 }).notNull().unique(),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const childProfiles = pgTable("child_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  birthDate: varchar("birth_date", { length: 10 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const dailyLogs = pgTable("daily_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  childId: uuid("child_id").references(() => childProfiles.id, {
    onDelete: "cascade",
  }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  date: varchar("date", { length: 10 }).notNull(),
  minutes: integer("minutes").notNull().default(0),
  newWords: integer("new_words").notNull().default(0),
  response: varchar("response", { length: 50 }).notNull(),
  note: text("note").default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const screeningResults = pgTable("screening_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  childId: uuid("child_id").references(() => childProfiles.id, {
    onDelete: "cascade",
  }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  date: varchar("date", { length: 20 }).notNull(),
  age: integer("age").notNull(),
  yesCount: integer("yes_count").notNull(),
  totalCount: integer("total_count").notNull(),
  verdict: varchar("verdict", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const parentNotes = pgTable("parent_notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  childId: uuid("child_id").references(() => childProfiles.id, {
    onDelete: "cascade",
  }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  note: text("note").notNull().default(""),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// --- Type exports ---
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type ChildProfile = typeof childProfiles.$inferSelect;
export type NewChildProfile = typeof childProfiles.$inferInsert;

export type DailyLog = typeof dailyLogs.$inferSelect;
export type NewDailyLog = typeof dailyLogs.$inferInsert;

export type ScreeningResult = typeof screeningResults.$inferSelect;
export type NewScreeningResult = typeof screeningResults.$inferInsert;

export type ParentNote = typeof parentNotes.$inferSelect;
export type NewParentNote = typeof parentNotes.$inferInsert;
