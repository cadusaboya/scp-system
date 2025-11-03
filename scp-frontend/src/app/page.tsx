"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, setAuthToken } from "@/lib/api";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await api.post("/auth/token/", { username, password });
      const { access } = res.data;
      localStorage.setItem("token", access);
      setAuthToken(access);
      router.push("/dashboard");
    } catch {
      setError("Usuário ou senha incorretos");
    }
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded-xl shadow-md w-80">
        <h1 className="text-xl font-bold mb-4 text-center">Login</h1>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <input
          className="border w-full mb-3 p-2 rounded"
          placeholder="Usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          className="border w-full mb-4 p-2 rounded"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700">
          Entrar
        </button>
        <p className="text-sm text-center mt-3">
          Não tem conta?{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            Registrar
          </a>
        </p>
      </form>
    </div>
  );
}
