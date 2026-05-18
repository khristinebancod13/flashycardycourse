import { db } from "@/db";
import { cardsTable, decksTable } from "@/db/schema";
import { eq, and, desc, inArray, sql } from "drizzle-orm";

export async function getCardsByDeckId(deckId: number, userId: string) {
  return db
    .select({
      id: cardsTable.id,
      deckId: cardsTable.deckId,
      front: cardsTable.front,
      back: cardsTable.back,
      createdAt: cardsTable.createdAt,
      updatedAt: cardsTable.updatedAt,
    })
    .from(cardsTable)
    .innerJoin(decksTable, eq(cardsTable.deckId, decksTable.id))
    .where(and(eq(cardsTable.deckId, deckId), eq(decksTable.userId, userId)))
    .orderBy(desc(cardsTable.updatedAt));
}

export async function getCardCountsByDeckIds(
  deckIds: number[]
): Promise<Record<number, number>> {
  if (deckIds.length === 0) return {};

  const rows = await db
    .select({
      deckId: cardsTable.deckId,
      count: sql<number>`cast(count(*) as integer)`,
    })
    .from(cardsTable)
    .where(inArray(cardsTable.deckId, deckIds))
    .groupBy(cardsTable.deckId);

  return Object.fromEntries(rows.map((r) => [r.deckId, r.count]));
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
  deckId: number,
  data: { front?: string; back?: string }
) {
  const rows = await db
    .update(cardsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(cardsTable.id, cardId), eq(cardsTable.deckId, deckId)))
    .returning();
  return rows[0] ?? null;
}

export async function deleteCardById(cardId: number, deckId: number) {
  await db
    .delete(cardsTable)
    .where(and(eq(cardsTable.id, cardId), eq(cardsTable.deckId, deckId)));
}
