"use server";

import { cookies } from "next/headers";

export async function loginAction(username: string, password: string) {
  const res = await fetch("http://localhost:8000/api/auth/token/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    return { error: "Usuário ou senha inválidos" };
  }

  const data = await res.json();

  const cookieStore = await cookies();

  cookieStore.set({
    name: "access",
    value: data.access,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  cookieStore.set({
    name: "refresh",
    value: data.refresh,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return { success: true };
}

export async function logoutAction() {
  const cookieStore = await cookies();

  cookieStore.delete("access");
  cookieStore.delete("refresh");
}
