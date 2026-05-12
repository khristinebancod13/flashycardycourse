import { z } from "zod";

export const createCardSchema = z.object({
  deckId: z.number().int().positive(),
  front: z.string().min(1, "Front is required"),
  back: z.string().min(1, "Back is required"),
});

export type CreateCardSchema = z.infer<typeof createCardSchema>;

export const updateDeckSchema = z.object({
  deckId: z.number().int().positive(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

export type UpdateDeckSchema = z.infer<typeof updateDeckSchema>;

export const updateCardSchema = z.object({
  cardId: z.number().int().positive(),
  deckId: z.number().int().positive(),
  front: z.string().min(1, "Front is required"),
  back: z.string().min(1, "Back is required"),
});

export type UpdateCardSchema = z.infer<typeof updateCardSchema>;

export const deleteCardSchema = z.object({
  cardId: z.number().int().positive(),
  deckId: z.number().int().positive(),
});

export type DeleteCardSchema = z.infer<typeof deleteCardSchema>;
