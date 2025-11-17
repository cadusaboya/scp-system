import { cookies } from "next/headers";

export async function PATCH(request: Request, context: any) {
  const { params } = context;

  // ⬅️ AQUI: params é uma Promise no Next 15/16
  const { id } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("access")?.value;

  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.json();

  // Faz o PATCH autenticado no Django
  const res = await fetch(`http://localhost:8000/api/projects/${id}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();

  return new Response(text, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
