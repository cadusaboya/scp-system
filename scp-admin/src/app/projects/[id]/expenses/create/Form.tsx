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
  const [selectedVendorId, setSelectedVendorId] = useState(null);

  const [date, setDate] = useState("");
  const [number, setNumber] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");

  const [items, setItems] = useState([
    { category: "", product: "", qty: "", unit_price: "" },
  ]);

  const getToken = () =>
    document.cookie.split("; ").find((c) => c.startsWith("access="))?.split("=")[1];

  const normalize = (str) =>
    str
      ?.trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ");

  const total = items.reduce(
    (sum, it) => sum + Number(it.qty || 0) * Number(it.unit_price || 0),
    0
  );

  function addItem() {
    setItems([...items, { category: "", product: "", qty: "", unit_price: "" }]);
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
  // SUBMIT
  // ------------------------------------
  async function handleSubmit() {
    const token = getToken();
    if (!token) return alert("Token não encontrado — faça login.");

    // 1. Vendor
    let vendorId = selectedVendorId;
    if (!vendorId && vendorName.trim() !== "") {
      const newVendor = await apiPost(
        "/expenses/vendors/",
        { name: vendorName.trim() },
        token
      );
      vendorId = newVendor.id;
    }

    // 2. Category
    function resolveCategory(name) {
      const c = categories.find((c) => c.name === name);
      if (!c) throw new Error(`Categoria inválida: ${name}`);
      return c.id;
    }

    // 3. Product
    async function resolveProduct(name) {
      if (!name.trim()) return null;

      const existing = products.find((p) => normalize(p.name) === normalize(name));
      if (existing) return existing.id;

      const created = await apiPost(
        "/expenses/products/",
        { name: name.trim() },
        token
      );
      return created.id;
    }

    // 4. Items
    const resolvedItems = [];
    for (const it of items) {
      resolvedItems.push({
        category: resolveCategory(it.category),
        product: await resolveProduct(it.product),
        qty: Number(it.qty || 0),
        unit_price: Number(it.unit_price || 0),
      });
    }

    // 5. Payload
    const payload = {
      project: Number(projectId),
      vendor_id: vendorId,
      date,
      number,
      attachment_url: attachmentUrl,
      items: resolvedItems,
    };

    await apiPost("/expenses/", payload, token);

    router.push(`/projects/${projectId}`);
  }

  // ------------------------------------
  // FORM
  // ------------------------------------
  return (
    <div className="flex justify-center">
      <Card className="p-8 w-[1000px] space-y-8 shadow-lg border border-gray-200">
        <h1 className="text-3xl font-semibold">
          Nova Nota — Projeto {projectId}
        </h1>

        {/* FORNECEDOR */}
        <div>
          <label className="text-sm font-semibold">Fornecedor</label>
          <input
            list="vendors-list"
            className="w-full border rounded p-2 mt-1"
            placeholder="Selecione ou digite um fornecedor"
            value={vendorName}
            onInput={(e) => {
              const value = e.target.value;
              setVendorName(value);
              const match = vendors.find((v) => v.name === value);
              setSelectedVendorId(match ? match.id : null);
            }}
          />

          <datalist id="vendors-list">
            {vendors.map((v) => (
              <option key={v.id} value={v.name} />
            ))}
          </datalist>
        </div>

        {/* DATA E NUMERO */}
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
            placeholder="URL do PDF/JPG da nota"
            value={attachmentUrl}
            onChange={(e) => setAttachmentUrl(e.target.value)}
          />
        </div>

        {/* ============ ITENS ============ */}
        <div className="space-y-4 mt-6">
          <h2 className="text-xl font-semibold">Itens da Nota</h2>

          {/* HEADER */}
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
                    onInput={(e) => updateItem(index, "product", e.target.value)}
                  />

                  {/* QTD */}
                  <Input
                    placeholder="Qtd"
                    value={it.qty}
                    onChange={(e) => updateItem(index, "qty", e.target.value)}
                  />

                  {/* VALOR UNITÁRIO */}
                  <Input
                    placeholder="R$"
                    value={it.unit_price}
                    onChange={(e) => updateItem(index, "unit_price", e.target.value)}
                  />

                  {/* TOTAL POR ITEM */}
                  <div className="font-medium">
                    R$ {itemTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </div>

                  {/* X PARA REMOVER */}
                  {items.length > 1 && (
                    <button
                      className="text-red-500 hover:text-red-700 font-bold text-xl"
                      onClick={() => removeItem(index)}
                    >
                      ×
                    </button>
                  )}
                </div>
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
          Salvar Nota
        </Button>
      </Card>
    </div>
  );
}
