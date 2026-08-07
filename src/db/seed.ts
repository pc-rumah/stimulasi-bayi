import { db } from "./index";
import { childProfiles, dailyLogs, screeningResults } from "./schema";

export async function seedInitialData() {
  console.log("Seeding database...");
  try {
    const [child] = await db
      .insert(childProfiles)
      .values({
        name: "Si Kecil",
        birthDate: "2023-01-15",
      })
      .returning();

    if (child) {
      await db.insert(dailyLogs).values([
        {
          childId: child.id,
          date: new Date().toISOString().split("T")[0]!,
          minutes: 15,
          newWords: 2,
          response: "Baik",
          note: "Senang menirukan suara binatang",
        },
      ]);

      await db.insert(screeningResults).values([
        {
          childId: child.id,
          date: new Date().toISOString().split("T")[0]!,
          age: 18,
          yesCount: 8,
          totalCount: 10,
          verdict: "Perkembangan sesuai usia",
        },
      ]);
    }

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Failed to seed database:", error);
  }
}
