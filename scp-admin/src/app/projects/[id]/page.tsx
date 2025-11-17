import { cookies } from "next/headers";
import { apiGet } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function ProjectDetailsPage({ params }: any) {
  const { id } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("access")?.value;

  if (!token) return <div>Sem token</div>;

  const project = await apiGet(`/projects/${id}/`, token);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{project.name}</h1>

        <div className="flex gap-3">
          <Link href={`/projects/${id}/edit`}>
            <Button variant="default">Editar</Button>
          </Link>

          <Link href={"/projects"}>
            <Button variant="outline">Voltar</Button>
          </Link>
        </div>
      </div>

      {/* Cards principais */}
      <div className="grid grid-cols-3 gap-6">
        <Card className="p-6 space-y-2">
          <p className="text-sm text-gray-600">Status</p>
          <h2 className="text-xl font-semibold">{project.status}</h2>
        </Card>

        <Card className="p-6 space-y-2">
          <p className="text-sm text-gray-600">Tipo</p>
          <h2 className="text-xl font-semibold">{project.type}</h2>
        </Card>

        <Card className="p-6 space-y-2">
          <p className="text-sm text-gray-600">Etapa</p>
          <h2 className="text-xl font-semibold">
            {project.stage || "—"}
          </h2>
        </Card>
      </div>

      {/* Financeiro */}
      <h2 className="text-2xl font-semibold">Financeiro</h2>
      <Card className="p-6 grid grid-cols-3 gap-4">
        <Info label="Caixa atual" value={`R$ ${project.cash_balance}`} />
        <Info label="Valor da Cota" value={project.share_value ?? "—"} />
        <Info
          label="Valor Estimado da Venda"
          value={project.estimated_sale_value ?? "—"}
        />
        <Info
          label="Valor Real da Venda"
          value={project.actual_sale_value ?? "—"}
        />
      </Card>

      {/* Datas */}
      <h2 className="text-2xl font-semibold">Datas</h2>
      <Card className="p-6 grid grid-cols-3 gap-4">
        <Info label="Início" value={project.start_date || "—"} />
        <Info
          label="Previsão de Conclusão"
          value={project.expected_end_date || "—"}
        />
        <Info label="Data da Venda" value={project.sold_date || "—"} />
      </Card>

      {/* Endereço */}
      <h2 className="text-2xl font-semibold">Endereço</h2>
      <Card className="p-6">
        <p>{project.address || "Não informado"}</p>
      </Card>

      {/* Notas */}
      <h2 className="text-2xl font-semibold">Observações</h2>
      <Card className="p-6">
        <p>{project.notes || "—"}</p>
      </Card>
    </div>
  );
}

// Componente auxiliar bonito
function Info({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-lg font-medium">{value}</p>
    </div>
  );
}
