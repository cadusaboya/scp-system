import { cookies } from "next/headers";
import { apiGet } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ExpensesChart from "./ExpensesChart";
import React from "react";

// Função que extrai o valor final do item
function getItemTotal(item: any) {
  const candidates = [
    item.total,
    item.value,
    item.amount,
    item.unit_total,
    item.unitPrice,
    item.unit_price,
  ];

  for (const c of candidates) {
    if (c !== undefined && c !== null && !Number.isNaN(Number(c))) {
      return Number(c);
    }
  }

  // fallback (não deve ser usado no seu caso)
  const qty = Number(item.qty ?? 0);
  const unit = Number(item.unit_price ?? item.unitPrice ?? 0);
  return qty * unit;
}

// Lista oficial de categorias do seu projeto
const OFFICIAL_CATEGORIES = [
  "Mão de Obra",
  "Material",
  "Aquisição",
  "Custas Cartoriais",
  "Custos Imobiliária",
  "Projetos e Licenças",
  "Ferramentas e Equipamentos",
  "Frete e Transporte",
  "Administração da Obra",
  "Diversos / Contingência",
];

export default async function ProjectDetailsPage({ params }: any) {
  const { id } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("access")?.value;

  if (!token) return <div>Sem token</div>;

  // Carrega projeto + todas as expenses
  const [project, expenses, categories] = await Promise.all([
    apiGet(`/projects/${id}/`, token),
    apiGet(`/expenses/?project=${id}&page_size=1000`, token),
    apiGet(`/expenses/categories/`, token),
  ]);


  // Normaliza expenses
  const expenseList = Array.isArray(expenses)
    ? expenses
    : expenses.results ?? [];

  // TOTAL GERAL DO PROJETO
  const totalSpent = expenseList.reduce(
    (s: number, e: any) => s + Number(e.total || 0),
    0
  );

  const totalNotes = expenseList.length;

  // ULTIMAS NOTAS
  const latestNotes = [...expenseList]
    .sort((a: any, b: any) => {
      const da = a.date ?? a.created_at ?? "";
      const db = b.date ?? b.created_at ?? "";
      return new Date(db).getTime() - new Date(da).getTime();
    })
    .slice(0, 5);

  // GASTOS MENSAIS PARA O GRAFICO
  const monthlyMap: Record<string, number> = {};
  for (const e of expenseList) {
    const dStr = e.date || e.created_at;
    if (!dStr) continue;
    const d = new Date(dStr);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyMap[key] = (monthlyMap[key] || 0) + Number(e.total || 0);
  }

  const monthlyData = Object.keys(monthlyMap)
    .sort()
    .map((month) => ({
      month,
      total: monthlyMap[month],
    }));

  // ------------------------------
  // GASTOS POR CATEGORIA (FINAL)
  // ------------------------------

  // Inicia todas categorias com 0
  const categoryTotals: Record<string, number> = {};
  OFFICIAL_CATEGORIES.forEach((cat) => {
    categoryTotals[cat] = 0;
  });

  // Soma NoteItems por categoria
  for (const e of expenseList) {
    for (const item of e.items ?? []) {
      // item.category é um ID, então buscamos no array categories
      const catObj = categories.find((c: any) => c.id === item.category);
      const catName = catObj?.name ?? "Sem categoria";


      if (!catName || !OFFICIAL_CATEGORIES.includes(catName)) {
        continue;
      }

      const itemTotal = getItemTotal(item);
      categoryTotals[catName] += itemTotal;
    }
  }

  // Prepara para render
  const categoriesSpent = OFFICIAL_CATEGORIES.map((cat) => ({
    name: cat,
    total: categoryTotals[cat],
  })).sort((a, b) => b.total - a.total);

  // Formatador
  const fmt = (value: number | string) =>
    typeof value === "number"
      ? new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(value)
      : value;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-sm text-gray-600 mt-1">
            {project.type} • {project.status} • {project.stage || "—"}
          </p>
        </div>

        <div className="flex gap-3">
          <Link href={`/projects/${id}/expenses/create`}>
            <Button>Novo Lançamento</Button>
          </Link>
          <Link href={`/projects/${id}/expenses/`}>
            <Button variant="secondary">Ver Notas</Button>
          </Link>
          <Link href={`/projects/${id}/edit`}>
            <Button variant="secondary">Editar</Button>
          </Link>
          <Link href="/projects">
            <Button variant="outline">Voltar</Button>
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-6">
        <Card className="p-6">
          <p className="text-sm text-gray-600">Total Gasto</p>
          <h2 className="text-2xl font-semibold">{fmt(totalSpent)}</h2>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-gray-600">Caixa Atual</p>
          <h2 className="text-2xl font-semibold">
            {fmt(Number(project.cash_balance || 0))}
          </h2>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-gray-600">Total de Notas</p>
          <h2 className="text-2xl font-semibold">{totalNotes}</h2>
        </Card>
      </div>

      {/* Gráfico + Gastos por Categoria */}
      <div className="grid grid-cols-3 gap-6">
        {/* GRAFICO */}
        <Card className="p-6 col-span-2">
          <p className="text-lg font-semibold mb-4">Gastos Mensais</p>
          <ExpensesChart data={monthlyData} />
        </Card>

        {/* GASTOS POR CATEGORIA */}
        <Card className="p-6">
          <p className="text-lg font-semibold">Gastos por Categoria</p>

          <div className="mt-4 space-y-3">
            {categoriesSpent.map((c) => {
              const percent =
                totalSpent > 0 ? (c.total / totalSpent) * 100 : 0;

              return (
                <div key={c.name} className="flex justify-between">
                  <span>{c.name}</span>
                  <div className="flex gap-3">
                    <span>{fmt(c.total)}</span>
                    <span className="text-gray-500 text-sm">
                      {percent.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Financeiro */}
      <h2 className="text-2xl font-semibold">Financeiro</h2>
      <Card className="p-6 grid grid-cols-3 gap-4">
        <Info label="Caixa atual" value={fmt(Number(project.cash_balance || 0))} />
        <Info label="Valor da Cota" value={project.share_value ? fmt(Number(project.share_value)) : "—"} />
        <Info label="Valor Estimado da Venda" value={project.estimated_sale_value ? fmt(Number(project.estimated_sale_value)) : "—"} />
        <Info label="Valor Real da Venda" value={project.actual_sale_value ? fmt(Number(project.actual_sale_value)) : "—"} />
      </Card>

      {/* Datas */}
      <h2 className="text-2xl font-semibold">Datas</h2>
      <Card className="p-6 grid grid-cols-3 gap-4">
        <Info label="Início" value={project.start_date || "—"} />
        <Info label="Previsão de Conclusão" value={project.expected_end_date || "—"} />
        <Info label="Data da Venda" value={project.sold_date || "—"} />
      </Card>

      {/* Endereço */}
      <h2 className="text-2xl font-semibold">Endereço</h2>
      <Card className="p-6">
        <p>{project.address || "Não informado"}</p>
      </Card>

      {/* Observações */}
      <h2 className="text-2xl font-semibold">Observações</h2>
      <Card className="p-6">
        <p>{project.notes || "—"}</p>
      </Card>

      {/* Últimas Notas */}
      <h2 className="text-2xl font-semibold">Últimas Notas</h2>
      <Card className="p-6 space-y-3">
        {latestNotes.map((n) => (
          <div key={n.id} className="flex justify-between items-center">
            <div>
              <p className="font-medium">
                {n.number ? `Nota ${n.number}` : `Nota ${n.id}`}
              </p>
              <p className="text-gray-500 text-sm">
                {n.vendor?.name ?? "—"} • {n.date ?? "—"}
              </p>
            </div>

            <div className="flex gap-3">
              <span className="font-medium">{fmt(Number(n.total || 0))}</span>
              <Link href={`/expenses/${n.id}`}>
                <Button variant="outline">Ver</Button>
              </Link>
            </div>
          </div>
        ))}

        <div className="pt-3 border-t">
          <Link href={`/projects/${id}/expenses/`}>
            <Button variant="secondary">Ver todas as notas</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

// Componente Info
function Info({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-lg font-medium">{value}</p>
    </div>
  );
}
