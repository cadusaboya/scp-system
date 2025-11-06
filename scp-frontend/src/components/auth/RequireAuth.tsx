"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const ok = Boolean(getSession());
    if (!ok) router.replace("/login");
    else setReady(true);
  }, [router]);

  if (!ready) return null;
  return <>{children}</>;
}
