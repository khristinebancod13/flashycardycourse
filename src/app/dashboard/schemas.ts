import { z } from "zod";

// Client-facing input (no userId — the server action adds it from Clerk auth)
export const createDeckInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

export type CreateDeckInput = z.infer<typeof createDeckInputSchema>;

// Internal schema used after userId is added by the server action
export const createDeckSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  userId: z.string().min(1, "User ID is required"),
});

export type CreateDeckSchema = z.infer<typeof createDeckSchema>;
