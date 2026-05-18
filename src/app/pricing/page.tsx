import { PricingTable } from "@clerk/nextjs";

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-16 px-4">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-3">Choose Your Plan</h1>
        <p className="text-muted-foreground text-lg max-w-xl">
          Unlock the full potential of your flashcard learning experience with our flexible options.
        </p>
      </div>
      <div className="w-full max-w-3xl">
        <PricingTable />
      </div>
    </div>
  );
}
