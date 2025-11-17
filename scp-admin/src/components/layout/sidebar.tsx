"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/projects", label: "Projetos" },
  { href: "/projects/create", label: "Criar Projeto" },
  { href: "/notes/create", label: "Lançar Nota" },
  { href: "/reports", label: "Relatórios" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r h-screen p-6 space-y-4">
      <h2 className="text-2xl font-bold">SCP Admin</h2>

      <nav className="space-y-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`block p-2 rounded hover:bg-gray-100 ${
              pathname.startsWith(link.href) ? "bg-gray-200 font-medium" : ""
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
