// C:\emissornfe\src\components\cadastros\ProdutosView.tsx
// ✅ VERSÃO COMPLETA - COM TODOS OS CAMPOS DO PL_006h

import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  AlertCircle, 
  Loader2, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  X,
  Save,
  Barcode,
  Hash,
  Percent,
  DollarSign,
  Box,
  Layers
} from 'lucide-react';
import { Produto } from '../../types/erp';
import { formatarMoeda } from '../../utils/cpfCnpjValidator';
import { produtosService } from '../../services/produtos.service';
import { useToast } from '../../hooks/useToast';
import { ConfirmModal } from '../ui/ConfirmModal';

interface ProdutosViewProps {
  produtos: Produto[];
  onProdutosChange: () => void;
}

type OrdenacaoCampo = 'codigo' | 'descricao' | 'ncm' | 'unidade' | 'precoVenda' | 'estoqueAtual' | 'categoria';
type OrdenacaoDirecao = 'asc' | 'desc';

export const ProdutosView: React.FC<ProdutosViewProps> = ({ produtos, onProdutosChange }) => {
  const toast = useToast();

  const [busca, setBusca] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editandoProduto, setEditandoProduto] = useState<Produto | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    id: string | null;
    descricao: string;
    loading: boolean;
  }>({
    isOpen: false,
    id: null,
    descricao: '',
    loading: false,
  });

  const [ordenacaoCampo, setOrdenacaoCampo] = useState<OrdenacaoCampo>('descricao');
  const [ordenacaoDirecao, setOrdenacaoDirecao] = useState<OrdenacaoDirecao>('asc');

  // ============================================================
  // CORES
  // ============================================================
  const cor = 'green';
  const corBg = 'bg-green-50';
  const corBorder = 'border-green-200';
  const corText = 'text-green-700';
  const corTextDark = 'text-green-800';
  const corBgButton = 'bg-green-600 hover:bg-green-700';
  const corBgBadge = 'bg-green-100';
  const corFocus = 'focus:ring-green-500';
  const corIconBg = 'bg-green-600';

  // ============================================================
  // FORM STATE (TODOS OS CAMPOS DO PL_006h)
  // ============================================================
  const [codigo, setCodigo] = useState('');
  const [codigoBarrasEAN, setCodigoBarrasEAN] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('GERAL');
  const [unidade, setUnidade] = useState('UN');
  const [ncm, setNcm] = useState('84714100');
  const [cest, setCest] = useState('');
  const [cfop, setCfop] = useState('5102');
  const [origem, setOrigem] = useState(0);
  const [precoCusto, setPrecoCusto] = useState<number>(0);
  const [precoVenda, setPrecoVenda] = useState<number>(0);
  const [estoqueAtual, setEstoqueAtual] = useState<number>(10);
  const [estoqueMinimo, setEstoqueMinimo] = useState<number>(2);

  // ✅ NOVOS CAMPOS: ALÍQUOTAS
  const [aliquotaICMS, setAliquotaICMS] = useState<number>(18.0);
  const [aliquotaPIS, setAliquotaPIS] = useState<number>(1.65);
  const [aliquotaCOFINS, setAliquotaCOFINS] = useState<number>(7.60);
  const [aliquotaIPI, setAliquotaIPI] = useState<number>(0);
  const [aliquotaIBS, setAliquotaIBS] = useState<number>(0.10);
  const [aliquotaCBS, setAliquotaCBS] = useState<number>(0.90);

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleOpenNovo = () => {
    setEditandoProduto(null);
    setErro(null);
    setCodigo(`SUP-PROD-${String(produtos.length + 1).padStart(4, '0')}`);
    setCodigoBarrasEAN('');
    setDescricao('');
    setCategoria('GERAL');
    setUnidade('UN');
    setNcm('84714100');
    setCest('');
    setCfop('5102');
    setOrigem(0);
    setPrecoCusto(0);
    setPrecoVenda(0);
    setEstoqueAtual(10);
    setEstoqueMinimo(2);
    setAliquotaICMS(18.0);
    setAliquotaPIS(1.65);
    setAliquotaCOFINS(7.60);
    setAliquotaIPI(0);
    setAliquotaIBS(0.10);
    setAliquotaCBS(0.90);
    setModalOpen(true);
  };

  const handleOpenEdit = (p: Produto) => {
    setEditandoProduto(p);
    setErro(null);
    setCodigo(p.codigo);
    setCodigoBarrasEAN(p.codigoBarrasEAN || '');
    setDescricao(p.descricao);
    setCategoria(p.categoria || 'GERAL');
    setUnidade(p.unidade);
    setNcm(p.ncm);
    setCest(p.cest || '');
    setCfop(p.cfopPadrao);
    setOrigem(p.origem || 0);
    setPrecoCusto(p.precoCusto);
    setPrecoVenda(p.precoVenda);
    setEstoqueAtual(p.estoqueAtual);
    setEstoqueMinimo(p.estoqueMinimo);
    setAliquotaICMS(p.aliquotaICMS || 18.0);
    setAliquotaPIS(p.aliquotaPIS || 1.65);
    setAliquotaCOFINS(p.aliquotaCOFINS || 7.60);
    setAliquotaIPI(p.aliquotaIPI || 0);
    setAliquotaIBS(p.aliquotaIBS || 0.10);
    setAliquotaCBS(p.aliquotaCBS || 0.90);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    // ✅ VALIDAÇÕES PL_006h
    if (!descricao.trim()) {
      toast.showWarning('⚠️ A descrição do produto é obrigatória.');
      return;
    }
    if (precoVenda <= 0) {
      toast.showWarning('⚠️ O preço de venda deve ser maior que zero.');
      return;
    }

    // ✅ VALIDA NCM (8 dígitos)
    const ncmLimpo = ncm.replace(/\D/g, '');
    if (ncmLimpo.length !== 8) {
      toast.showWarning('⚠️ O NCM deve ter 8 dígitos.');
      return;
    }

    // ✅ VALIDA CEST (7 dígitos - opcional)
    const cestLimpo = cest.replace(/\D/g, '');
    if (cest && cestLimpo.length !== 7) {
      toast.showWarning('⚠️ O CEST deve ter 7 dígitos.');
      return;
    }

    // ✅ VALIDA CFOP (4 dígitos)
    if (!/^[0-9]{4}$/.test(cfop)) {
      toast.showWarning('⚠️ O CFOP deve ter 4 dígitos.');
      return;
    }

    // ✅ VALIDA GTIN (8, 12, 13 ou 14 dígitos)
    const eanLimpo = codigoBarrasEAN.replace(/\D/g, '');
    if (eanLimpo && ![8, 12, 13, 14].includes(eanLimpo.length)) {
      toast.showWarning('⚠️ O código de barras (EAN/GTIN) deve ter 8, 12, 13 ou 14 dígitos.');
      return;
    }

    setCarregando(true);

    try {
      const dadosProduto = {
        codigo,
        codigoBarrasEAN: eanLimpo || undefined,
        descricao,
        categoria: categoria || 'GERAL',
        unidade,
        ncm: ncmLimpo,
        cest: cestLimpo || undefined,
        cfopPadrao: cfop,
        origem,
        precoCusto,
        precoVenda,
        estoqueAtual,
        estoqueMinimo,
        aliquotaICMS,
        aliquotaPIS,
        aliquotaCOFINS,
        aliquotaIPI,
        aliquotaIBS,
        aliquotaCBS,
        ativo: true,
      };

      if (editandoProduto) {
        await produtosService.atualizar(editandoProduto.id, dadosProduto);
        toast.showSuccess(`✅ Produto "${descricao}" atualizado com sucesso!`);
      } else {
        await produtosService.criar(dadosProduto);
        toast.showSuccess(`✅ Produto "${descricao}" criado com sucesso!`);
      }

      setModalOpen(false);
      onProdutosChange();

    } catch (error: any) {
      console.error('Erro ao salvar produto:', error);
      const mensagem = error.response?.data?.erro || error.message || 'Erro ao salvar produto';
      setErro(mensagem);
      toast.showError(`❌ ${mensagem}`);
    } finally {
      setCarregando(false);
    }
  };

  const openConfirmModal = (id: string, descricao: string) => {
    setConfirmModal({
      isOpen: true,
      id,
      descricao,
      loading: false,
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleConfirmExclusao = async () => {
    const { id, descricao } = confirmModal;
    if (!id) {
      toast.showError('❌ ID do produto não informado');
      closeConfirmModal();
      return;
    }

    setConfirmModal(prev => ({ ...prev, loading: true }));

    try {
      await produtosService.excluir(id);
      closeConfirmModal();
      onProdutosChange();
      toast.showSuccess(`✅ Produto "${descricao}" excluído com sucesso!`);
    } catch (error: any) {
      console.error('❌ Erro ao excluir produto:', error);
      const mensagemErro = error.response?.data?.erro || error.message || 'Erro ao excluir produto';
      closeConfirmModal();
      toast.showError(`❌ ${mensagemErro}`);
      setErro(mensagemErro);
    } finally {
      setConfirmModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleOrdenar = (campo: OrdenacaoCampo) => {
    if (ordenacaoCampo === campo) {
      setOrdenacaoDirecao(ordenacaoDirecao === 'asc' ? 'desc' : 'asc');
    } else {
      setOrdenacaoCampo(campo);
      setOrdenacaoDirecao('asc');
    }
  };

  const produtosOrdenados = useMemo(() => {
    const filtrados = produtos.filter(p =>
      p.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      p.codigo.toLowerCase().includes(busca.toLowerCase()) ||
      p.ncm.includes(busca)
    );

    return [...filtrados].sort((a, b) => {
      let valorA: any = a[ordenacaoCampo];
      let valorB: any = b[ordenacaoCampo];

      if (typeof valorA === 'number' && typeof valorB === 'number') {
        return ordenacaoDirecao === 'asc' ? valorA - valorB : valorB - valorA;
      }

      if (typeof valorA === 'string' && typeof valorB === 'string') {
        return ordenacaoDirecao === 'asc'
          ? valorA.localeCompare(valorB)
          : valorB.localeCompare(valorA);
      }

      return 0;
    });
  }, [produtos, busca, ordenacaoCampo, ordenacaoDirecao]);

  const IconeOrdenacao = ({ campo }: { campo: OrdenacaoCampo }) => {
    if (ordenacaoCampo !== campo) {
      return <ArrowUpDown className="w-3 h-3 text-slate-400 ml-1" />;
    }
    return ordenacaoDirecao === 'asc'
      ? <ArrowUp className="w-3 h-3 text-green-600 ml-1" />
      : <ArrowDown className="w-3 h-3 text-green-600 ml-1" />;
  };

  const thClass = "py-2.5 px-3 text-left text-xs font-semibold text-slate-700 cursor-pointer hover:text-green-600 transition-colors select-none";

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      
      {/* HEADER */}
      <div className={`${corBg} rounded-xl border ${corBorder} p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}>
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-8 h-8 ${corIconBg} rounded-lg flex items-center justify-center text-white shadow-sm`}>
              <Package className="w-4 h-4" />
            </span>
            <h1 className="text-base font-bold text-slate-900">Produtos e Estoque</h1>
            <span className={`${corBgBadge} ${corTextDark} text-[10px] font-bold px-2 py-0.5 rounded-full border ${corBorder}`}>
              {produtos.length} produtos
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Catálogo com dados tributários (NCM, CFOP, CEST, alíquotas) e saldos em estoque.
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs font-semibold text-slate-700">Cadastro de Produtos</div>
          <div className={`text-[10px] font-medium ${corText}`}>{produtos.length} produtos cadastrados</div>
        </div>
      </div>

      {/* Busca e Botão */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 flex items-center bg-white border border-slate-200 rounded-lg p-1.5 shadow-sm">
          <Search className="w-4 h-4 text-slate-400 ml-1.5" />
          <input
            type="text"
            placeholder="Buscar por descrição, código, NCM ou CEST..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full text-xs px-2 py-1 focus:outline-none"
          />
          {busca && (
            <button onClick={() => setBusca('')} className="text-xs text-slate-400 hover:text-slate-600 px-2">✕</button>
          )}
        </div>
        <button
          onClick={handleOpenNovo}
          disabled={carregando}
          className={`${corBgButton} text-white font-medium text-xs px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Novo Produto</span>
        </button>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className={thClass} onClick={() => handleOrdenar('codigo')}>
                  <div className="flex items-center">Código <IconeOrdenacao campo="codigo" /></div>
                </th>
                <th className={thClass} onClick={() => handleOrdenar('descricao')}>
                  <div className="flex items-center">Descrição <IconeOrdenacao campo="descricao" /></div>
                </th>
                <th className={thClass} onClick={() => handleOrdenar('categoria')}>
                  <div className="flex items-center">Categoria <IconeOrdenacao campo="categoria" /></div>
                </th>
                <th className={thClass} onClick={() => handleOrdenar('ncm')}>
                  <div className="flex items-center">NCM / CFOP <IconeOrdenacao campo="ncm" /></div>
                </th>
                <th className={thClass} onClick={() => handleOrdenar('unidade')}>
                  <div className="flex items-center">UN <IconeOrdenacao campo="unidade" /></div>
                </th>
                <th className={`${thClass} text-right`} onClick={() => handleOrdenar('precoVenda')}>
                  <div className="flex items-center justify-end">Preço Venda <IconeOrdenacao campo="precoVenda" /></div>
                </th>
                <th className={`${thClass} text-right`} onClick={() => handleOrdenar('estoqueAtual')}>
                  <div className="flex items-center justify-end">Estoque <IconeOrdenacao campo="estoqueAtual" /></div>
                </th>
                <th className="py-2.5 px-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {produtosOrdenados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">Nenhum produto encontrado</p>
                    <p className="text-xs text-slate-400">
                      {busca ? 'Tente ajustar os termos da busca' : 'Clique em "Novo Produto" para começar'}
                    </p>
                  </td>
                </tr>
              ) : (
                produtosOrdenados.map((p) => {
                  const isCritico = p.estoqueAtual <= p.estoqueMinimo;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">{p.codigo}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">
                        {p.descricao}
                        {p.codigoBarrasEAN && (
                          <span className="ml-1 text-[10px] text-slate-400 font-mono">
                            (EAN: {p.codigoBarrasEAN})
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-medium">
                          {p.categoria || 'GERAL'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                        NCM: {p.ncm} {p.cest ? `| CEST: ${p.cest}` : ''}
                        <br />
                        CFOP: {p.cfopPadrao}
                      </td>
                      <td className="py-2.5 px-3">{p.unidade}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 text-right">{formatarMoeda(p.precoVenda)}</td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          isCritico ? 'bg-rose-100 text-rose-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {p.estoqueAtual} {p.unidade}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors cursor-pointer"
                            title="Editar"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openConfirmModal(p.id, p.descricao)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* MODAL DE CONFIRMAÇÃO */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={handleConfirmExclusao}
        type="danger"
        title="Excluir Produto"
        message={`Tem certeza que deseja excluir permanentemente o produto "${confirmModal.descricao}"?\n\nEsta ação não pode ser desfeita.`}
        confirmText="Excluir Permanentemente"
        cancelText="Cancelar"
        loading={confirmModal.loading}
      />

      {/* ============================================================
          MODAL DE CADASTRO/EDIÇÃO (COMPLETO)
      ============================================================ */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl space-y-4 max-h-[95vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <span className={`w-7 h-7 ${corIconBg} rounded-lg flex items-center justify-center text-white shadow-sm`}>
                  <Package className="w-3.5 h-3.5" />
                </span>
                <h2 className="text-sm font-bold text-slate-900">
                  {editandoProduto ? 'Editar Produto' : 'Cadastrar Novo Produto'}
                </h2>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {erro && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{erro}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              {/* ============================================================
                  SEÇÃO 1: DADOS BÁSICOS
              ============================================================ */}
              <div className="grid grid-cols-4 gap-2">
                <div className="col-span-2">
                  <label className="block font-medium text-slate-600 mb-1">Código *</label>
                  <input
                    type="text"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-medium text-slate-600 mb-1 flex items-center gap-1">
                    <Barcode className="w-3 h-3" />
                    EAN / GTIN
                  </label>
                  <input
                    type="text"
                    value={codigoBarrasEAN}
                    onChange={(e) => setCodigoBarrasEAN(e.target.value.replace(/\D/g, ''))}
                    className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus} font-mono`}
                    placeholder="8,12,13 ou 14 dígitos"
                    maxLength={14}
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">Descrição *</label>
                <input
                  type="text"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Categoria *</label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus} bg-white`}
                  >
                    <option value="GERAL">GERAL</option>
                    <option value="ELETRONICOS">ELETRÔNICOS</option>
                    <option value="INFORMATICA">INFORMÁTICA</option>
                    <option value="VESTUARIO">VESTUÁRIO</option>
                    <option value="ALIMENTOS">ALIMENTOS</option>
                    <option value="BEBIDAS">BEBIDAS</option>
                    <option value="LIMPEZA">LIMPEZA</option>
                    <option value="OUTROS">OUTROS</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Unidade *</label>
                  <input
                    type="text"
                    value={unidade}
                    onChange={(e) => setUnidade(e.target.value)}
                    className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                    placeholder="UN, KG, CX..."
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Origem</label>
                  <select
                    value={origem}
                    onChange={(e) => setOrigem(parseInt(e.target.value))}
                    className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus} bg-white`}
                  >
                    <option value={0}>0 - Nacional</option>
                    <option value={1}>1 - Estrangeira</option>
                    <option value={2}>2 - Estrangeira (mercado interno)</option>
                  </select>
                </div>
              </div>

              {/* ============================================================
                  SEÇÃO 2: TRIBUTAÇÃO (NCM, CEST, CFOP)
              ============================================================ */}
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <Hash className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-semibold text-slate-700 text-[10px] uppercase tracking-wider">Tributação</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">NCM *</label>
                    <input
                      type="text"
                      value={ncm}
                      onChange={(e) => setNcm(e.target.value.replace(/\D/g, ''))}
                      maxLength={8}
                      className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus} font-mono`}
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">CEST</label>
                    <input
                      type="text"
                      value={cest}
                      onChange={(e) => setCest(e.target.value.replace(/\D/g, ''))}
                      maxLength={7}
                      className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus} font-mono`}
                      placeholder="7 dígitos"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">CFOP *</label>
                    <input
                      type="text"
                      value={cfop}
                      onChange={(e) => setCfop(e.target.value.replace(/\D/g, ''))}
                      maxLength={4}
                      className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus} font-mono`}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* ============================================================
                  SEÇÃO 3: ALÍQUOTAS (PL_006h)
              ============================================================ */}
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <Percent className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-semibold text-slate-700 text-[10px] uppercase tracking-wider">Alíquotas (PL_006h)</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">ICMS (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={aliquotaICMS}
                      onChange={(e) => setAliquotaICMS(parseFloat(e.target.value) || 0)}
                      className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">PIS (%)</label>
                    <input
                      type="number"
                      step="0.0001"
                      min="0"
                      max="100"
                      value={aliquotaPIS}
                      onChange={(e) => setAliquotaPIS(parseFloat(e.target.value) || 0)}
                      className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">COFINS (%)</label>
                    <input
                      type="number"
                      step="0.0001"
                      min="0"
                      max="100"
                      value={aliquotaCOFINS}
                      onChange={(e) => setAliquotaCOFINS(parseFloat(e.target.value) || 0)}
                      className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">IPI (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={aliquotaIPI}
                      onChange={(e) => setAliquotaIPI(parseFloat(e.target.value) || 0)}
                      className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">IBS (%) <span className="text-[10px] text-slate-400">(Reforma 2026)</span></label>
                    <input
                      type="number"
                      step="0.0001"
                      min="0"
                      max="100"
                      value={aliquotaIBS}
                      onChange={(e) => setAliquotaIBS(parseFloat(e.target.value) || 0)}
                      className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">CBS (%) <span className="text-[10px] text-slate-400">(Reforma 2026)</span></label>
                    <input
                      type="number"
                      step="0.0001"
                      min="0"
                      max="100"
                      value={aliquotaCBS}
                      onChange={(e) => setAliquotaCBS(parseFloat(e.target.value) || 0)}
                      className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                    />
                  </div>
                </div>
              </div>

              {/* ============================================================
                  SEÇÃO 4: FINANCEIRO E ESTOQUE
              ============================================================ */}
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-semibold text-slate-700 text-[10px] uppercase tracking-wider">Financeiro e Estoque</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Preço Custo (R$)</label>
                    <input
                      type="number"
                      step="0.0001"
                      min="0"
                      value={precoCusto || ''}
                      onChange={(e) => setPrecoCusto(parseFloat(e.target.value) || 0)}
                      className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Preço Venda (R$) *</label>
                    <input
                      type="number"
                      step="0.0001"
                      min="0.0001"
                      value={precoVenda || ''}
                      onChange={(e) => setPrecoVenda(parseFloat(e.target.value) || 0)}
                      className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus} font-bold text-slate-900`}
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Estoque Atual</label>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={estoqueAtual || ''}
                      onChange={(e) => setEstoqueAtual(parseFloat(e.target.value) || 0)}
                      className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Estoque Mínimo</label>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={estoqueMinimo || ''}
                      onChange={(e) => setEstoqueMinimo(parseFloat(e.target.value) || 0)}
                      className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                    />
                  </div>
                </div>
              </div>

              {/* ============================================================
                  BOTÕES
              ============================================================ */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium cursor-pointer transition-colors"
                  disabled={carregando}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={carregando}
                  className={`px-4 py-2 rounded-lg ${corBgButton} text-white font-medium shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2 transition-colors`}
                >
                  {carregando ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Salvar</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};