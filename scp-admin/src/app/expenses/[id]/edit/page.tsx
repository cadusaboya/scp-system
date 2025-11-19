import { cookies } from "next/headers";
import { apiGet } from "@/lib/api";
import EditExpenseForm from "./Form";

export default async function EditExpensePage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id: expenseId } = await props.params;

  const cookieStore = await cookies();
  const token = cookieStore.get("access")?.value;

  if (!token) {
    return <div>Sem token — faça login novamente.</div>;
  }

  // Carrega expense + listas auxiliares
  const [expense, vendors, categories, products] = await Promise.all([
    apiGet(`/expenses/${expenseId}/`, token),
    apiGet("/expenses/vendors/", token),
    apiGet("/expenses/categories/", token),
    apiGet("/expenses/products/", token),
  ]);

  return (
    <EditExpenseForm
      expense={expense}
      vendors={vendors}
      categories={categories}
      products={products}
    />
  );
}
