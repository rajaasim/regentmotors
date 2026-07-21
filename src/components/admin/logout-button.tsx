"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth/client";

export function LogoutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleLogout() {
    setIsPending(true);
    await authClient.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <button
      className="text-sm text-muted transition-colors hover:text-white disabled:opacity-60"
      type="button"
      disabled={isPending}
      onClick={handleLogout}
    >
      {isPending ? "Signing out…" : "Sign out"}
    </button>
  );
}
