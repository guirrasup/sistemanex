import React, { useState, useEffect } from "react";
import { store } from "../services/store";
import { Product } from "../types";
import { Package, Plus, Minus, Search, Trash2, Edit3, Tag, Boxes, X } from "lucide-react";

export const InventoryView: React.FC = () => {
  const [, setTick] = useState(0);
  useEffect(() => {
    return store.subscribe(() => setTick(t => t + 1));
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form state
  const [sku, setSku] = useState(`PROD-${Math.floor(100 + Math.random() * 900)}`);
  const [gtin, setGtin] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Eletrônicos");
  const [costPrice, setCostPrice] = useState<string>("");
  const [sellingPrice, setSellingPrice] = useState<string>("");
  const [minSellingPrice, setMinSellingPrice] = useState<string>("");
  const [initialStock, setInitialStock] = useState<string>("10");
  const [minStock, setMinStock] = useState<string>("5");
  const [maxStock, setMaxStock] = useState<string>("500");
  const [locationRack, setLocationRack] = useState("A-01");
  const [unit, setUnit] = useState("UN");

  // Fiscal fields
  const [ncmCode, setNcmCode] = useState("8471.50.10");
  const [cestCode, setCestCode] = useState("21.001.00");
  const [origin, setOrigin] = useState("0");
  const [cfop, setCfop] = useState("5102");
  const [icmsRate, setIcmsRate] = useState("18");
  const [pisRate, setPisRate] = useState("1.65");
  const [cofinsRate, setCofinsRate] = useState("7.6");
  const [ipiRate, setIpiRate] = useState("0");

  const [activeModalTab, setActiveModalTab] = useState<"general" | "fiscal" | "stock">("general");

  const products = store.products || [];

  // Filter products
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.gtin && p.gtin.includes(searchQuery)) ||
    (p.ncm_code && p.ncm_code.includes(searchQuery))
  );

  // Totals
  const totalProducts = products.length;
  const totalQuantity = products.reduce((acc, p) => acc + (p.stock_quantity || 0), 0);
  const totalValue = products.reduce((acc, p) => acc + ((p.stock_quantity || 0) * p.cost_price), 0);

  const handleAdjustStock = (productId: string, change: number) => {
    store.adjustStock(productId, change);
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setSku(`PROD-${Math.floor(100 + Math.random() * 900)}`);
    setGtin(`789${Math.floor(1000000000 + Math.random() * 9000000000)}`);
    setName("");
    setCategory("Eletrônicos");
    setCostPrice("");
    setSellingPrice("");
    setMinSellingPrice("");
    setInitialStock("10");
    setMinStock("5");
    setMaxStock("500");
    setLocationRack("A-01");
    setUnit("UN");
    setNcmCode("8471.50.10");
    setCestCode("21.001.00");
    setOrigin("0");
    setCfop("5102");
    setIcmsRate("18");
    setPisRate("1.65");
    setCofinsRate("7.6");
    setIpiRate("0");
    setActiveModalTab("general");
    setShowAddModal(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setSku(p.sku);
    setGtin(p.gtin || "");
    setName(p.name);
    setCategory(p.category || "Geral");
    setCostPrice(String(p.cost_price));
    setSellingPrice(String(p.selling_price));
    setMinSellingPrice(String(p.min_selling_price || p.selling_price * 0.9));
    setInitialStock(String(p.stock_quantity));
    setMinStock(String(p.min_stock_quantity || 5));
    setMaxStock(String(p.max_stock_quantity || 500));
    setLocationRack(p.location_rack || "A-01");
    setUnit(p.unit_of_measure);
    setNcmCode(p.ncm_code || "8471.50.10");
    setCestCode(p.cest_code || "21.001.00");
    setOrigin(p.origin || "0");
    setCfop(p.cfop || "5102");
    setIcmsRate(String(p.icms_rate ?? 18));
    setPisRate(String(p.pis_rate ?? 1.65));
    setCofinsRate(String(p.cofins_rate ?? 7.6));
    setIpiRate(String(p.ipi_rate ?? 0));
    setActiveModalTab("general");
    setShowAddModal(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !costPrice || !sellingPrice) return;

    const payload = {
      sku,
      gtin,
      name,
      category,
      unit_of_measure: unit,
      cost_price: Number(costPrice),
      selling_price: Number(sellingPrice),
      min_selling_price: Number(minSellingPrice) || Number(sellingPrice) * 0.9,
      stock_quantity: Number(initialStock) || 0,
      min_stock_quantity: Number(minStock) || 5,
      max_stock_quantity: Number(maxStock) || 500,
      location_rack: locationRack,
      ncm_code: ncmCode,
      cest_code: cestCode,
      origin,
      cfop,
      icms_rate: Number(icmsRate),
      pis_rate: Number(pisRate),
      cofins_rate: Number(cofinsRate),
      ipi_rate: Number(ipiRate)
    };

    if (editingProduct) {
      store.updateProduct(editingProduct.id, payload);
    } else {
      store.addProduct({
        ...payload,
        initial_stock: Number(initialStock) || 0
      });
    }

    setShowAddModal(false);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm("Tem certeza que deseja remover este produto do catálogo?")) {
      store.deleteProduct(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold block uppercase">Total de Produtos</span>
            <span className="text-2xl font-black text-white font-mono">{totalProducts}</span>
          </div>
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold block uppercase">Itens em Estoque</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">{totalQuantity} un</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Boxes className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold block uppercase">Valor em Custo</span>
            <span className="text-2xl font-black text-cyan-300 font-mono">
              R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-300">
            <Tag className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-white/5 p-4 rounded-2xl">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white">Controle de Estoque & Produtos</h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome ou SKU..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 outline-none focus:border-cyan-500 w-48 sm:w-64"
            />
          </div>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.3)] shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Cadastrar Produto
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-900/60 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-bold border-b border-white/5 text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">SKU / Produto</th>
                <th className="py-3.5 px-4 text-right">Preço Custo</th>
                <th className="py-3.5 px-4 text-right">Preço Venda</th>
                <th className="py-3.5 px-4 text-center">Qtd Atual</th>
                <th className="py-3.5 px-4 text-center">Ajuste de Estoque</th>
                <th className="py-3.5 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                    Nenhum produto cadastrado ou encontrado.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => {
                  const qty = p.stock_quantity || 0;
                  const isLow = qty <= 5;

                  return (
                    <tr key={p.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-xs">{p.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">SKU: {p.sku} • {p.unit_of_measure}</div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                        R$ {p.cost_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-cyan-300">
                        R$ {p.selling_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full font-mono font-bold text-xs ${
                          isLow ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        }`}>
                          {qty} {p.unit_of_measure}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleAdjustStock(p.id, -1)}
                            className="px-2 py-1 bg-slate-800 hover:bg-rose-500/20 hover:text-rose-300 border border-white/10 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1"
                            title="Remover 1 unidade"
                          >
                            <Minus className="w-3 h-3" /> Saída
                          </button>
                          <button
                            onClick={() => handleAdjustStock(p.id, 1)}
                            className="px-2 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1"
                            title="Adicionar 1 unidade"
                          >
                            <Plus className="w-3 h-3" /> Entrada
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all cursor-pointer"
                            title="Editar Produto"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                            title="Remover Produto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Novo/Editar Produto */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-400" />
                {editingProduct ? "Editar Produto no Catálogo" : "Cadastrar Novo Produto"}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveModalTab("general")}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                  activeModalTab === "general"
                    ? "bg-cyan-500 text-slate-950 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                1. Dados Gerais & Preços
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab("stock")}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                  activeModalTab === "stock"
                    ? "bg-cyan-500 text-slate-950 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                2. Logística & Mínimos
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab("fiscal")}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                  activeModalTab === "fiscal"
                    ? "bg-cyan-500 text-slate-950 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                3. Tributação & NCM
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              {activeModalTab === "general" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">SKU / Código Interno *</label>
                      <input
                        type="text"
                        value={sku}
                        onChange={e => setSku(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white font-mono outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">GTIN / EAN Barcode</label>
                      <input
                        type="text"
                        placeholder="7890000000000"
                        value={gtin}
                        onChange={e => setGtin(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white font-mono outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">Unidade de Medida</label>
                      <select
                        value={unit}
                        onChange={e => setUnit(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white outline-none cursor-pointer"
                      >
                        <option value="UN">Unidade (UN)</option>
                        <option value="KG">Quilograma (KG)</option>
                        <option value="LT">Litro (LT)</option>
                        <option value="CX">Caixa (CX)</option>
                        <option value="M">Metro (M)</option>
                        <option value="PAR">Par (PAR)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-slate-400 block mb-1 font-semibold">Nome Descritivo do Produto *</label>
                      <input
                        type="text"
                        placeholder="Ex: Teclado Mecânico USB RGB Gamer"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-cyan-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">Categoria</label>
                      <input
                        type="text"
                        placeholder="Ex: Periféricos"
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">Preço de Custo (R$) *</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={costPrice}
                        onChange={e => setCostPrice(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white font-mono outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">Preço de Venda (R$) *</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={sellingPrice}
                        onChange={e => setSellingPrice(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white font-mono outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">Preço Mínimo Venda (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={minSellingPrice}
                        onChange={e => setMinSellingPrice(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white font-mono outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeModalTab === "stock" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">Quantidade Atual em Estoque</label>
                      <input
                        type="number"
                        value={initialStock}
                        onChange={e => setInitialStock(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white font-mono outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">Estoque Mínimo de Segurança</label>
                      <input
                        type="number"
                        value={minStock}
                        onChange={e => setMinStock(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white font-mono outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">Estoque Máximo Desejado</label>
                      <input
                        type="number"
                        value={maxStock}
                        onChange={e => setMaxStock(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white font-mono outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Localização no Almoxarifado / Prateleira</label>
                    <input
                      type="text"
                      placeholder="Ex: Corredor B - Prateleira A04"
                      value={locationRack}
                      onChange={e => setLocationRack(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white outline-none font-mono"
                    />
                  </div>
                </div>
              )}

              {activeModalTab === "fiscal" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">Código NCM</label>
                      <input
                        type="text"
                        placeholder="8471.50.10"
                        value={ncmCode}
                        onChange={e => setNcmCode(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white font-mono outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">Código CEST</label>
                      <input
                        type="text"
                        placeholder="21.001.00"
                        value={cestCode}
                        onChange={e => setCestCode(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white font-mono outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">CFOP Padrão</label>
                      <input
                        type="text"
                        placeholder="5102"
                        value={cfop}
                        onChange={e => setCfop(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white font-mono outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">Origem da Mercadoria</label>
                      <select
                        value={origin}
                        onChange={e => setOrigin(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white outline-none cursor-pointer font-mono"
                      >
                        <option value="0">0 - Nacional</option>
                        <option value="1">1 - Estrangeira Import. Direta</option>
                        <option value="2">2 - Estrangeira Adquirida Interno</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">ICMS (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="18"
                        value={icmsRate}
                        onChange={e => setIcmsRate(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white font-mono outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">PIS (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="1.65"
                        value={pisRate}
                        onChange={e => setPisRate(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white font-mono outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">COFINS (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="7.60"
                        value={cofinsRate}
                        onChange={e => setCofinsRate(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white font-mono outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">IPI (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0"
                        value={ipiRate}
                        onChange={e => setIpiRate(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white font-mono outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-3 flex items-center justify-between border-t border-white/10">
                <span className="text-[10px] text-slate-500 font-mono">
                  * NCM e alíquotas são preenchidos automaticamente na emissão da NF-e / DANFE
                </span>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl cursor-pointer shadow-lg shadow-cyan-500/20"
                  >
                    {editingProduct ? "Atualizar Produto" : "Salvar Produto"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
