"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const router = useRouter();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post("/register/", { username, password, email });
      router.push("/");
    } catch {
      alert("Erro ao registrar.");
    }
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <form onSubmit={handleRegister} className="bg-white p-6 rounded-xl shadow-md w-80">
        <h1 className="text-xl font-bold mb-4 text-center">Registrar</h1>
        <input
          className="border w-full mb-3 p-2 rounded"
          placeholder="Usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="border w-full mb-3 p-2 rounded"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="border w-full mb-4 p-2 rounded"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="bg-green-600 text-white w-full py-2 rounded hover:bg-green-700">
          Registrar
        </button>
      </form>
    </div>
  );
}
