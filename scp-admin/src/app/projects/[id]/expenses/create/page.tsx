import { cookies } from "next/headers";
import { apiGet } from "@/lib/api";
import ExpenseForm from "./Form";

export default async function CreateExpensePage(props: {
  params: Promise<{ id: string }>;
}) {
  // ⬇⬇⬇ ESTA É A LINHA QUE RESOLVE DEFINITIVAMENTE
  const { id: projectId } = await props.params;

  // ⬇ cookies() também virou Promise
  const cookieStore = await cookies();
  const token = cookieStore.get("access")?.value;

  if (!token) {
    return <div>Sem token — faça login novamente.</div>;
  }

  const [vendors, categories, products] = await Promise.all([
    apiGet("/expenses/vendors/", token),
    apiGet("/expenses/categories/", token),
    apiGet("/expenses/products/", token),
  ]);

  return (
    <ExpenseForm
      projectId={projectId}
      vendors={vendors}
      categories={categories}
      products={products}
    />
  );
}
