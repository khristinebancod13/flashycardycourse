export const dynamic = 'force-dynamic';

import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getDeckById } from "@/db/queries/decks";
import { getCardsByDeckId } from "@/db/queries/cards";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { AddCardDialog } from "./add-card-dialog";
import { EditDeckDialog } from "./edit-deck-dialog";
import { EditCardDialog } from "./edit-card-dialog";
import { DeleteCardDialog } from "./delete-card-dialog";
import { DeleteDeckDialog } from "./delete-deck-dialog";
import { AIGenerateButton } from "./ai-generate-button";

interface DeckPageProps {
  params: Promise<{ deckId: string }>;
}

export default async function DeckPage({ params }: DeckPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const { deckId } = await params;
  const parsedId = parseInt(deckId, 10);

  if (isNaN(parsedId)) {
    notFound();
  }

  const [deck, cards] = await Promise.all([
    getDeckById(parsedId, userId),
    getCardsByDeckId(parsedId, userId),
  ]);

  if (!deck) {
    notFound();
  }


  return (
    <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-10">
      {/* Header */}
      <div className="mb-2">
        <Link
          href="/dashboard"
          className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <div className="flex items-start justify-between mb-6 mt-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold text-zinc-50">{deck.name}</h1>
            <Badge variant="secondary">
              {cards.length} {cards.length === 1 ? "card" : "cards"}
            </Badge>
          </div>
          {deck.description && (
            <p className="text-zinc-400 mt-2 max-w-2xl">{deck.description}</p>
          )}
          <div className="flex gap-4 mt-2">
            <p className="text-xs text-zinc-500">
              Created: {new Date(deck.createdAt).toLocaleDateString()}
            </p>
            <p className="text-xs text-zinc-500">
              Last updated: {new Date(deck.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="ml-4 shrink-0 flex gap-2">
          <EditDeckDialog
            deckId={parsedId}
            initialName={deck.name}
            initialDescription={deck.description}
          />
          <DeleteDeckDialog deckId={parsedId} deckName={deck.name} />
        </div>
      </div>

      {cards.length > 0 && (
        <div className="mb-6">
          <Button asChild size="lg" className="px-8 py-5 text-base font-semibold">
            <Link href={`/decks/${parsedId}/study`}>
              <BookOpen className="w-5 h-5 mr-2" />
              Start Study Session
            </Link>
          </Button>
        </div>
      )}

      <Separator className="mb-8 bg-zinc-800" />

      {/* Cards section header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-zinc-200">Cards</h2>
        <div className="flex items-center gap-2">
          <AIGenerateButton deckId={parsedId} hasDescription={!!deck.description?.trim()} />
          {cards.length > 0 && <AddCardDialog deckId={parsedId} />}
        </div>
      </div>

      {/* Cards grid */}
      {cards.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-zinc-400 text-lg mb-4">No cards in this deck yet</p>
            <AddCardDialog
              deckId={parsedId}
              label="Add First Card"
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <Card
              key={card.id}
              className="hover:border-zinc-500 transition-colors flex flex-col"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Front
                    </p>
                    <CardTitle className="text-zinc-50 text-base font-medium leading-snug">
                      {card.front}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-1">
                    <EditCardDialog
                      cardId={card.id}
                      deckId={parsedId}
                      initialFront={card.front}
                      initialBack={card.back}
                    />
                    <DeleteCardDialog cardId={card.id} deckId={parsedId} />
                  </div>
                </div>
              </CardHeader>
              <Separator className="bg-zinc-800 mx-6" />
              <CardContent className="pt-4 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                  Back
                </p>
                <p className="text-zinc-300 text-sm leading-relaxed">
                  {card.back}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
