"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type DataPoint = { month: string; total: number };

export default function ExpensesChart({ data }: { data: DataPoint[] }) {
  // Formata mês "YYYY-MM" para "MM/YYYY" ou "MMM YYYY"
  const mapped = data.map((d) => ({
    ...d,
    label: formatMonth(d.month),
  }));

  return (
    <div style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer>
        <BarChart data={mapped} margin={{ top: 10, right: 16, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis tickFormatter={(v) => formatCurrency(v)} />
          <Tooltip formatter={(value: number) => formatCurrency(Number(value))} />
          <Bar dataKey="total" name="Gasto" barSize={36} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function formatMonth(ym: string) {
  // ym = "YYYY-MM"
  const [y, m] = ym.split("-");
  if (!y || !m) return ym;
  return `${m}/${y}`;
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}
