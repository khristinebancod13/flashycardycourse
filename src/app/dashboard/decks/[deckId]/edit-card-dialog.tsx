"use client";

import { useState, useTransition } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { editCard } from "./actions";

interface EditCardDialogProps {
  cardId: number;
  deckId: number;
  initialFront: string;
  initialBack: string;
}

export function EditCardDialog({
  cardId,
  deckId,
  initialFront,
  initialBack,
}: EditCardDialogProps) {
  const [open, setOpen] = useState(false);
  const [front, setFront] = useState(initialFront);
  const [back, setBack] = useState(initialBack);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(next: boolean) {
    if (!isPending) {
      setOpen(next);
      if (!next) {
        setFront(initialFront);
        setBack(initialBack);
        setError(null);
      }
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        await editCard({
          cardId,
          deckId,
          front: front.trim(),
          back: back.trim(),
        });
        setOpen(false);
        toast.success("Card updated successfully");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Something went wrong";
        setError(message);
        toast.error(message);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-zinc-100">
          <Pencil className="h-3.5 w-3.5" />
          <span className="sr-only">Edit card</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Card</DialogTitle>
          <DialogDescription>
            Update the front and back content of this flashcard.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="edit-front">Front</Label>
            <Textarea
              id="edit-front"
              placeholder="Question or term..."
              value={front}
              onChange={(e) => setFront(e.target.value)}
              rows={3}
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-back">Back</Label>
            <Textarea
              id="edit-back"
              placeholder="Answer or definition..."
              value={back}
              onChange={(e) => setBack(e.target.value)}
              rows={3}
              required
              disabled={isPending}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !front.trim() || !back.trim()}
            >
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
