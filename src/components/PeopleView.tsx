import React, { useState, useEffect } from "react";
import { store } from "../services/store";
import { Person } from "../types";
import { Users, Plus, Search, Trash2, Building2, User, X, Truck, Tag, Edit3 } from "lucide-react";

interface PeopleViewProps {
  mode: "customer" | "supplier";
}

export const PeopleView: React.FC<PeopleViewProps> = ({ mode }) => {
  const [, setTick] = useState(0);
  useEffect(() => {
    return store.subscribe(() => setTick(t => t + 1));
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "individual" | "company">("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);

  // Expanded form state
  const [legalName, setLegalName] = useState("");
  const [tradeName, setTradeName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [personType, setPersonType] = useState<"individual" | "company">("company");
  const [personRole, setPersonRole] = useState<"customer" | "supplier" | "both">(
    mode === "supplier" ? "supplier" : "customer"
  );
  const [stateRegistration, setStateRegistration] = useState("");
  const [municipalRegistration, setMunicipalRegistration] = useState("");
  const [taxRegime, setTaxRegime] = useState("simples");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("São Paulo");
  const [state, setState] = useState("SP");
  const [zipCode, setZipCode] = useState("");
  const [ibgeCode, setIbgeCode] = useState("3550308");
  const [creditLimit, setCreditLimit] = useState("10000");
  const [paymentTerms, setPaymentTerms] = useState("30 Dias");
  const [pixKey, setPixKey] = useState("");
  const [notes, setNotes] = useState("");

  const [activeTab, setActiveTab] = useState<"general" | "address" | "financial">("general");

  // Sync default role when mode changes
  useEffect(() => {
    setPersonRole(mode === "supplier" ? "supplier" : "customer");
  }, [mode]);

  const people = store.people || [];

  // Filter people by role
  const roleFilteredPeople = people.filter(p => {
    const role = p.person_role || "customer";
    if (mode === "customer") {
      return role === "customer" || role === "both";
    } else {
      return role === "supplier" || role === "both";
    }
  });

  const filteredPeople = roleFilteredPeople.filter(p => {
    const matchesSearch =
      p.legal_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.trade_name && p.trade_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.tax_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.email && p.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.city && p.city.toLowerCase().includes(searchQuery.toLowerCase()));

    if (filterType === "all") return matchesSearch;
    return matchesSearch && p.person_type === filterType;
  });

  const handleOpenAddModal = () => {
    setEditingPerson(null);
    setLegalName("");
    setTradeName("");
    setTaxId("");
    setPersonType("company");
    setPersonRole(mode === "supplier" ? "supplier" : "customer");
    setStateRegistration("");
    setMunicipalRegistration("");
    setTaxRegime("simples");
    setEmail("");
    setPhone("");
    setContactPerson("");
    setStreet("");
    setNumber("");
    setComplement("");
    setNeighborhood("");
    setCity("São Paulo");
    setState("SP");
    setZipCode("");
    setIbgeCode("3550308");
    setCreditLimit("10000");
    setPaymentTerms("30 Dias");
    setPixKey("");
    setNotes("");
    setActiveTab("general");
    setShowAddModal(true);
  };

  const handleOpenEditModal = (p: Person) => {
    setEditingPerson(p);
    setLegalName(p.legal_name);
    setTradeName(p.trade_name || "");
    setTaxId(p.tax_id);
    setPersonType(p.person_type);
    setPersonRole(p.person_role || "customer");
    setStateRegistration(p.state_registration || "");
    setMunicipalRegistration(p.municipal_registration || "");
    setTaxRegime(p.tax_regime || "simples");
    setEmail(p.email || "");
    setPhone(p.phone || "");
    setContactPerson(p.contact_person || "");
    setStreet(p.street || "");
    setNumber(p.number || "");
    setComplement(p.complement || "");
    setNeighborhood(p.neighborhood || "");
    setCity(p.city || "São Paulo");
    setState(p.state || "SP");
    setZipCode(p.zip_code || "");
    setIbgeCode(p.ibge_code || "3550308");
    setCreditLimit(String(p.credit_limit || 10000));
    setPaymentTerms(p.payment_terms || "30 Dias");
    setPixKey(p.pix_key || "");
    setNotes(p.notes || "");
    setActiveTab("general");
    setShowAddModal(true);
  };

  const handleSavePerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!legalName || !taxId) return;

    const payload = {
      legal_name: legalName,
      trade_name: tradeName || legalName,
      tax_id: taxId,
      person_type: personType,
      person_role: personRole,
      state_registration: stateRegistration,
      municipal_registration: municipalRegistration,
      tax_regime: taxRegime,
      email: email,
      phone: phone,
      contact_person: contactPerson,
      street: street,
      number: number,
      complement: complement,
      neighborhood: neighborhood,
      city: city,
      state: state,
      zip_code: zipCode,
      ibge_code: ibgeCode,
      credit_limit: Number(creditLimit) || 0,
      payment_terms: paymentTerms,
      pix_key: pixKey || taxId,
      notes: notes
    };

    if (editingPerson) {
      store.updatePerson(editingPerson.id, payload);
    } else {
      store.addPerson({
        ...payload,
        role: personRole
      });
    }

    setShowAddModal(false);
  };

  const handleDeletePerson = (id: string) => {
    const term = mode === "customer" ? "cliente" : "fornecedor";
    if (confirm(`Tem certeza que deseja remover este ${term}?`)) {
      store.deletePerson(id);
    }
  };

  const isCustomerMode = mode === "customer";
  const title = isCustomerMode ? "Carteira de Clientes" : "Gestão de Fornecedores";
  const subtitle = isCustomerMode
    ? "Pessoas e Empresas que compram seus produtos ou serviços"
    : "Pessoas e Empresas que fornecem produtos, compras ou serviços";
  const MainIcon = isCustomerMode ? Users : Truck;
  const accentColorClass = isCustomerMode ? "cyan" : "amber";

  return (
    <div className="space-y-6">
      {/* Top Banner KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase block">
              {isCustomerMode ? "Total de Clientes" : "Total de Fornecedores"}
            </span>
            <span className="text-2xl font-black text-white font-mono">{roleFilteredPeople.length}</span>
          </div>
          <div className={`p-3 rounded-xl bg-${accentColorClass}-500/10 text-${accentColorClass}-400`}>
            <MainIcon className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase block">Pessoas Jurídicas (CNPJ)</span>
            <span className="text-2xl font-black text-cyan-300 font-mono">
              {roleFilteredPeople.filter(p => p.person_type === "company").length}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-300">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase block">Pessoas Físicas (CPF)</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">
              {roleFilteredPeople.filter(p => p.person_type === "individual").length}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <User className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-white/5 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl bg-${accentColorClass}-500/10 text-${accentColorClass}-400`}>
            <MainIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">{title}</h2>
            <p className="text-xs text-slate-400">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Type Filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                filterType === "all" ? "bg-cyan-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterType("company")}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                filterType === "company" ? "bg-cyan-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              PJ (CNPJ)
            </button>
            <button
              onClick={() => setFilterType("individual")}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                filterType === "individual" ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              PF (CPF)
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome ou CNPJ/CPF..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 outline-none focus:border-cyan-500 w-44 sm:w-56"
            />
          </div>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.3)] shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> {isCustomerMode ? "Novo Cliente" : "Novo Fornecedor"}
          </button>
        </div>
      </div>

      {/* People Table */}
      <div className="bg-slate-900/60 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-bold border-b border-white/5 text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Razão Social / Nome</th>
                <th className="py-3.5 px-4">Nome Fantasia</th>
                <th className="py-3.5 px-4">CPF / CNPJ</th>
                <th className="py-3.5 px-4">Tipo</th>
                <th className="py-3.5 px-4">Classificação</th>
                <th className="py-3.5 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {filteredPeople.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                    {isCustomerMode ? "Nenhum cliente encontrado." : "Nenhum fornecedor encontrado."}
                  </td>
                </tr>
              ) : (
                filteredPeople.map(p => {
                  const role = p.person_role || "customer";
                  return (
                    <tr key={p.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white flex items-center gap-2">
                          {p.person_type === "company" ? (
                            <Building2 className="w-4 h-4 text-cyan-400 shrink-0" />
                          ) : (
                            <User className="w-4 h-4 text-emerald-400 shrink-0" />
                          )}
                          <span>{p.legal_name}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300">
                        {p.trade_name || "-"}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-cyan-300">
                        {p.tax_id}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          p.person_type === "company"
                            ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        }`}>
                          {p.person_type === "company" ? "PJ" : "PF"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-800 text-slate-300 border border-white/10 flex items-center gap-1 w-max">
                          <Tag className="w-3 h-3 text-cyan-400" />
                          {role === "both"
                            ? "Cliente & Fornecedor"
                            : role === "supplier"
                            ? "Fornecedor"
                            : "Cliente"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all cursor-pointer"
                            title="Editar Cadastro"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePerson(p.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                            title="Remover Cadastro"
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

      {/* Modal: Cadastrar ou Editar Pessoa */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-400" />
                {editingPerson
                  ? `Editar ${isCustomerMode ? "Cliente" : "Fornecedor"}`
                  : `Cadastrar Novo ${isCustomerMode ? "Cliente" : "Fornecedor"}`}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab("general")}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                  activeTab === "general"
                    ? "bg-cyan-500 text-slate-950 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                1. Identificação & Fiscal
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("address")}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                  activeTab === "address"
                    ? "bg-cyan-500 text-slate-950 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                2. Contato & Endereço
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("financial")}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                  activeTab === "financial"
                    ? "bg-cyan-500 text-slate-950 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                3. Comercial & Financeiro
              </button>
            </div>

            <form onSubmit={handleSavePerson} className="space-y-4 text-xs">
              {activeTab === "general" && (
                <div className="space-y-3">
                  {/* Type Selection */}
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Tipo de Pessoa</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPersonType("company")}
                        className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer border transition-all ${
                          personType === "company"
                            ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md"
                            : "bg-slate-950 text-slate-400 border-white/5 hover:text-slate-200"
                        }`}
                      >
                        <Building2 className="w-4 h-4" /> Pessoa Jurídica (PJ)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPersonType("individual")}
                        className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer border transition-all ${
                          personType === "individual"
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md"
                            : "bg-slate-950 text-slate-400 border-white/5 hover:text-slate-200"
                        }`}
                      >
                        <User className="w-4 h-4" /> Pessoa Física (PF)
                      </button>
                    </div>
                  </div>

                  {/* Classificação / Papel */}
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Classificação no Sistema</label>
                    <select
                      value={personRole}
                      onChange={e => setPersonRole(e.target.value as "customer" | "supplier" | "both")}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white outline-none cursor-pointer"
                    >
                      <option value="customer">Apenas Cliente</option>
                      <option value="supplier">Apenas Fornecedor</option>
                      <option value="both">Cliente e Fornecedor (Ambos)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Razão Social / Nome */}
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">
                        {personType === "company" ? "Razão Social *" : "Nome Completo *"}
                      </label>
                      <input
                        type="text"
                        placeholder={personType === "company" ? "Ex: Empresa Tech LTDA" : "Ex: Carlos Silva"}
                        value={legalName}
                        onChange={e => setLegalName(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-cyan-500"
                        required
                      />
                    </div>

                    {/* Nome Fantasia */}
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">Nome Fantasia / Apelido</label>
                      <input
                        type="text"
                        placeholder="Ex: TechBrasil"
                        value={tradeName}
                        onChange={e => setTradeName(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* CPF / CNPJ */}
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">
                        {personType === "company" ? "CNPJ *" : "CPF *"}
                      </label>
                      <input
                        type="text"
                        placeholder={personType === "company" ? "00.000.000/0001-00" : "000.000.000-00"}
                        value={taxId}
                        onChange={e => setTaxId(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white font-mono outline-none focus:border-cyan-500"
                        required
                      />
                    </div>

                    {/* Inscrição Estadual */}
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">Inscrição Estadual (IE)</label>
                      <input
                        type="text"
                        placeholder="Ex: 123.456.789.110 ou ISENTO"
                        value={stateRegistration}
                        onChange={e => setStateRegistration(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white font-mono outline-none"
                      />
                    </div>

                    {/* Inscrição Municipal */}
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">Inscrição Municipal (IM)</label>
                      <input
                        type="text"
                        placeholder="Ex: 98765432"
                        value={municipalRegistration}
                        onChange={e => setMunicipalRegistration(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white font-mono outline-none"
                      />
                    </div>
                  </div>

                  {/* Regime Tributário */}
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Regime Tributário</label>
                    <select
                      value={taxRegime}
                      onChange={e => setTaxRegime(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white outline-none cursor-pointer"
                    >
                      <option value="simples">Simples Nacional</option>
                      <option value="presumed_profit">Lucro Presumido</option>
                      <option value="actual_profit">Lucro Real</option>
                      <option value="mei">Microempreendedor Individual (MEI)</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === "address" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">E-mail Principal/Fiscal</label>
                      <input
                        type="email"
                        placeholder="financeiro@empresa.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">Telefone / WhatsApp</label>
                      <input
                        type="text"
                        placeholder="(11) 98765-4321"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">Contato Principal</label>
                      <input
                        type="text"
                        placeholder="Ex: Roberto (Gerente Compras)"
                        value={contactPerson}
                        onChange={e => setContactPerson(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">CEP</label>
                      <input
                        type="text"
                        placeholder="01001-000"
                        value={zipCode}
                        onChange={e => setZipCode(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white font-mono outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-slate-400 block mb-1 font-semibold">Logradouro / Rua</label>
                      <input
                        type="text"
                        placeholder="Av. Paulista"
                        value={street}
                        onChange={e => setStreet(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">Número</label>
                      <input
                        type="text"
                        placeholder="1000"
                        value={number}
                        onChange={e => setNumber(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">Complemento</label>
                      <input
                        type="text"
                        placeholder="Sala 502"
                        value={complement}
                        onChange={e => setComplement(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">Bairro</label>
                      <input
                        type="text"
                        placeholder="Bela Vista"
                        value={neighborhood}
                        onChange={e => setNeighborhood(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">Cidade / Estado</label>
                      <div className="flex gap-1">
                        <input
                          type="text"
                          placeholder="São Paulo"
                          value={city}
                          onChange={e => setCity(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white outline-none"
                        />
                        <input
                          type="text"
                          placeholder="SP"
                          value={state}
                          onChange={e => setState(e.target.value)}
                          className="w-14 bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white text-center font-mono uppercase outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">Código IBGE Cidade</label>
                      <input
                        type="text"
                        placeholder="3550308"
                        value={ibgeCode}
                        onChange={e => setIbgeCode(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white font-mono outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "financial" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">Limite de Crédito (R$)</label>
                      <input
                        type="number"
                        placeholder="10000,00"
                        value={creditLimit}
                        onChange={e => setCreditLimit(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white font-mono outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">Prazo de Pagamento Padrão</label>
                      <input
                        type="text"
                        placeholder="Ex: 30/60/90 Dias ou À Vista"
                        value={paymentTerms}
                        onChange={e => setPaymentTerms(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">Chave PIX Cadastrada</label>
                      <input
                        type="text"
                        placeholder="CPF/CNPJ, E-mail ou Chave"
                        value={pixKey}
                        onChange={e => setPixKey(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white font-mono outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Observações Internas / Fiscais</label>
                    <textarea
                      rows={3}
                      placeholder="Histórico comercial, particularidades no faturamento, instruções de entrega..."
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="pt-3 flex items-center justify-between border-t border-white/10">
                <span className="text-[10px] text-slate-500 font-mono">
                  * Campos obrigatórios para validação fiscal
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
                    {editingPerson ? "Atualizar Cadastro" : "Salvar Cadastro"}
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
