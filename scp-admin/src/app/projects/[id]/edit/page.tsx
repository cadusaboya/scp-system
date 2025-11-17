import { cookies } from "next/headers";
import { apiGet, apiPatch } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

// --- SERVER ACTION ---
async function updateProject(id: string, formData: FormData) {
  "use server";

  const cookieStore = await cookies();
  const token = cookieStore.get("access")?.value;

  if (!token) {
    throw new Error("Token não encontrado");
  }

  const body = {
    name: formData.get("name"),
    type: formData.get("type"),
    status: formData.get("status"),
    stage: formData.get("stage") || "",
    address: formData.get("address") || "",

    start_date: formData.get("start_date") || null,
    expected_end_date: formData.get("expected_end_date") || null,
    sold_date: formData.get("sold_date") || null,

    cash_balance: Number(formData.get("cash_balance") || 0),
    share_value: Number(formData.get("share_value") || 0),
    estimated_sale_value: Number(formData.get("estimated_sale_value") || 0),
    actual_sale_value: Number(formData.get("actual_sale_value") || 0),

    notes: formData.get("notes") || "",
  };

  await apiPatch(`/projects/${id}/`, body, token);

  redirect(`/projects/${id}`);
}

// --- SERVER COMPONENT ---
export default async function EditProjectPage({ params }: any) {
  const { id } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("access")?.value;

  const project = await apiGet(`/projects/${id}/`, token);

  return (
    <div className="flex justify-center">
      <Card className="p-8 w-[650px] space-y-6">
        <h1 className="text-2xl font-semibold">Editar Projeto</h1>

        <form
          action={async (formData) => {
            "use server";
            await updateProject(id, formData);
          }}
          className="space-y-4"
        >
          {/* NAME */}
          <Input
            name="name"
            defaultValue={project.name}
            placeholder="Nome do Projeto"
            required
          />

          {/* TYPE */}
          <select
            name="type"
            defaultValue={project.type}
            className="w-full border rounded p-2"
            required
          >
            <option value="leilao">Leilão</option>
            <option value="construcao">Construção</option>
            <option value="reforma">Reforma</option>
          </select>

          {/* STATUS */}
          <select
            name="status"
            defaultValue={project.status}
            className="w-full border rounded p-2"
            required
          >
            <option value="planejado">Planejado</option>
            <option value="em_obra">Em obra</option>
            <option value="a_venda">À venda</option>
            <option value="vendido">Vendido</option>
            <option value="encerrado">Encerrado</option>
          </select>

          {/* STAGE */}
          <Input
            name="stage"
            defaultValue={project.stage || ""}
            placeholder="Etapa (ex.: Fundação, Acabamento)"
          />

          {/* ADDRESS */}
          <Input
            name="address"
            defaultValue={project.address || ""}
            placeholder="Endereço"
          />

          {/* DATES */}
          <div className="grid grid-cols-3 gap-4">
            <Input
              type="date"
              name="start_date"
              defaultValue={project.start_date || ""}
            />
            <Input
              type="date"
              name="expected_end_date"
              defaultValue={project.expected_end_date || ""}
            />
            <Input
              type="date"
              name="sold_date"
              defaultValue={project.sold_date || ""}
            />
          </div>

          {/* NUMBERS */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              name="cash_balance"
              defaultValue={project.cash_balance}
              placeholder="Caixa atual"
            />
            <Input
              type="number"
              name="share_value"
              defaultValue={project.share_value || ""}
              placeholder="Valor da Cota"
            />
            <Input
              type="number"
              name="estimated_sale_value"
              defaultValue={project.estimated_sale_value || ""}
              placeholder="Valor de venda estimado"
            />
            <Input
              type="number"
              name="actual_sale_value"
              defaultValue={project.actual_sale_value || ""}
              placeholder="Valor de venda real"
            />
          </div>

          {/* NOTES */}
          <Textarea
            name="notes"
            defaultValue={project.notes || ""}
            placeholder="Observações"
          />

          <Button type="submit" className="w-full">
            Salvar Alterações
          </Button>
        </form>
      </Card>
    </div>
  );
}
