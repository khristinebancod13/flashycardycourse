import { z } from "zod";

export const createDeckSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  userId: z.string().min(1, "User ID is required"),
});

export type CreateDeckSchema = z.infer<typeof createDeckSchema>;
