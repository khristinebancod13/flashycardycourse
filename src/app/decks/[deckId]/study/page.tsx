import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getDeckById } from "@/db/queries/decks";
import { getCardsByDeckId } from "@/db/queries/cards";
import { FlashcardStudy } from "./flashcard-study";

interface StudyPageProps {
  params: Promise<{ deckId: string }>;
}

export default async function StudyPage({ params }: StudyPageProps) {
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
    <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-10">
      <div className="mb-6">
        <Link
          href={`/decks/${parsedId}`}
          className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          ← Back to {deck.name}
        </Link>
      </div>

      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-zinc-50">{deck.name}</h1>
        {deck.description && (
          <p className="text-zinc-400 mt-2">{deck.description}</p>
        )}
      </div>

      <FlashcardStudy cards={cards} deckId={parsedId} />
    </main>
  );
}
