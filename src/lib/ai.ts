import { generateText, Output } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

const cardSchema = z.object({
  cards: z.array(
    z.object({
      front: z.string(),
      back: z.string(),
    })
  ),
});

export type GeneratedCards = z.infer<typeof cardSchema>;

export async function generateFlashcards(
  deckName: string,
  deckDescription: string | null,
  count: number
) {
  const { output } = await generateText({
    model: openai("gpt-4o"),
    output: Output.object({ schema: cardSchema }),
    prompt: `You are creating ${count} flashcards for a deck titled "${deckName}"${deckDescription ? ` described as: "${deckDescription}"` : ""}.

First, determine the nature of this deck:
- If it is a **language learning** deck (e.g. vocabulary, translations, phrases between two languages), format each card as:
  - Front: the word, phrase, or sentence in the source language (keep it natural and concise)
  - Back: the direct translation in the target language only — no definitions, no extra context, just the translation
- If it is a **knowledge or study** deck (e.g. history, science, concepts, definitions), format each card as:
  - Front: a clear, concise question or term
  - Back: the answer or definition

Generate exactly ${count} cards. Vary what is covered — include a mix of common and less common examples. Do not repeat content.`,
  });

  return output.cards;
}
