import { db } from "@/db";
import { cardsTable, decksTable } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function getCardsByDeckId(deckId: number) {
  return db
    .select()
    .from(cardsTable)
    .where(eq(cardsTable.deckId, deckId))
    .orderBy(desc(cardsTable.updatedAt));
}

export async function insertCard(data: {
  deckId: number;
  front: string;
  back: string;
}) {
  const rows = await db.insert(cardsTable).values(data).returning();
  return rows[0];
}

export async function updateCard(
  cardId: number,
  data: { front?: string; back?: string }
) {
  const rows = await db
    .update(cardsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(cardsTable.id, cardId))
    .returning();
  return rows[0] ?? null;
}

export async function deleteCardById(cardId: number) {
  await db.delete(cardsTable).where(eq(cardsTable.id, cardId));
}
