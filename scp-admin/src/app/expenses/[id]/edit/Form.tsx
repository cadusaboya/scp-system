"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { apiPost, apiPatch } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function EditExpenseForm({ expense, vendors, categories, products }) {
  const router = useRouter();

  const [vendorName, setVendorName] = useState(expense.vendor?.name || "");
  const [date, setDate] = useState(expense.date || "");
  const [number, setNumber] = useState(expense.number || "");
  const [attachmentUrl, setAttachmentUrl] = useState(expense.attachment_url || "");

  // items inicial: converte category/product ID → nome
  const initialItems = (expense.items || []).map((it) => {
    const categoryName = categories.find((c) => c.id === it?.category)?.name || "";
    const productName = products.find((p) => p.id === it?.product)?.name || "";

    return {
      id: it.id ?? null,
      category: categoryName,
      product: productName,
      qty: String(it.qty ?? ""),
      unit_price: String(it.unit_price ?? ""),
    };
  });

  const [items, setItems] = useState(
    initialItems.length
      ? initialItems
      : [{ id: null, category: "", product: "", qty: "", unit_price: "" }]
  );

  const getToken = () =>
    document.cookie.split("; ").find((c) => c.trim().startsWith("access="))?.split("=")[1];

  const total = useMemo(
    () =>
      items.reduce(
        (sum, it) => sum + Number(it.qty || 0) * Number(it.unit_price || 0),
        0
      ),
    [items]
  );

  function addItem() {
    setItems([
      ...items,
      { id: null, category: "", product: "", qty: "", unit_price: "" },
    ]);
  }

  function removeItem(index) {
    setItems(items.filter((_, i) => i !== index));
  }

  function updateItem(index, field, value) {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  }

  // Category é fixa
  function resolveCategory(name) {
    const cat = categories.find((c) => c.name === name);
    if (!cat) throw new Error(`Categoria inválida: ${name}`);
    return cat.id;
  }

  async function resolveProduct(name, token) {
    if (!name.trim()) return null;

    const existing = products.find((p) => p.name === name);
    if (existing) return existing.id;

    const created = await apiPost("/expenses/products/", { name }, token);
    return created.id;
  }

  async function handleSubmit() {
    const token = getToken();
    if (!token) {
      alert("Token não encontrado — faça login novamente.");
      return;
    }

    // ----------------- VENDOR -----------------
    let vendorId = null;
    const existingVendor = vendors.find((v) => v.name === vendorName);

    if (existingVendor) vendorId = existingVendor.id;
    else if (vendorName.trim() !== "") {
      const newVendor = await apiPost("/expenses/vendors/", { name: vendorName }, token);
      vendorId = newVendor.id;
    }

    // ------------------ ITEMS -----------------
    const resolvedItems = [];

    for (const it of items) {
      const catId = resolveCategory(it.category);
      const prodId = await resolveProduct(it.product, token);

      const obj = {
        category: catId,
        product: prodId,
        qty: Number(it.qty || 0),
        unit_price: Number(it.unit_price || 0),
      };

      if (it.id) obj.id = it.id;

      resolvedItems.push(obj);
    }

    const payload = {
      vendor_id: vendorId,
      date,
      number,
      attachment_url: attachmentUrl,
      items: resolvedItems,
      total: Number(total.toFixed(2)),
    };

    await apiPatch(`/expenses/${expense.id}/`, payload, token);

    router.push(`/expenses/${expense.id}`);
  }

  return (
    <div className="flex justify-center">
      <Card className="p-8 w-[1000px] space-y-8 shadow-lg border border-gray-200">
        <h1 className="text-3xl font-semibold mb-4">
          Editar Nota — Projeto {expense.project}
        </h1>

        {/* FORNECEDOR */}
        <div>
          <label className="text-sm font-semibold">Fornecedor</label>
          <input
            list="vendors-list"
            className="w-full border rounded p-2 mt-1"
            placeholder="Selecione ou digite um novo fornecedor"
            value={vendorName}
            onInput={(e) => setVendorName(e.target.value)}
          />
          <datalist id="vendors-list">
            {vendors.map((v) => (
              <option key={v.id} value={v.name} />
            ))}
          </datalist>
        </div>

        {/* DATA E NÚMERO */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-sm font-semibold">Data</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="flex-1">
            <label className="text-sm font-semibold">Número</label>
            <Input value={number} onChange={(e) => setNumber(e.target.value)} />
          </div>
        </div>

        {/* LINK */}
        <div>
          <label className="text-sm font-semibold">Link da Nota</label>
          <Input
            placeholder="URL do PDF/JPG"
            value={attachmentUrl}
            onChange={(e) => setAttachmentUrl(e.target.value)}
          />
        </div>

        {/* ============ ITENS ============ */}
        <div className="space-y-4 mt-6">
          <h2 className="text-xl font-semibold">Itens da Nota</h2>

          {/* HEADER DA “TABELA” */}
          <div className="grid grid-cols-6 gap-3 text-sm font-semibold text-slate-600 px-1">
            <div>Categoria</div>
            <div>Produto</div>
            <div>Qtd</div>
            <div>Valor Unitário</div>
            <div>Total</div>
            <div></div>
          </div>

          {/* LISTA DE ITENS */}
          {items.map((it, index) => {
            const itemTotal =
              Number(it.qty || 0) * Number(it.unit_price || 0);

            return (
              <Card key={index} className="p-3 bg-gray-50 border border-gray-200">
                <div className="grid grid-cols-6 gap-3 items-center">

                  {/* CATEGORIA */}
                  <select
                    className="border p-2 rounded"
                    value={it.category}
                    onChange={(e) => updateItem(index, "category", e.target.value)}
                  >
                    <option value="">Selecione</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  {/* PRODUTO */}
                  <input
                    list="products-list"
                    className="border p-2 rounded"
                    placeholder="Produto"
                    value={it.product}
                    onChange={(e) => updateItem(index, "product", e.target.value)}
                  />

                  {/* QTD */}
                  <Input
                    placeholder="Qtd"
                    value={it.qty}
                    onChange={(e) => updateItem(index, "qty", e.target.value)}
                  />

                  {/* PREÇO */}
                  <Input
                    placeholder="R$"
                    value={it.unit_price}
                    onChange={(e) => updateItem(index, "unit_price", e.target.value)}
                  />

                  {/* TOTAL ITEM */}
                  <div className="font-medium">
                    R$ {itemTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </div>

                  {/* BOTÃO X */}
                  <button
                    className="text-red-500 hover:text-red-700 font-bold text-xl"
                    onClick={() => removeItem(index)}
                  >
                    ×
                  </button>
                </div>

                {it.id && (
                  <div className="text-xs text-slate-500 mt-1">
                    id do item: {it.id}
                  </div>
                )}
              </Card>
            );
          })}

          <Button variant="secondary" onClick={addItem}>
            + Adicionar Item
          </Button>
        </div>

        {/* TOTAL GERAL */}
        <h2 className="text-2xl font-bold text-right pt-4">
          Total Geral: R${" "}
          {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </h2>

        <Button className="w-full mt-4" onClick={handleSubmit}>
          Salvar Alterações
        </Button>
      </Card>
    </div>
  );
}
