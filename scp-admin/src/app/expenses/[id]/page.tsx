import { cookies } from "next/headers";
import { apiGet } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function ExpenseDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  const cookieStore = await cookies();
  const token = cookieStore.get("access")?.value;

  if (!token) return <div>Token não encontrado — faça login novamente.</div>;

  // Buscar nota do backend
  const expense = await apiGet(`/expenses/${id}/`, token);

  const total = Number(expense.total || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">
          Nota {expense.number || `#${expense.id}`}
        </h1>

        <div className="flex gap-3">
          <Link href={`/expenses/${id}/edit`}>
            <Button variant="outline">Editar</Button>
          </Link>

          <Link href={`/projects/${expense.project}`}>
            <Button variant="secondary">Voltar</Button>
          </Link>
        </div>
      </div>

      {/* INFO DA NOTA */}
      <Card className="p-6 space-y-3">
        <p>
          <strong>Fornecedor:</strong>{" "}
          {expense.vendor?.name || "—"}
        </p>

        <p>
          <strong>Data:</strong>{" "}
          {expense.date || "—"}
        </p>

        <p>
          <strong>Número:</strong>{" "}
          {expense.number || "—"}
        </p>

        <p>
          <strong>Anexo:</strong>{" "}
          {expense.attachment_url ? (
            <a
              href={expense.attachment_url}
              target="_blank"
              className="text-blue-600 underline"
            >
              Abrir Documento
            </a>
          ) : (
            "—"
          )}
        </p>

        <p className="text-xl font-bold">
          Total: R$ {total}
        </p>
      </Card>

      {/* ITENS DA NOTA */}
      <Card className="p-6 space-y-4">
        <h2 className="text-2xl font-semibold">Itens</h2>

        {expense.items.length === 0 && (
          <p className="text-gray-600">Nenhum item encontrado.</p>
        )}

        <div className="divide-y">
          {expense.items.map((item: any) => {
            const subtotal = Number(item.line_total).toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            });

            return (
              <div key={item.id} className="py-3 grid grid-cols-4 gap-4">
                <p>
                  <strong>Categoria:</strong>{" "}
                  {item.category_name || item.category}
                </p>
                <p>
                  <strong>Produto:</strong>{" "}
                  {item.product_name || item.product || "—"}
                </p>
                <p>
                  <strong>Qtd:</strong> {item.qty}
                </p>
                <p>
                  <strong>Subtotal:</strong> R$ {subtotal}
                </p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
