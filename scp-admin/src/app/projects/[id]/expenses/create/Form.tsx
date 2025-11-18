"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ExpenseForm({ projectId, vendors, categories, products }) {
  const router = useRouter();

  const [vendorName, setVendorName] = useState("");
  const [date, setDate] = useState("");
  const [number, setNumber] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");

  const [items, setItems] = useState([
    { category: "", product: "", qty: "", unit_price: "" },
  ]);

  const getToken = () =>
    document.cookie.split("; ").find((c) => c.startsWith("access="))?.split("=")[1];

  const total = items.reduce(
    (sum, it) => sum + Number(it.qty || 0) * Number(it.unit_price || 0),
    0
  );

  function addItem() {
    setItems([
      ...items,
      { category: "", product: "", qty: "", unit_price: "" },
    ]);
  }

  function removeItem(index) {
    setItems(items.filter((_, i) => i !== index));
  }

  function updateItem(index, field, value) {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  }

  // ------------------------------------
  // SUBMIT: CRIA VENDOR / CAT / PRODUTO
  // ------------------------------------

  async function handleSubmit() {
    const token = getToken();
    if (!token) {
      alert("Token não encontrado — faça login.");
      return;
    }

    // --------------------- VENDOR ---------------------
    let vendorId = null;
    const existingVendor = vendors.find((v) => v.name === vendorName);

    if (existingVendor) {
      vendorId = existingVendor.id;
    } else if (vendorName.trim() !== "") {
      const newVendor = await apiPost("/expenses/vendors/", { name: vendorName }, token);
      vendorId = newVendor.id;
    }

    // ------------------- CATEGORY ---------------------
    async function resolveCategory(name) {
      const existing = categories.find((c) => c.name === name);
      if (existing) return existing.id;

      const created = await apiPost("/expenses/categories/", { name }, token);
      return created.id;
    }

    // ------------------- PRODUCT ----------------------
    async function resolveProduct(name) {
      if (!name.trim()) return null;

      const existing = products.find((p) => p.name === name);
      if (existing) return existing.id;

      const created = await apiPost("/expenses/products/", { name }, token);
      return created.id;
    }

    // ------------------- ITEMS ------------------------
    const resolvedItems = [];
    for (const it of items) {
      const catId  = await resolveCategory(it.category);
      const prodId = await resolveProduct(it.product);

      resolvedItems.push({
        category: catId,
        product: prodId,
        qty: Number(it.qty || 0),
        unit_price: Number(it.unit_price || 0),
      });
    }

    const payload = {
      project: Number(projectId),
      vendor: vendorId,
      date,
      number,
      attachment_url: attachmentUrl,
      items: resolvedItems,
    };

    await apiPost("/expenses/", payload, token);

    router.push(`/projects/${projectId}`);
  }

  // ------------------------------------
  // RENDER DO FORMULÁRIO
  // ------------------------------------
  return (
    <div className="flex justify-center">
      <Card className="p-8 w-[900px] space-y-8">
        <h1 className="text-3xl font-semibold">Nova Nota — Projeto {projectId}</h1>

        {/* FORNECEDOR */}
        <div>
          <label className="text-sm font-semibold">Fornecedor</label>
          <input
            list="vendors-list"
            className="w-full border rounded p-2 mt-1"
            placeholder="Selecione ou digite um novo fornecedor"
            value={vendorName}
            onChange={(e) => setVendorName(e.target.value)}
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
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="flex-1">
            <label className="text-sm font-semibold">Número</label>
            <Input
              value={number}
              onChange={(e) => setNumber(e.target.value)}
            />
          </div>
        </div>

        {/* ARQUIVO */}
        <div>
          <label className="text-sm font-semibold">Link da Nota</label>
          <Input
            placeholder="URL do PDF/JPG da nota"
            value={attachmentUrl}
            onChange={(e) => setAttachmentUrl(e.target.value)}
          />
        </div>

        {/* ITENS */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Itens</h2>

          {items.map((it, index) => (
            <Card key={index} className="p-4 space-y-3 bg-gray-50">

              <div className="grid grid-cols-4 gap-3 items-center">

                {/* Categoria */}
                <input
                  list="categories-list"
                  className="border p-2 rounded"
                  placeholder="Categoria"
                  value={it.category}
                  onChange={(e) => updateItem(index, "category", e.target.value)}
                />
                <datalist id="categories-list">
                  {categories.map((c) => (
                    <option key={c.id} value={c.name} />
                  ))}
                </datalist>

                {/* Produto */}
                <input
                  list="products-list"
                  className="border p-2 rounded"
                  placeholder="Produto"
                  value={it.product}
                  onChange={(e) => updateItem(index, "product", e.target.value)}
                />
                <datalist id="products-list">
                  {products.map((p) => (
                    <option key={p.id} value={p.name} />
                  ))}
                </datalist>

                {/* Quantidade */}
                <Input
                  placeholder="Qtd"
                  value={it.qty}
                  onChange={(e) => updateItem(index, "qty", e.target.value)}
                />

                {/* Preço */}
                <Input
                  placeholder="Preço"
                  value={it.unit_price}
                  onChange={(e) =>
                    updateItem(index, "unit_price", e.target.value)
                  }
                />
              </div>

              {/* remover item */}
              {items.length > 1 && (
                <Button variant="destructive" onClick={() => removeItem(index)}>
                  Remover Item
                </Button>
              )}
            </Card>
          ))}

          <Button variant="secondary" onClick={addItem}>
            Adicionar Item
          </Button>
        </div>

        {/* TOTAL */}
        <h2 className="text-xl font-bold">
          Total: R$
          {" "}
          {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </h2>

        <Button className="w-full" onClick={handleSubmit}>
          Salvar Nota
        </Button>
      </Card>
    </div>
  );
}
