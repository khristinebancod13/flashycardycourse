import { SignInButton, SignUpButton, Show } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
      <h1 className="text-5xl font-bold tracking-tight text-zinc-50">
        FlashyCardy
      </h1>
      <p className="text-xl text-zinc-400">
        Your personal flashcard platform
      </p>
      <Show when="signed-out">
        <div className="flex gap-4 mt-2">
          <SignInButton mode="modal" forceRedirectUrl="/dashboard">
            <Button variant="outline">Sign In</Button>
          </SignInButton>
          <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
            <Button>Sign Up</Button>
          </SignUpButton>
        </div>
      </Show>
    </div>
  );
}
