"use client";

import { useEffect } from "react";
import { useClerk } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function AutoSignUpModal() {
  const { openSignUp } = useClerk();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("signup") === "true") {
      toast.info("Sign in to continue", {
        description: "Create a free account or sign in to access your decks.",
      });
      openSignUp({ fallbackRedirectUrl: "/dashboard" });
    }
  }, [searchParams, openSignUp]);

  return null;
}
