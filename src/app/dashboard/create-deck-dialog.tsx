"use client";

import { useState } from "react";
import { Plus, Lock } from "lucide-react";
import { Show } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createDeck } from "./actions";
import Link from "next/link";

interface CreateDeckDialogProps {
  deckCount: number;
}

export function CreateDeckDialog({ deckCount }: CreateDeckDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Deck name is required.");
      return;
    }

    setLoading(true);
    try {
      await createDeck({ name: name.trim(), description: description.trim() || undefined, userId: "" });
      toast.success(`"${name.trim()}" deck created!`);
      setOpen(false);
      setName("");
      setDescription("");
    } catch {
      toast.error("Failed to create deck. Please try again.");
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const lockedDialog = (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Lock className="mr-2 h-4 w-4" />
          Create New Deck
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Deck Limit Reached</DialogTitle>
          <DialogDescription>
            You&apos;ve used all 3 decks on the free plan. Upgrade to Pro for
            unlimited decks and AI flashcard generation.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button asChild>
            <Link href="/pricing">View Pricing</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const createDialog = (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create New Deck
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Deck</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="deck-name">Name</Label>
            <Input
              id="deck-name"
              placeholder="e.g. Spanish Vocabulary"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deck-description">Description (optional)</Label>
            <Textarea
              id="deck-description"
              placeholder="What is this deck about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              rows={3}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Deck"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  return (
    <Show
      when={{ feature: "3_deck_limit" }}
      fallback={createDialog}
    >
      {deckCount >= 3 ? lockedDialog : createDialog}
    </Show>
  );
}
