import { cookies } from "next/headers";
import { apiGet } from "@/lib/api";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function ProjectsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access")?.value;

  const projects = await apiGet("/projects/", token);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">Projetos</h1>

        <Link href="/projects/create">
          <Button>Criar Projeto</Button>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {projects.map((project: any) => (
          <Card
            key={project.id}
            className="p-6 space-y-4 border hover:shadow-lg transition"
          >
            {/* Título */}
            <h2 className="text-xl font-bold">{project.name}</h2>

            {/* Informações principais */}
            <div className="text-sm space-y-1 text-gray-700">
              <p>
                <span className="font-semibold">Tipo:</span> {project.type}
              </p>
              <p>
                <span className="font-semibold">Status:</span> {project.status}
              </p>
              <p>
                <span className="font-semibold">Etapa:</span>{" "}
                {project.stage || "—"}
              </p>
              <p>
                <span className="font-semibold">Endereço:</span>{" "}
                {project.address || "—"}
              </p>
              <p>
                <span className="font-semibold">Início:</span>{" "}
                {project.start_date || "—"}
              </p>
            </div>

            {/* Financeiro */}
            <div className="space-y-1 text-gray-800 pt-2">
              <p>
                <span className="font-semibold">Caixa:</span>{" "}
                R$ {Number(project.cash_balance || 0).toLocaleString("pt-BR")}
              </p>
              <p>
                <span className="font-semibold">Valor Estimado:</span>{" "}
                {project.estimated_sale_value
                  ? "R$ " +
                    Number(project.estimated_sale_value).toLocaleString("pt-BR")
                  : "—"}
              </p>
            </div>

            {/* Botões */}
            <div className="pt-4 flex gap-2">
              <Link href={`/projects/${project.id}`}>
                <Button variant="secondary" className="w-full">
                  Abrir
                </Button>
              </Link>

              <Link href={`/projects/${project.id}/edit`}>
                <Button variant="outline" className="w-full">
                  Editar
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
