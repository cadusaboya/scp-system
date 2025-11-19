import { cookies } from "next/headers";
import { apiGet } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

// -----------------------------
// SERVER ACTION
// -----------------------------
async function updateProject(id: string, formData: FormData) {
  "use server";

  const cookieStore = await cookies();
  const token = cookieStore.get("access")?.value;
  if (!token) throw new Error("Token não encontrado");

  // ----------- ATUALIZA O PROJETO -----------
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

  // PATCH do projeto
  await fetch(`http://localhost:8000/api/projects/${id}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  // ----------- ATUALIZA OU RECRIA BUDGET ITEMS -----------

  const budgetMap = [
    { field: "budget_labor", category: "Mão de Obra" },
    { field: "budget_material", category: "Material" },
    { field: "budget_acquisition", category: "Aquisição" },
    { field: "budget_registry", category: "Custas Cartoriais" },
    { field: "budget_realestate", category: "Custos Imobiliária" },
    { field: "budget_licenses", category: "Projetos e Licenças" },
    { field: "budget_tools", category: "Ferramentas e Equipamentos" },
    { field: "budget_transport", category: "Frete e Transporte" },
    { field: "budget_admin", category: "Administração da Obra" },
    { field: "budget_misc", category: "Diversos" },
  ];

  // Monta um array com os budgets
  const budgetPayload = budgetMap.map(item => ({
    category_name: item.category,
    planned_value: Number(formData.get(item.field) || 0),
  }));

  // Envia todos de uma vez
  await fetch(`http://localhost:8000/api/budgets/project/${id}/recreate/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(budgetPayload),
  });


  redirect(`/projects/${id}`);
}

// -----------------------------
// SERVER COMPONENT
// -----------------------------
export default async function EditProjectPage({ params }: any) {
  const { id } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("access")?.value;
  const project = await apiGet(`/projects/${id}/`, token);
  const budgets = await apiGet(`/projects/${id}/budgets/`, token);

  // cria mapa com valores atuais
  const map: Record<string, number> = {};
  for (const b of budgets) {
    map[b.category_name] = Number(b.planned_value || 0);
  }

  return (
    <div className="flex justify-center">
      <Card className="p-8 w-[650px] space-y-6">
        <h1 className="text-2xl font-semibold">Editar Projeto</h1>

        <form action={updateProject.bind(null, id)} className="space-y-4">
          {/* NAME */}
          <Input name="name" defaultValue={project.name} required />

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

          <Input name="stage" defaultValue={project.stage || ""} />
          <Input name="address" defaultValue={project.address || ""} />

          {/* DATES */}
          <div className="grid grid-cols-3 gap-4">
            <Input type="date" name="start_date" defaultValue={project.start_date} />
            <Input type="date" name="expected_end_date" defaultValue={project.expected_end_date} />
            <Input type="date" name="sold_date" defaultValue={project.sold_date} />
          </div>

          {/* NUMBERS */}
          <div className="grid grid-cols-2 gap-4">
            <Input type="number" name="cash_balance" defaultValue={project.cash_balance} />
            <Input type="number" name="share_value" defaultValue={project.share_value} />
            <Input type="number" name="estimated_sale_value" defaultValue={project.estimated_sale_value} />
            <Input type="number" name="actual_sale_value" defaultValue={project.actual_sale_value} />
          </div>

          <Textarea name="notes" defaultValue={project.notes} />

          {/* ORÇAMENTO */}
          <h2 className="text-xl font-semibold pt-2">Orçamento por Categoria</h2>

          <Input
            type="number"
            name="budget_labor"
            defaultValue={map["Mão de Obra"] || 0}
            placeholder="Mão de Obra"
          />
          <Input
            type="number"
            name="budget_material"
            defaultValue={map["Material"] || 0}
            placeholder="Material"
          />
          <Input
            type="number"
            name="budget_acquisition"
            defaultValue={map["Aquisição"] || 0}
            placeholder="Aquisição"
          />
          <Input
            type="number"
            name="budget_registry"
            defaultValue={map["Custas Cartoriais"] || 0}
            placeholder="Custas Cartoriais"
          />
          <Input
            type="number"
            name="budget_realestate"
            defaultValue={map["Custos Imobiliária"] || 0}
            placeholder="Custos Imobiliária"
          />
          <Input
            type="number"
            name="budget_licenses"
            defaultValue={map["Projetos e Licenças"] || 0}
            placeholder="Projetos e Licenças"
          />
          <Input
            type="number"
            name="budget_tools"
            defaultValue={map["Ferramentas e Equipamentos"] || 0}
            placeholder="Ferramentas e Equipamentos"
          />
          <Input
            type="number"
            name="budget_transport"
            defaultValue={map["Frete e Transporte"] || 0}
            placeholder="Frete e Transporte"
          />
          <Input
            type="number"
            name="budget_admin"
            defaultValue={map["Administração da Obra"] || 0}
            placeholder="Administração da Obra"
          />
          <Input
            type="number"
            name="budget_misc"
            defaultValue={map["Diversos"] || 0}
            placeholder="Diversos"
          />

          <Button type="submit" className="w-full mt-2">
            Salvar Alterações
          </Button>
        </form>
      </Card>
    </div>
  );
}
