"use client";

import { useState } from "react";
import { loginAction } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    const res = await loginAction(username, password);
    if (res.success) router.push("/dashboard");
    else alert("Erro ao fazer login");
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="p-8 w-96 space-y-4">
        <h1 className="text-xl font-semibold text-center">SCP Admin</h1>

        <Input
          placeholder="Usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <Input
          placeholder="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button className="w-full" onClick={handleLogin}>
          Entrar
        </Button>
      </Card>
    </div>
  );
}
