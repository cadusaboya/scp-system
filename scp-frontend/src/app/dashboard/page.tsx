"use client";
import { useEffect, useState } from "react";
import RequireAuth from "@/components/auth/RequireAuth";
import AppShell from "@/components/app-shell/AppShell";
import { TableReviews, ReviewItem } from "@/components/TableReviews/TableReviews";
import { api } from "@/lib/api";
import { Loader, Title, Text, Card, SimpleGrid, Stack } from "@mantine/core";

interface Investment {
  id: number;
  project: number;
  project_name: string;
  project_type: string;
  project_share_value: string;
  value: string;
  date: string;
  note: string;
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<ReviewItem[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [projectsRes, investmentsRes] = await Promise.all([
          api.get<ReviewItem[]>("/projects/mine/"),
          api.get<Investment[]>("/investments/mine/"),
        ]);

        setProjects(projectsRes.data);
        setInvestments(investmentsRes.data);
      } catch (err: any) {
        console.error(err);
        setError("Erro ao carregar informações do usuário");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 🔹 Projetos que ainda não encerraram
  const projetosEmAndamento = projects.filter((p) => p.status !== "encerrado");

  // 🔹 Valor investido apenas nesses projetos
  const valorInvestido = investments.reduce((acc, inv) => {
    const projetoRelacionado = projetosEmAndamento.find(
      (p) => p.id === inv.project
    );
    if (projetoRelacionado) {
      return acc + Number(inv.value || 0);
    }
    return acc;
  }, 0);

  // 🔹 Monta os dados da tabela combinando investimentos + projetos
  const tableData: ReviewItem[] = projects.map((proj) => {
    const userInvestment = investments.find((inv) => inv.project === proj.id);

    return {
      ...proj,
      invested_value: userInvestment ? Number(userInvestment.value) : 0,
      investment_date: userInvestment ? userInvestment.date : null,
    };
  });

    return (
    <RequireAuth>
        <AppShell>
            <Stack gap="md" px="xl" py="md">
                <Title order={2}>Dashboard</Title>

                {/* === CARDS ESTILO QUADRADO === */}
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                <Card
                    withBorder
                    shadow="md"
                    radius="md"
                    style={{
                    textAlign: "center",
                    padding: "2rem",
                    }}
                >
                    <Text c="dimmed" fw={500}>
                    Projetos em andamento
                    </Text>
                    <Text fz="3rem" fw={700}>
                    {projetosEmAndamento.length}
                    </Text>
                </Card>

                <Card
                    withBorder
                    shadow="md"
                    radius="md"
                    style={{
                    textAlign: "center",
                    padding: "2rem",
                    }}
                >
                    <Text c="dimmed" fw={500}>
                    Valor investido
                    </Text>
                    <Text fz="2.5rem" fw={700} c="green">
                    {valorInvestido.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                    })}
                    </Text>
                </Card>
                </SimpleGrid>

                {/* === TABELA DE PROJETOS === */}
                {loading && <Loader />}
                {error && (
                <div className="text-red-600 text-sm border border-red-300 bg-red-50 p-3 rounded-md">
                    {error}
                </div>
                )}
                {!loading && !error && <TableReviews data={tableData} />}
            </Stack>
        </AppShell>
    </RequireAuth>
    );
}
