"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getDeckById, updateDeck } from "@/db/queries/decks";
import { insertCard, updateCard, deleteCardById } from "@/db/queries/cards";
import {
  createCardSchema,
  type CreateCardSchema,
  updateDeckSchema,
  type UpdateDeckSchema,
  updateCardSchema,
  type UpdateCardSchema,
  deleteCardSchema,
  type DeleteCardSchema,
} from "./schemas";

export async function createCard(data: CreateCardSchema) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const validatedData = createCardSchema.parse(data);

  const deck = await getDeckById(validatedData.deckId, userId);
  if (!deck) {
    throw new Error("Deck not found or access denied");
  }

  const card = await insertCard({
    deckId: validatedData.deckId,
    front: validatedData.front,
    back: validatedData.back,
  });

  revalidatePath(`/dashboard/decks/${validatedData.deckId}`);

  return card;
}

export async function editDeck(data: UpdateDeckSchema) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const validatedData = updateDeckSchema.parse(data);

  const updated = await updateDeck(validatedData.deckId, userId, {
    name: validatedData.name,
    description: validatedData.description ?? null,
  });

  if (!updated) {
    throw new Error("Deck not found or access denied");
  }

  revalidatePath(`/dashboard/decks/${validatedData.deckId}`);
  revalidatePath("/dashboard");

  return updated;
}

export async function editCard(data: UpdateCardSchema) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const validatedData = updateCardSchema.parse(data);

  const deck = await getDeckById(validatedData.deckId, userId);
  if (!deck) {
    throw new Error("Deck not found or access denied");
  }

  const updated = await updateCard(validatedData.cardId, {
    front: validatedData.front,
    back: validatedData.back,
  });

  if (!updated) {
    throw new Error("Card not found");
  }

  revalidatePath(`/dashboard/decks/${validatedData.deckId}`);

  return updated;
}

export async function deleteCard(data: DeleteCardSchema) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const validatedData = deleteCardSchema.parse(data);

  const deck = await getDeckById(validatedData.deckId, userId);
  if (!deck) {
    throw new Error("Deck not found or access denied");
  }

  await deleteCardById(validatedData.cardId);

  revalidatePath(`/dashboard/decks/${validatedData.deckId}`);
}
