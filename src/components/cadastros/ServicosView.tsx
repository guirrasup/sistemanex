// C:\emissornfe\src\components\cadastros\ServicosView.tsx
// ✅ VERSÃO COMPLETA - COM TOASTS E MODAL DE CONFIRMAÇÃO

import React, { useState, useMemo } from 'react';
import { 
  FileText, 
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
  Save
} from 'lucide-react';
import { ServicoCatalogo } from '../../types/erp';
import { formatarMoeda } from '../../utils/cpfCnpjValidator';
import { servicosService } from '../../services/servicos.service';
import { useToast } from '../../hooks/useToast';
import { ConfirmModal } from '../ui/ConfirmModal';

interface ServicosViewProps {
  servicos: ServicoCatalogo[];
  onServicosChange: () => void;
}

type OrdenacaoCampo = 'codigoInterno' | 'descricao' | 'codigoTributacaoNacional' | 'codigoNBS' | 'aliquotaISS' | 'valorUnitario';
type OrdenacaoDirecao = 'asc' | 'desc';

export const ServicosView: React.FC<ServicosViewProps> = ({ servicos, onServicosChange }) => {
  const toast = useToast();

  const [busca, setBusca] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<ServicoCatalogo | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // 🔥 ESTADO DO MODAL DE CONFIRMAÇÃO
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

  // 🔥 ESTADO DE ORDENAÇÃO
  const [ordenacaoCampo, setOrdenacaoCampo] = useState<OrdenacaoCampo>('descricao');
  const [ordenacaoDirecao, setOrdenacaoDirecao] = useState<OrdenacaoDirecao>('asc');

  // 🔥 COR DO MÓDULO (ROSA)
  const cor = 'pink';
  const corBg = 'bg-pink-50';
  const corBorder = 'border-pink-200';
  const corText = 'text-pink-700';
  const corTextDark = 'text-pink-800';
  const corBgButton = 'bg-pink-600 hover:bg-pink-700';
  const corBgBadge = 'bg-pink-100';
  const corFocus = 'focus:ring-pink-500';
  const corIconBg = 'bg-pink-600';

  // Form State
  const [codigoInterno, setCodigoInterno] = useState('');
  const [descricao, setDescricao] = useState('');
  const [codigoTributacaoNacional, setCodigoTributacaoNacional] = useState('010701');
  const [codigoTributacaoMunicipal, setCodigoTributacaoMunicipal] = useState('0107');
  const [codigoNBS, setCodigoNBS] = useState('1.1403.21.10');
  const [valorUnitario, setValorUnitario] = useState<number>(1000);
  const [aliquotaISS, setAliquotaISS] = useState<number>(5.0);
  const [retencaoISSPadrao, setRetencaoISSPadrao] = useState<boolean>(false);

  const handleOpenNovo = () => {
    setEditando(null);
    setErro(null);
    setCodigoInterno(`SUP-SRV-0${servicos.length + 1}`);
    setDescricao('');
    setCodigoTributacaoNacional('010701');
    setCodigoTributacaoMunicipal('0107');
    setCodigoNBS('1.1403.21.10');
    setValorUnitario(1500);
    setAliquotaISS(5.0);
    setRetencaoISSPadrao(false);
    setModalOpen(true);
  };

  const handleOpenEdit = (s: ServicoCatalogo) => {
    setEditando(s);
    setErro(null);
    setCodigoInterno(s.codigoInterno);
    setDescricao(s.descricao);
    setCodigoTributacaoNacional(s.codigoTributacaoNacional);
    setCodigoTributacaoMunicipal(s.codigoTributacaoMunicipal);
    setCodigoNBS(s.codigoNBS);
    setValorUnitario(s.valorUnitario);
    setAliquotaISS(s.aliquotaISS);
    setRetencaoISSPadrao(s.retencaoISSPadrao);
    setModalOpen(true);
  };

  // ============================================================
  // 🔥 SALVAR COM TOAST
  // ============================================================

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (!descricao.trim()) {
      toast.showWarning('⚠️ A descrição do serviço é obrigatória.');
      return;
    }
    if (valorUnitario <= 0) {
      toast.showWarning('⚠️ O valor unitário deve ser maior que zero.');
      return;
    }

    setCarregando(true);

    try {
      const dadosServico = {
        codigoInterno,
        descricao,
        codigoTributacaoNacional,
        codigoTributacaoMunicipal,
        codigoNBS,
        valorUnitario,
        aliquotaISS,
        retencaoISSPadrao,
        aliquotaPIS: 0.65,
        aliquotaCOFINS: 3.0,
        aliquotaIRRF: 1.5,
        aliquotaCSLL: 1.0,
        aliquotaINSS: 0,
        aliquotaIBS: 0.10,
        aliquotaCBS: 0.90,
        ativo: true,
      };

      if (editando) {
        await servicosService.atualizar(editando.id, dadosServico);
        toast.showSuccess(`✅ Serviço "${descricao}" atualizado com sucesso!`);
      } else {
        await servicosService.criar(dadosServico);
        toast.showSuccess(`✅ Serviço "${descricao}" criado com sucesso!`);
      }

      setModalOpen(false);
      onServicosChange();

    } catch (error: any) {
      console.error('Erro ao salvar serviço:', error);
      const mensagem = error.response?.data?.erro || error.message || 'Erro ao salvar serviço';
      setErro(mensagem);
      toast.showError(`❌ ${mensagem}`);
    } finally {
      setCarregando(false);
    }
  };

  // ============================================================
  // 🔥 EXCLUIR COM MODAL DE CONFIRMAÇÃO
  // ============================================================

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
      toast.showError('❌ ID do serviço não informado');
      closeConfirmModal();
      return;
    }

    setConfirmModal(prev => ({ ...prev, loading: true }));

    try {
      console.log(`🗑️ Excluindo serviço: ${id} - ${descricao}`);
      
      await servicosService.excluir(id);
      
      closeConfirmModal();
      onServicosChange();
      
      toast.showSuccess(`✅ Serviço "${descricao}" excluído com sucesso!`);
      
    } catch (error: any) {
      console.error('❌ Erro ao excluir serviço:', error);
      
      const mensagemErro = error.response?.data?.erro || error.message || 'Erro ao excluir serviço';
      
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

  const servicosOrdenados = useMemo(() => {
    const filtrados = servicos.filter(s =>
      s.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      s.codigoInterno.toLowerCase().includes(busca.toLowerCase()) ||
      s.codigoTributacaoNacional.includes(busca)
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
  }, [servicos, busca, ordenacaoCampo, ordenacaoDirecao]);

  const IconeOrdenacao = ({ campo }: { campo: OrdenacaoCampo }) => {
    if (ordenacaoCampo !== campo) {
      return <ArrowUpDown className="w-3 h-3 text-slate-400 ml-1" />;
    }
    return ordenacaoDirecao === 'asc'
      ? <ArrowUp className="w-3 h-3 text-pink-600 ml-1" />
      : <ArrowDown className="w-3 h-3 text-pink-600 ml-1" />;
  };

  const thClass = "py-2.5 px-3 text-left text-xs font-semibold text-slate-700 cursor-pointer hover:text-pink-600 transition-colors select-none";

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      
      {/* HEADER */}
      <div className={`${corBg} rounded-xl border ${corBorder} p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}>
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-8 h-8 ${corIconBg} rounded-lg flex items-center justify-center text-white shadow-sm`}>
              <FileText className="w-4 h-4" />
            </span>
            <h1 className="text-base font-bold text-slate-900">Serviços</h1>
            <span className={`${corBgBadge} ${corTextDark} text-[10px] font-bold px-2 py-0.5 rounded-full border ${corBorder}`}>
              {servicos.length} serviços
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Catálogo de serviços municipais (LC 116/03, NBS e ISS).
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs font-semibold text-slate-700">Cadastro de Serviços</div>
          <div className={`text-[10px] font-medium ${corText}`}>{servicos.length} serviços cadastrados</div>
        </div>
      </div>

      {/* Busca e Botão */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 flex items-center bg-white border border-slate-200 rounded-lg p-1.5 shadow-sm">
          <Search className="w-4 h-4 text-slate-400 ml-1.5" />
          <input
            type="text"
            placeholder="Buscar serviço por descrição, código ou item LC 116..."
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
          <span>Novo Serviço</span>
        </button>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className={thClass} onClick={() => handleOrdenar('codigoInterno')}>
                  <div className="flex items-center">Código <IconeOrdenacao campo="codigoInterno" /></div>
                </th>
                <th className={thClass} onClick={() => handleOrdenar('descricao')}>
                  <div className="flex items-center">Descrição <IconeOrdenacao campo="descricao" /></div>
                </th>
                <th className={thClass} onClick={() => handleOrdenar('codigoTributacaoNacional')}>
                  <div className="flex items-center">LC 116 <IconeOrdenacao campo="codigoTributacaoNacional" /></div>
                </th>
                <th className={thClass} onClick={() => handleOrdenar('codigoNBS')}>
                  <div className="flex items-center">NBS <IconeOrdenacao campo="codigoNBS" /></div>
                </th>
                <th className={thClass} onClick={() => handleOrdenar('aliquotaISS')}>
                  <div className="flex items-center">ISS <IconeOrdenacao campo="aliquotaISS" /></div>
                </th>
                <th className={`${thClass} text-right`} onClick={() => handleOrdenar('valorUnitario')}>
                  <div className="flex items-center justify-end">Valor <IconeOrdenacao campo="valorUnitario" /></div>
                </th>
                <th className="py-2.5 px-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {servicosOrdenados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">Nenhum serviço encontrado</p>
                    <p className="text-xs text-slate-400">
                      {busca ? 'Tente ajustar os termos da busca' : 'Clique em "Novo Serviço" para começar'}
                    </p>
                  </td>
                </tr>
              ) : (
                servicosOrdenados.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">{s.codigoInterno}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">{s.descricao}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{s.codigoTributacaoNacional}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{s.codigoNBS}</td>
                    <td className="py-2.5 px-3 font-semibold text-pink-700">{Number(s.aliquotaISS).toFixed(2)}%</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900 text-right">{formatarMoeda(s.valorUnitario)}</td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="p-1.5 text-slate-500 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openConfirmModal(s.id, s.descricao)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={handleConfirmExclusao}
        type="danger"
        title="Excluir Serviço"
        message={`Tem certeza que deseja excluir permanentemente o serviço "${confirmModal.descricao}"?\n\nEsta ação não pode ser desfeita.`}
        confirmText="Excluir Permanentemente"
        cancelText="Cancelar"
        loading={confirmModal.loading}
      />

      {/* MODAL DE CADASTRO/EDIÇÃO */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className={`w-7 h-7 ${corIconBg} rounded-lg flex items-center justify-center text-white shadow-sm`}>
                  <FileText className="w-3.5 h-3.5" />
                </span>
                <h2 className="text-sm font-bold text-slate-900">
                  {editando ? 'Editar Serviço' : 'Cadastrar Novo Serviço'}
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
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Cód. Interno</label>
                  <input
                    type="text"
                    value={codigoInterno}
                    onChange={(e) => setCodigoInterno(e.target.value)}
                    className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-medium text-slate-600 mb-1">Descrição *</label>
                  <input
                    type="text"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Item LC 116</label>
                  <input
                    type="text"
                    value={codigoTributacaoNacional}
                    onChange={(e) => setCodigoTributacaoNacional(e.target.value)}
                    className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus} font-mono`}
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Cód. Municipal</label>
                  <input
                    type="text"
                    value={codigoTributacaoMunicipal}
                    onChange={(e) => setCodigoTributacaoMunicipal(e.target.value)}
                    className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus} font-mono`}
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">NBS</label>
                  <input
                    type="text"
                    value={codigoNBS}
                    onChange={(e) => setCodigoNBS(e.target.value)}
                    className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus} font-mono`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Valor Padrão (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={valorUnitario || ''}
                    onChange={(e) => setValorUnitario(parseFloat(e.target.value) || 0)}
                    className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus} font-bold text-slate-900`}
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Alíquota ISS (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="2"
                    max="5"
                    value={aliquotaISS || ''}
                    onChange={(e) => setAliquotaISS(parseFloat(e.target.value) || 0)}
                    className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus} font-bold text-pink-700`}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={retencaoISSPadrao}
                    onChange={(e) => setRetencaoISSPadrao(e.target.checked)}
                    className={`rounded ${corFocus} cursor-pointer`}
                  />
                  <span>Retenção ISS padrão</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
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