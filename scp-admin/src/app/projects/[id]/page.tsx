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
  "Diversos",
];

// Formatador de moeda
const fmt = (value: number | string) =>
  typeof value === "number"
    ? new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value)
    : value;

export default async function ProjectDetailsPage({ params }: any) {
  const { id } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("access")?.value;
  if (!token) return <div>Sem token</div>;

  // 🔥 Agora carregamos 4 coisas:
  const [project, expenses, categories, budgetItems] = await Promise.all([
    apiGet(`/projects/${id}/`, token),
    apiGet(`/expenses/?project=${id}&page_size=1000`, token),
    apiGet(`/expenses/categories/`, token),
    apiGet(`/projects/${id}/budgets/`, token), // ← orçamento previsto
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

  // ---------------------------------
  // GASTOS POR CATEGORIA — REAL
  // ---------------------------------
  const categoryTotals: Record<string, number> = {};
  OFFICIAL_CATEGORIES.forEach((cat) => {
    categoryTotals[cat] = 0;
  });

  for (const e of expenseList) {
    for (const item of e.items ?? []) {
      const catObj = categories.find((c: any) => c.id === item.category);
      const catName = catObj?.name ?? "";

      if (!catName || !OFFICIAL_CATEGORIES.includes(catName)) continue;

      const itemTotal = getItemTotal(item);
      categoryTotals[catName] += itemTotal;
    }
  }

  const categoriesSpent = OFFICIAL_CATEGORIES.map((cat) => ({
    name: cat,
    total: categoryTotals[cat],
  })).sort((a, b) => b.total - a.total);

  // ---------------------------------
  // REAL x PREVISTO
  // ---------------------------------
  const realVsPlanned = OFFICIAL_CATEGORIES.map((cat) => {
    const real = categoryTotals[cat] || 0;
    const planned =
      budgetItems.find((b: any) => b.category_name === cat)?.planned_value || 0;

    const diff = real - planned;
    const pct = planned > 0 ? (diff / planned) * 100 : 0;

    return {
      name: cat,
      planned: Number(planned),
      real,
      diff,
      pct,
    };
  });

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
          <p className="text-sm text-gray-600">Caixa</p>
          <h2 className="text-2xl font-semibold">
            {fmt(Number(project.cash_balance || 0))}
          </h2>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-gray-600">Valor de Venda estimado</p>
          <h2 className="text-2xl font-semibold">{project.estimated_sale_value
                ? fmt(Number(project.estimated_sale_value))
                : "—"}</h2>
        </Card>
      </div>

      {/* Gráfico + Informações */}
      <div className="grid grid-cols-3 gap-6">

        {/* GRAFICO */}
        <Card className="p-6 col-span-2">
          <p className="text-lg font-semibold mb-4">Gastos Mensais</p>
          <ExpensesChart data={monthlyData} />
        </Card>

        {/* INFORMAÇÕES DO PROJETO */}
        <Card className="p-6 space-y-3">
          <p className="text-lg font-semibold">Informações</p>

          <div className="space-y-2 text-sm text-gray-800">

            <p>
              <span className="font-semibold">Quantidade de Cotistas:</span><br />
              {project.shareholders ? project.shareholders : "—"}
            </p>

            <p>
              <span className="font-semibold">Valor da Cota:</span><br />
              {project.share_value ? fmt(Number(project.share_value)) : "—"}
            </p>

            <p>
              <span className="font-semibold">Área Construída:</span><br />
              {project.area ? project.area : "—"}m2
            </p>

            <hr className="my-2" />

            <p>
              <span className="font-semibold">Endereço:</span><br />
              {project.address || "—"}
            </p>

            <hr className="my-2" />

            <p>
              <span className="font-semibold">Data de Início:</span><br />
              {project.start_date || "—"}
            </p>

            <p>
              <span className="font-semibold">Previsão de Conclusão:</span><br />
              {project.expected_end_date || "—"}
            </p>

            <p>
              <span className="font-semibold">Data da Venda:</span><br />
              {project.sold_date || "—"}
            </p>

            <hr className="my-2" />

            <p>
              <span className="font-semibold">Observações:</span><br />
              {project.notes || "—"}
            </p>
          </div>
        </Card>

      </div>


      {/* REAL X PREVISTO */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Real x Previsto</h2>

        <div className="grid grid-cols-5 font-semibold text-gray-600 border-b pb-2 mb-3">
          <span>Categoria</span>
          <span>Previsto</span>
          <span>Real</span>
          <span>Diferença</span>
          <span>Variação %</span>
        </div>

        <div className="space-y-2">
          {realVsPlanned.map((row) => {
            const planned = row.planned;
            const real = row.real;
            const diff = real - planned;

            // regra de cor
            let diffColor = "text-black";
            let pctColor = "text-black";

            if (diff < 0) {
              // SOBROU (gastou menos)
              diffColor = "text-green-600 font-medium";
              pctColor = "text-green-600 font-medium";
            } else if (diff > 0) {
              // ESTOUROU (gastou mais)
              diffColor = "text-red-600 font-medium";
              pctColor = "text-red-600 font-medium";
            }

            // variação percentual (sempre número absoluto para clareza)
            const pct =
              planned > 0 ? Math.abs(diff) / planned * 100 : 0;

            return (
              <div
                key={row.name}
                className="grid grid-cols-5 py-1 border-b last:border-none"
              >
                <span>{row.name}</span>

                <span>{fmt(planned)}</span>
                <span>{fmt(real)}</span>

                <span className={diffColor}>{fmt(diff)}</span>

                <span className={pctColor}>{pct.toFixed(1)}%</span>
              </div>
            );
          })}
        </div>
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
