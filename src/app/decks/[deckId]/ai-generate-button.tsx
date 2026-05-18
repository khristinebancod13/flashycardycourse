"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { generateAndSaveCards } from "./actions";

interface AIGenerateButtonProps {
  deckId: number;
  hasAI: boolean;
  hasDescription: boolean;
}

export function AIGenerateButton({ deckId, hasAI, hasDescription }: AIGenerateButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleClick() {
    if (!hasAI) {
      router.push("/pricing");
      return;
    }

    setIsLoading(true);
    try {
      const result = await generateAndSaveCards({ deckId });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(`Generated ${result.count} cards with AI!`);
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const button = (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      variant="outline"
      className="gap-2"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Sparkles className="w-4 h-4" />
      )}
      {isLoading ? "Generating…" : "Generate cards with AI"}
    </Button>
  );

  if (!hasAI) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleClick}
            variant="outline"
            className="gap-2 opacity-50 cursor-not-allowed"
          >
            <Sparkles className="w-4 h-4" />
            Generate cards with AI
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>This is a Pro feature. Click to upgrade.</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  if (!hasDescription) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span tabIndex={0} className="inline-flex">
            <Button
              variant="outline"
              className="gap-2 pointer-events-none opacity-50"
              disabled
              tabIndex={-1}
            >
              <Sparkles className="w-4 h-4" />
              Generate cards with AI
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Add a description to this deck first so AI knows what to generate.</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return button;
}
