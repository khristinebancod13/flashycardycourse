import { db } from "@/db";
import { decksTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function getDecksByUserId(userId: string) {
  return db
    .select()
    .from(decksTable)
    .where(eq(decksTable.userId, userId));
}

export async function getDeckById(deckId: number, userId: string) {
  const rows = await db
    .select()
    .from(decksTable)
    .where(and(eq(decksTable.id, deckId), eq(decksTable.userId, userId)));
  return rows[0] ?? null;
}

export async function insertDeck(data: {
  name: string;
  description?: string | null;
  userId: string;
}) {
  const rows = await db.insert(decksTable).values(data).returning();
  return rows[0];
}

export async function updateDeck(
  deckId: number,
  userId: string,
  data: { name?: string; description?: string | null }
) {
  const rows = await db
    .update(decksTable)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(decksTable.id, deckId), eq(decksTable.userId, userId)))
    .returning();
  return rows[0] ?? null;
}

export async function deleteDeckById(deckId: number, userId: string) {
  await db
    .delete(decksTable)
    .where(and(eq(decksTable.id, deckId), eq(decksTable.userId, userId)));
}
