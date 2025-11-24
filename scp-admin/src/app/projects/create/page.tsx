import { cookies } from "next/headers";
import { apiPost } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

// --- SERVER ACTION ---
async function createProject(formData: FormData) {
  "use server";

  const cookieStore = await cookies();
  const token = cookieStore.get("access")?.value;
  if (!token) throw new Error("Token não encontrado");

  // Criar o projeto primeiro
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

  const project = await apiPost("/projects/", body, token);

  // 🔥 Agora criar os 10 BudgetItems automaticamente
  const budgetPayload = [
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

  for (const item of budgetPayload) {
    const value = Number(formData.get(item.field) || 0);

    await apiPost(
      "/budgets/",
      {
        project: project.id,
        category_name: item.category, // Vamos usar category_name no backend (explico abaixo)
        planned_value: value,
      },
      token
    );
  }

  redirect("/projects");
}

// --- SERVER COMPONENT ---
export default function CreateProjectPage() {
  return (
    <div className="flex justify-center">
      <Card className="p-8 w-[600px] space-y-4">
        <h1 className="text-2xl font-semibold">Criar Projeto</h1>

        <form action={createProject} className="space-y-4">
          <Input name="name" placeholder="Nome do Projeto" required />

          {/* TYPE */}
          <select name="type" className="w-full border rounded p-2" required>
            <option value="">Selecione o tipo</option>
            <option value="leilao">Leilão</option>
            <option value="construcao">Construção</option>
            <option value="reforma">Reforma</option>
          </select>

          {/* STATUS */}
          <select name="status" className="w-full border rounded p-2" required>
            <option value="planejado">Planejado</option>
            <option value="em_obra">Em obra</option>
            <option value="a_venda">À venda</option>
            <option value="vendido">Vendido</option>
            <option value="encerrado">Encerrado</option>
          </select>

          <Input name="stage" placeholder="Etapa (ex.: Fundação, Acabamento)" />
          <Input name="address" placeholder="Endereço" />

          <Input type="date" name="start_date" placeholder="Data de Início" />
          <Input type="date" name="expected_end_date" placeholder="Data Prevista de Conclusão" />
          <Input type="date" name="sold_date" placeholder="Data de Venda" />

          <Input type="number" name="cash_balance" placeholder="Caixa atual" />
          <Input type="number" name="shareholders" placeholder="Quantidade de Cotistas" />
          <Input type="number" name="share_value" placeholder="Valor da Cota" />
          <Input type="number" name="estimated_sale_value" placeholder="Valor de venda estimado" />
          <Input type="number" name="actual_sale_value" placeholder="Valor de venda real" />

          <Textarea name="notes" placeholder="Observações" />

          {/* 🔥 CAMPOS DO ORÇAMENTO */}
          <h2 className="text-xl font-semibold pt-4">Orçamento por Categoria</h2>

          <Input name="budget_labor" type="number" placeholder="Mão de Obra" />
          <Input name="budget_material" type="number" placeholder="Material" />
          <Input name="budget_acquisition" type="number" placeholder="Aquisição" />
          <Input name="budget_registry" type="number" placeholder="Custas Cartoriais" />
          <Input name="budget_realestate" type="number" placeholder="Custos Imobiliária" />
          <Input name="budget_licenses" type="number" placeholder="Projetos e Licenças" />
          <Input name="budget_tools" type="number" placeholder="Ferramentas e Equipamentos" />
          <Input name="budget_transport" type="number" placeholder="Frete e Transporte" />
          <Input name="budget_admin" type="number" placeholder="Administração da Obra" />
          <Input name="budget_misc" type="number" placeholder="Diversos" />

          <Button type="submit" className="w-full">
            Salvar Projeto
          </Button>
        </form>
      </Card>
    </div>
  );
}
