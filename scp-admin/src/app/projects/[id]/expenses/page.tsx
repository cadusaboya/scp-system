import { cookies } from "next/headers";
import { apiGet } from "@/lib/api";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function ProjectExpensesPage({ params }: any) {
  const { id } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("access")?.value;

  const expenses = await apiGet(`/expenses/?project=${id}`, token);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">Notas do Projeto</h1>

        <Link href={`/projects/${id}/expenses/create`}>
          <Button>Cadastrar Nota</Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {expenses.map((exp: any) => (
          <Card key={exp.id} className="p-5 space-y-3">
            <h2 className="text-xl font-semibold">
              Nota {exp.number || `#${exp.id}`}
            </h2>

            <p className="text-sm text-gray-600">
              Fornecedor: {exp.vendor?.name || "—"}
            </p>

            <p className="text-sm text-gray-600">
              Data: {exp.date || "—"}
            </p>

            <p className="text-md font-bold">
              Total: R${" "}
              {Number(exp.total || 0).toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </p>

            <div className="flex gap-2 pt-2">
              <Link href={`/expenses/${exp.id}`}>
                <Button variant="secondary">Abrir</Button>
              </Link>

              <Link href={`/expenses/${exp.id}/edit`}>
                <Button variant="outline">Editar</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
