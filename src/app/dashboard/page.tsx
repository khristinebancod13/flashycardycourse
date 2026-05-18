import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getDecksByUserId } from "@/db/queries/decks";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import Link from "next/link";
import { Zap, Crown, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CreateDeckDialog } from "./create-deck-dialog";

export default async function DashboardPage() {
  const { userId, has } = await auth();

  if (!userId) {
    redirect("/");
  }

  const decks = await getDecksByUserId(userId);

  const hasDeckLimit = has({ feature: "3_deck_limit" });
  const isPro = has({ plan: "pro" });
  const atLimit = hasDeckLimit && decks.length >= 3;

  return (
    <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-zinc-50">Dashboard</h1>
            {isPro ? (
              <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 gap-1 px-2 py-0.5">
                <Crown className="h-3 w-3" />
                Pro
              </Badge>
            ) : (
              <Badge className="bg-zinc-700/60 text-zinc-400 border-zinc-600/40 gap-1 px-2 py-0.5">
                Free
              </Badge>
            )}
          </div>
          <p className="text-zinc-400 mt-1">
            Manage and study your flashcard decks
          </p>
          {!isPro && (
            <p className="text-xs text-zinc-500 mt-1">
              {decks.length} / 3 decks used ·{" "}
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1 font-medium text-amber-400 hover:text-amber-300 transition-colors underline underline-offset-2 decoration-amber-500/50 hover:decoration-amber-400"
              >
                <Sparkles className="h-3 w-3" />
                Unlock unlimited decks &amp; AI with Pro
              </Link>
            </p>
          )}
        </div>
        <CreateDeckDialog atLimit={atLimit} />
      </div>

      {decks.length > 0 && (
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-4">
          {decks.length} {decks.length === 1 ? "Deck" : "Decks"}
        </p>
      )}

      {decks.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-zinc-400 text-lg mb-4">No decks yet</p>
            <CreateDeckDialog atLimit={atLimit} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map((deck) => (
            <Link key={deck.id} href={`/decks/${deck.id}`} className="block h-full">
              <Card className="hover:border-zinc-500 transition-colors h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="text-zinc-50">{deck.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-zinc-400 text-sm line-clamp-2">
                    {deck.description ?? ""}
                  </p>
                </CardContent>
                <CardFooter className="border-t border-zinc-800 pt-3">
                  <p className="text-xs text-zinc-500">
                    Last updated:{" "}
                    {new Date(deck.updatedAt).toLocaleDateString()}
                  </p>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
