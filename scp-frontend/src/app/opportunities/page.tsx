"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import RequireAuth from "@/components/auth/RequireAuth";
import AppShell from "@/components/app-shell/AppShell";
import { BadgeCard } from "@/components/BadgeCard/BadgeCard"; // 👈 teu card visual
import { SimpleGrid } from '@mantine/core';

interface Project {
  id: number;
  name: string;
  cash_balance: number;
  type: string;
  notes: string;
  share_value: number;
}

export default function OpportunitiesPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<Project[]>("/projects/");
        setProjects(res.data);
      } catch (e: any) {
        console.error(e);
        setError("Erro ao carregar projetos");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <RequireAuth>
      <AppShell>
        <div className="space-y-6">
          {error && (
            <div className="border border-red-300 bg-red-50 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-wrap">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-[300px] w-[320px] rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <ProjectsGrid projects={projects} />
          )}
        </div>
      </AppShell>
    </RequireAuth>
  );
}

function ProjectsGrid({ projects }: { projects: Project[] }) {
  return (
    <SimpleGrid
      cols={{ base: 1, sm: 2, md: 3, lg: 4 }} // 👈 define quantos cards por linha
      spacing="lg"
      verticalSpacing="lg"
    >
      {projects.map((p) => (
        <BadgeCard
          key={p.id}
          title={p.name}
          description={p.notes}
          amount={`Valor da Cota: R$ ${p.share_value?.toLocaleString("pt-BR")}`}
          tag={p.type}
        />
      ))}
    </SimpleGrid>
  );
}



