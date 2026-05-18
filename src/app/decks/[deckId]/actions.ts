"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getDeckById, updateDeck, deleteDeckById } from "@/db/queries/decks";
import { insertCard, updateCard, deleteCardById } from "@/db/queries/cards";
import { generateFlashcards } from "@/lib/ai";
import {
  createCardSchema,
  type CreateCardSchema,
  updateDeckSchema,
  type UpdateDeckSchema,
  updateCardSchema,
  type UpdateCardSchema,
  deleteCardSchema,
  type DeleteCardSchema,
  deleteDeckSchema,
  type DeleteDeckSchema,
  generateAICardsSchema,
  type GenerateAICardsSchema,
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

  revalidatePath(`/decks/${validatedData.deckId}`);

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

  revalidatePath(`/decks/${validatedData.deckId}`);
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

  const updated = await updateCard(validatedData.cardId, validatedData.deckId, {
    front: validatedData.front,
    back: validatedData.back,
  });

  if (!updated) {
    throw new Error("Card not found");
  }

  revalidatePath(`/decks/${validatedData.deckId}`);

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

  await deleteCardById(validatedData.cardId, validatedData.deckId);

  revalidatePath(`/decks/${validatedData.deckId}`);
}

export async function deleteDeck(data: DeleteDeckSchema) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const validatedData = deleteDeckSchema.parse(data);

  const deck = await getDeckById(validatedData.deckId, userId);
  if (!deck) {
    throw new Error("Deck not found or access denied");
  }

  await deleteDeckById(validatedData.deckId, userId);

  revalidatePath("/dashboard");
}

export async function generateAndSaveCards(data: GenerateAICardsSchema) {
  const { userId, has } = await auth();

  if (!userId) {
    return { success: false as const, error: "Unauthorized" };
  }

  const canUseAI = has({ feature: "ai_flashcard_generation" });
  if (!canUseAI) {
    return { success: false as const, error: "AI flashcard generation requires a Pro plan." };
  }

  const validatedData = generateAICardsSchema.parse(data);

  const deck = await getDeckById(validatedData.deckId, userId);
  if (!deck) {
    return { success: false as const, error: "Deck not found or access denied" };
  }

  try {
    const generatedCards = await generateFlashcards(deck.name, deck.description ?? null, 20);

    for (const card of generatedCards) {
      await insertCard({
        deckId: validatedData.deckId,
        front: card.front,
        back: card.back,
      });
    }

    revalidatePath(`/decks/${validatedData.deckId}`);
    revalidatePath(`/decks/${validatedData.deckId}/study`);

    return { success: true as const, count: generatedCards.length };
  } catch {
    return { success: false as const, error: "Failed to generate cards. Please try again." };
  }
}
