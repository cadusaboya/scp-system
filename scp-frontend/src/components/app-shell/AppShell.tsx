"use client";
import { AppShell } from "@mantine/core";
import { NavbarNested } from "@/components/layout/Navbar/NavbarNested";

export default function LayoutAppShell({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      padding="md"
      navbar={{ width: 300, breakpoint: "sm", collapsed: { mobile: false } }}
    >
      <AppShell.Navbar>
        <NavbarNested />
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
