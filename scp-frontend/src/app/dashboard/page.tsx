"use client";
import { useEffect, useState } from "react";
import { api, setAuthToken } from "@/lib/api";

interface Project {
  id: number;
  name: string;
  type: string;
  status: string;
  estimated_sale_value: string;
}

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setAuthToken(token);
    api.get("/projects/mine/").then((res) => setProjects(res.data));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Meus Projetos</h1>
      {projects.length === 0 ? (
        <p>Nenhum projeto encontrado.</p>
      ) : (
        <ul className="space-y-3">
          {projects.map((p) => (
            <li key={p.id} className="border rounded-lg p-4 shadow-sm">
              <h2 className="font-semibold">{p.name}</h2>
              <p>Tipo: {p.type}</p>
              <p>Status: {p.status}</p>
              <p>Valor estimado: R$ {p.estimated_sale_value}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
