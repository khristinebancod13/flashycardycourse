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
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const decks = await getDecksByUserId(userId);

  return (
    <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-50">My Decks</h1>
          <p className="text-zinc-400 mt-1">
            Manage and study your flashcard decks
          </p>
        </div>
        <Button>New Deck</Button>
      </div>

      {decks.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-zinc-400 text-lg mb-4">No decks yet</p>
            <Button>Create your first deck</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map((deck) => (
            <Link key={deck.id} href={`/dashboard/decks/${deck.id}`} className="block h-full">
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
