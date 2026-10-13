// src/components/financeiro/FinanceiroView.tsx
import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  CheckCircle2, 
  Clock, 
  QrCode, 
  X, 
  Search, 
  Filter,
  Layers,
  TrendingUp,
  TrendingDown,
  Wallet,
  Loader2
} from 'lucide-react';
import { usePermissoes } from '../../hooks/usePermissoes';
import { TituloFinanceiro, ConfiguracaoEmpresa } from '../../types/erp';
import { formatarMoeda, formatarCpfCnpj } from '../../utils/cpfCnpjValidator';
import { gerarPayloadPix } from '../../utils/pixGenerator';
import { financeiroService } from '../../services/financeiro.service';
import { getApiErrorMessage } from '../../utils/apiError';
import { useToast } from '../../hooks/useToast';
import { ConfirmModal } from '../ui/ConfirmModal';

interface FinanceiroViewProps {
  empresa: ConfiguracaoEmpresa;
  titulos: TituloFinanceiro[];
  onTitulosChange: () => void;
}

export const FinanceiroView: React.FC<FinanceiroViewProps> = ({
  empresa,
  titulos,
  onTitulosChange,
}) => {
  const { pode } = usePermissoes();
  const toast = useToast();

  const [tipoFiltro, setTipoFiltro] = useState<'TODOS' | 'RECEBER' | 'PAGAR'>('TODOS');
  const [statusFiltro, setStatusFiltro] = useState<'TODOS' | 'PENDENTE' | 'PAGO'>('TODOS');
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(false);

  // 🔥 ESTADO DO MODAL DE CONFIRMAÇÃO
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    id: string | null;
    titulo: string;
    valor: number;
    loading: boolean;
  }>({
    isOpen: false,
    id: null,
    titulo: '',
    valor: 0,
    loading: false,
  });

  // Modal Pix QR Code
  const [pixModalTitulo, setPixModalTitulo] = useState<TituloFinanceiro | null>(null);
  const [pixBrCode, setPixBrCode] = useState<string>('');
  const pixCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // 🔥 COR DO MÓDULO (AMARELO)
  const cor = 'yellow';
  const corBg = 'bg-brand-50';
  const corBorder = 'border-brand-200';
  const corText = 'text-brand-700';
  const corTextDark = 'text-brand-800';
  const corBgButton = 'bg-brand-600 hover:bg-brand-700';
  const corBgBadge = 'bg-brand-100';
  const corFocus = 'focus:ring-brand-500';
  const corIconBg = 'bg-brand-600';

  // Totais
  const totalReceber = titulos
    .filter(t => t.tipo === 'RECEBER' && t.status === 'PENDENTE')
    .reduce((acc, curr) => acc + curr.valorOriginal, 0);

  const totalRecebido = titulos
    .filter(t => t.tipo === 'RECEBER' && t.status === 'PAGO')
    .reduce((acc, curr) => acc + (curr.valorPago || curr.valorOriginal), 0);

  const totalPagar = titulos
    .filter(t => t.tipo === 'PAGAR' && t.status === 'PENDENTE')
    .reduce((acc, curr) => acc + curr.valorOriginal, 0);

  // ============================================================
  // 🔥 LIQUIDAR COM CONFIRMAÇÃO
  // ============================================================

  const openConfirmModal = (id: string, titulo: string, valor: number) => {
    setConfirmModal({
      isOpen: true,
      id,
      titulo,
      valor,
      loading: false,
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleConfirmLiquidacao = async () => {
    const { id, titulo, valor } = confirmModal;
    if (!id) {
      toast.showError('❌ ID do título não informado');
      closeConfirmModal();
      return;
    }

    setConfirmModal(prev => ({ ...prev, loading: true }));

    try {
            
      await financeiroService.baixarTitulo(id);
      
      closeConfirmModal();
      onTitulosChange();
      
      toast.showSuccess(`✅ Título "${titulo}" liquidado com sucesso! Valor: ${formatarMoeda(valor)}`);
      
    } catch (error: unknown) {
      console.error('❌ Erro ao liquidar título:', error);

      const mensagemErro = getApiErrorMessage(error, 'Erro ao liquidar título');
      
      closeConfirmModal();
      toast.showError(`❌ ${mensagemErro}`);
      
    } finally {
      setConfirmModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleGerarPix = (t: TituloFinanceiro) => {
    const brCode = gerarPayloadPix({
      chavePix: empresa.chavePixPadrao || empresa.cnpj,
      nomeRecebedor: empresa.razaoSocial,
      cidadeRecebedor: empresa.endereco.nomeMunicipio,
      valor: t.valorOriginal,
      identificador: t.numeroDocumento.replace(/[^A-Za-z0-9]/g, '').slice(0, 25) || 'SUPERP',
    });

    setPixBrCode(brCode);
    setPixModalTitulo(t);
  };

  useEffect(() => {
    if (pixModalTitulo && pixBrCode && pixCanvasRef.current) {
      QRCode.toCanvas(pixCanvasRef.current, pixBrCode, {
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
    }
  }, [pixModalTitulo, pixBrCode]);

  const titulosFiltrados = titulos.filter(t => {
    if (tipoFiltro !== 'TODOS' && t.tipo !== tipoFiltro) return false;
    if (statusFiltro !== 'TODOS' && t.status !== statusFiltro) return false;
    if (busca.trim()) {
      const q = busca.toLowerCase();
      return (
        t.numeroDocumento.toLowerCase().includes(q) ||
        t.pessoaNome.toLowerCase().includes(q) ||
        t.descricao.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      
      <div className={`${corBg} rounded-xl border ${corBorder} p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}>
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-8 h-8 ${corIconBg} rounded-lg flex items-center justify-center text-white shadow-sm`}>
              <DollarSign className="w-4 h-4" />
            </span>
            <h1 className="text-base font-bold text-ink-900">Financeiro</h1>
            <span className={`${corBgBadge} ${corTextDark} text-[10px] font-bold px-2 py-0.5 rounded-full border ${corBorder}`}>
              {titulos.length} títulos
            </span>
          </div>
          <p className="text-xs text-ink-500 mt-0.5">
            Contas a pagar, a receber e liquidação via Pix.
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs font-semibold text-ink-700">Gestão Financeira</div>
          <div className={`text-[10px] font-medium ${corText}`}>
            {titulos.filter(t => t.status === 'PENDENTE').length} pendentes
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-ink-200 p-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-ink-500 uppercase">A Receber</span>
            <div className="w-6 h-6 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg font-bold text-brand-700 mt-1">{formatarMoeda(totalReceber)}</div>
          <div className="text-[10px] text-ink-400">{titulos.filter(t => t.tipo === 'RECEBER' && t.status === 'PENDENTE').length} títulos pendentes</div>
        </div>

        <div className="bg-white rounded-xl border border-ink-200 p-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-ink-500 uppercase">Recebido</span>
            <div className="w-6 h-6 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg font-bold text-brand-700 mt-1">{formatarMoeda(totalRecebido)}</div>
          <div className="text-[10px] text-ink-400">{titulos.filter(t => t.tipo === 'RECEBER' && t.status === 'PAGO').length} títulos liquidados</div>
        </div>

        <div className="bg-white rounded-xl border border-ink-200 p-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-ink-500 uppercase">A Pagar</span>
            <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowDownRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg font-bold text-rose-700 mt-1">{formatarMoeda(totalPagar)}</div>
          <div className="text-[10px] text-ink-400">{titulos.filter(t => t.tipo === 'PAGAR' && t.status === 'PENDENTE').length} títulos pendentes</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-ink-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por documento, pessoa ou descrição..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 border border-ink-300 rounded-lg text-xs text-ink-900 focus:outline-none focus:ring-2 ${corFocus}`}
            />
          </div>

          <div className="flex flex-wrap items-center gap-1 bg-ink-50 p-1 rounded-lg border border-ink-200 text-xs">
            <button
              onClick={() => setTipoFiltro('TODOS')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer font-medium ${
                tipoFiltro === 'TODOS' 
                  ? 'bg-brand-100 text-brand-800 border border-brand-300 shadow-sm' 
                  : 'text-ink-600 hover:text-ink-900 hover:bg-ink-100'
              }`}
            >
              Todos ({titulos.length})
            </button>
            <button
              onClick={() => setTipoFiltro('RECEBER')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer font-medium ${
                tipoFiltro === 'RECEBER' 
                  ? 'bg-brand-100 text-brand-800 border border-brand-300 shadow-sm' 
                  : 'text-ink-600 hover:text-ink-900 hover:bg-ink-100'
              }`}
            >
              A Receber ({titulos.filter(t => t.tipo === 'RECEBER').length})
            </button>
            <button
              onClick={() => setTipoFiltro('PAGAR')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer font-medium ${
                tipoFiltro === 'PAGAR' 
                  ? 'bg-rose-100 text-rose-800 border border-rose-300 shadow-sm' 
                  : 'text-ink-600 hover:text-ink-900 hover:bg-ink-100'
              }`}
            >
              A Pagar ({titulos.filter(t => t.tipo === 'PAGAR').length})
            </button>
          </div>

          <div className="flex items-center gap-1 bg-ink-50 p-1 rounded-lg border border-ink-200 text-xs">
            <button
              onClick={() => setStatusFiltro('TODOS')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer font-medium ${
                statusFiltro === 'TODOS' 
                  ? 'bg-brand-100 text-brand-800 border border-brand-300 shadow-sm' 
                  : 'text-ink-600 hover:text-ink-900 hover:bg-ink-100'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setStatusFiltro('PENDENTE')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer font-medium ${
                statusFiltro === 'PENDENTE' 
                  ? 'bg-brand-100 text-brand-800 border border-brand-300 shadow-sm' 
                  : 'text-ink-600 hover:text-ink-900 hover:bg-ink-100'
              }`}
            >
              Pendentes
            </button>
            <button
              onClick={() => setStatusFiltro('PAGO')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer font-medium ${
                statusFiltro === 'PAGO' 
                  ? 'bg-brand-100 text-brand-800 border border-brand-300 shadow-sm' 
                  : 'text-ink-600 hover:text-ink-900 hover:bg-ink-100'
              }`}
            >
              Pago
            </button>
          </div>

        </div>
      </div>

      <div className="bg-white rounded-xl border border-ink-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-ink-600">
            <thead className="bg-ink-50 text-ink-700 font-semibold border-b border-ink-200">
              <tr>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Documento</th>
                <th className="py-3 px-4">Pessoa</th>
                <th className="py-3 px-4">Vencimento</th>
                <th className="py-3 px-4 text-right">Valor</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {titulosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-ink-500">
                    <Layers className="w-8 h-8 text-ink-300 mx-auto mb-2" />
                    <p className="font-semibold text-ink-700">Nenhum título encontrado</p>
                    <p className="text-xs text-ink-400">
                      {busca ? 'Tente ajustar os termos da busca' : 'Nenhum título financeiro cadastrado'}
                    </p>
                  </td>
                </tr>
              ) : (
                titulosFiltrados.map((t) => (
                  <tr key={t.id} className="hover:bg-ink-50/80 transition-colors">
                    <td className="py-3 px-4 font-medium">
                      {t.tipo === 'RECEBER' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-brand-100 text-brand-800 border border-brand-200 text-[10px] font-semibold">
                          <ArrowUpRight className="w-2.5 h-2.5 mr-1" />
                          Receber
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-semibold">
                          <ArrowDownRight className="w-2.5 h-2.5 mr-1" />
                          Pagar
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-ink-900">{t.numeroDocumento}</div>
                      <div className="text-[10px] text-ink-400">{t.descricao}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-ink-900">{t.pessoaNome}</div>
                      <div className="text-[10px] text-ink-400 font-mono">{formatarCpfCnpj(t.pessoaDocumento)}</div>
                    </td>
                    <td className="py-3 px-4 text-ink-700">
                      {new Date(t.dataVencimento + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-4 font-bold text-ink-900 text-right">
                      {formatarMoeda(t.valorOriginal)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {t.status === 'PAGO' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-100 text-brand-800 font-medium text-[10px]">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Pago</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-100 text-brand-800 font-medium text-[10px]">
                          <Clock className="w-3 h-3" />
                          <span>Pendente</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {t.tipo === 'RECEBER' && t.status === 'PENDENTE' && (
                          <button
                            onClick={() => handleGerarPix(t)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-800 rounded-lg text-xs font-medium transition-colors cursor-pointer border border-brand-200"
                            title="Cobrança Pix"
                          >
                            <QrCode className="w-3.5 h-3.5 text-brand-700" />
                            <span>Pix</span>
                          </button>
                        )}

                        {t.status === 'PENDENTE' && pode('financeiro.baixar') && (
                          <button
                            onClick={() => openConfirmModal(t.id, t.numeroDocumento, t.valorOriginal)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 ${corBgButton} text-white rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-sm`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Liquidar</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={handleConfirmLiquidacao}
        type="success"
        title="Liquidar Título"
        message={`Confirmar a liquidação do título "${confirmModal.titulo}" no valor de ${formatarMoeda(confirmModal.valor)}?`}
        confirmText="Confirmar Liquidação"
        cancelText="Cancelar"
        loading={confirmModal.loading}
      />

      {pixModalTitulo && (
        <div className="fixed inset-0 z-50 bg-ink-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl space-y-4 text-center">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
              <div className="flex items-center gap-2 text-ink-800 font-bold text-xs">
                <span className={`w-6 h-6 ${corIconBg} rounded-lg flex items-center justify-center text-white shadow-sm`}>
                  <QrCode className="w-3.5 h-3.5" />
                </span>
                <span>Cobrança Pix</span>
              </div>
              <button
                onClick={() => setPixModalTitulo(null)}
                className="p-1 text-ink-400 hover:text-ink-800 rounded-lg cursor-pointer hover:bg-ink-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="text-xs text-ink-500 font-medium">{pixModalTitulo.pessoaNome}</div>
              <div className="text-2xl font-bold text-ink-900 mt-0.5">
                {formatarMoeda(pixModalTitulo.valorOriginal)}
              </div>
              <div className="text-[10px] text-ink-400">Documento: {pixModalTitulo.numeroDocumento}</div>
            </div>

            <div className="flex justify-center p-3 bg-ink-50 rounded-lg border border-ink-200">
              <canvas ref={pixCanvasRef} className="rounded"></canvas>
            </div>

            <div className="space-y-2 text-left text-xs">
              <label className="font-medium text-ink-600 text-[11px] block">Pix Copia e Cola:</label>
              <div className="relative">
                <textarea
                  readOnly
                  rows={2}
                  value={pixBrCode}
                  className="w-full text-[10px] font-mono bg-ink-50 border border-ink-300 rounded-lg p-2 resize-none text-ink-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                ></textarea>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(pixBrCode);
                  toast.showSuccess('✅ Código Pix copiado para a área de transferência!');
                }}
                className="w-full py-2 bg-ink-800 hover:bg-ink-900 text-white rounded-lg font-medium text-xs shadow-sm cursor-pointer transition-colors"
              >
                Copiar Código Pix
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};