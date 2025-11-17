import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { apiGet } from "@/lib/api";
import { Card } from "@/components/ui/card";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access")?.value;

  if (!token) {
    redirect("/login");
  }

  const projects = await apiGet("/projects/", token);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-3 gap-6">
        <Card className="p-6">
          <p className="text-gray-500">Projetos ativos</p>
          <h2 className="text-2xl font-bold">{projects.length}</h2>
        </Card>
      </div>
    </div>
  );
}
