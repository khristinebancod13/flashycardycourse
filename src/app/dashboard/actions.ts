"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { insertDeck, getDecksByUserId } from "@/db/queries/decks";
import { createDeckSchema, createDeckInputSchema, type CreateDeckInput } from "./schemas";

export async function createDeck(data: CreateDeckInput) {
  const { userId, has } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const validatedInput = createDeckInputSchema.parse(data);
  const validatedData = createDeckSchema.parse({ ...validatedInput, userId });

  const hasDeckLimit = has({ feature: "3_deck_limit" });
  if (hasDeckLimit) {
    const existingDecks = await getDecksByUserId(userId);
    if (existingDecks.length >= 3) {
      throw new Error("Free plan limit reached. Upgrade to Pro for unlimited decks.");
    }
  }
  const deck = await insertDeck(validatedData);
  revalidatePath("/dashboard");
  return deck;
}
