import { cookies } from "next/headers";
import { apiGet } from "@/lib/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import TableSort from "@/components/mantine/TableSort";

export default async function ProjectExpensesPage(props: {
  params: Promise<{ id: string }>;
}) {
  // Next 14.2+ — params é Promise em nested routes
  const { id: projectId } = await props.params;

  // cookies() também é async
  const cookieStore = await cookies();
  const token = cookieStore.get("access")?.value;

  if (!token) {
    return <div>Token não encontrado — faça login novamente.</div>;
  }

  // Busca as notas deste projeto
  const expenses = await apiGet(`/expenses/?project=${projectId}`, token);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">Notas do Projeto</h1>

        <Link href={`/projects/${projectId}/expenses/create`}>
          <Button>Cadastrar Nota</Button>
        </Link>
      </div>

      {/* TABELA COM SORT */}
      <TableSort projectId={projectId} expenses={expenses} />
    </div>
  );
}
