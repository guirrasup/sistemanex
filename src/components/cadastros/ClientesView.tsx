// C:\emissornfe\src\components\cadastros\ClientesView.tsx
// ✅ VERSÃO COMPLETA - COM TOASTS E MODAL DE CONFIRMAÇÃO

import React, { useState, useMemo } from 'react';
import { 
  Users, 
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
import { ClienteFornecedor } from '../../types/erp';
import { formatarCpfCnpj, validarCpfOuCnpj } from '../../utils/cpfCnpjValidator';
import { clientesService } from '../../services/clientes.service';
import { useToast } from '../../hooks/useToast';
import { ConfirmModal } from '../ui/ConfirmModal';

interface ClientesViewProps {
  clientes: ClienteFornecedor[];
  onClientesChange: () => void;
}

type OrdenacaoCampo = 'tipo' | 'razaoSocial' | 'nomeFantasia' | 'documento' | 'email' | 'endereco.nomeMunicipio' | 'endereco.uf';
type OrdenacaoDirecao = 'asc' | 'desc';

export const ClientesView: React.FC<ClientesViewProps> = ({ clientes, onClientesChange }) => {
  const toast = useToast();

  const [busca, setBusca] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editandoCliente, setEditandoCliente] = useState<ClienteFornecedor | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // 🔥 ESTADO DO MODAL DE CONFIRMAÇÃO
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    id: string | null;
    razaoSocial: string;
    loading: boolean;
  }>({
    isOpen: false,
    id: null,
    razaoSocial: '',
    loading: false,
  });

  // 🔥 ESTADO DE ORDENAÇÃO
  const [ordenacaoCampo, setOrdenacaoCampo] = useState<OrdenacaoCampo>('razaoSocial');
  const [ordenacaoDirecao, setOrdenacaoDirecao] = useState<OrdenacaoDirecao>('asc');

  // 🔥 COR DO MÓDULO (SKY)
  const cor = 'sky';
  const corBg = 'bg-sky-50';
  const corBorder = 'border-sky-200';
  const corText = 'text-sky-700';
  const corTextDark = 'text-sky-800';
  const corBgButton = 'bg-sky-600 hover:bg-sky-700';
  const corBgBadge = 'bg-sky-100';
  const corFocus = 'focus:ring-sky-500';
  const corIconBg = 'bg-sky-600';

  // Form State
  const [tipo, setTipo] = useState<'CLIENTE' | 'FORNECEDOR' | 'AMBOS'>('CLIENTE');
  const [documento, setDocumento] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [inscricaoEstadual, setInscricaoEstadual] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [nomeMunicipio, setNomeMunicipio] = useState('São Paulo');
  const [codigoMunicipio, setCodigoMunicipio] = useState('3550308');
  const [uf, setUf] = useState('SP');
  const [cep, setCep] = useState('01310-100');

  const handleOpenNovo = () => {
    setEditandoCliente(null);
    setErro(null);
    setTipo('CLIENTE');
    setDocumento('');
    setRazaoSocial('');
    setNomeFantasia('');
    setInscricaoEstadual('');
    setEmail('');
    setTelefone('');
    setLogradouro('');
    setNumero('');
    setBairro('');
    setNomeMunicipio('São Paulo');
    setCodigoMunicipio('3550308');
    setUf('SP');
    setCep('01310-100');
    setModalOpen(true);
  };

  const handleOpenEdit = (c: ClienteFornecedor) => {
    setEditandoCliente(c);
    setErro(null);
    setTipo(c.tipo);
    setDocumento(c.documento);
    setRazaoSocial(c.razaoSocial);
    setNomeFantasia(c.nomeFantasia || '');
    setInscricaoEstadual(c.inscricaoEstadual || '');
    setEmail(c.email);
    setTelefone(c.telefone);
    setLogradouro(c.endereco.logradouro);
    setNumero(c.endereco.numero);
    setBairro(c.endereco.bairro);
    setNomeMunicipio(c.endereco.nomeMunicipio);
    setCodigoMunicipio(c.endereco.codigoMunicipio);
    setUf(c.endereco.uf);
    setCep(c.endereco.cep);
    setModalOpen(true);
  };

  // ============================================================
  // 🔥 SALVAR COM TOAST
  // ============================================================

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    const val = validarCpfOuCnpj(documento);
    if (!val.valido) {
      toast.showWarning('⚠️ CPF ou CNPJ inválido. Verifique os dígitos.');
      return;
    }

    if (!razaoSocial.trim()) {
      toast.showWarning('⚠️ Razão Social / Nome é obrigatório.');
      return;
    }

    setCarregando(true);

    try {
      const dadosCliente = {
        tipo,
        tipoPessoa: documento.replace(/\D/g, '').length === 14 ? 'PJ' : 'PF',
        documento,
        razaoSocial,
        nomeFantasia,
        inscricaoEstadual,
        indicadorIE: inscricaoEstadual ? '1' : '9',
        email,
        telefone,
        endereco: {
          logradouro,
          numero,
          bairro,
          codigoMunicipio,
          nomeMunicipio,
          uf,
          cep,
        },
      };

      if (editandoCliente) {
        await clientesService.atualizar(editandoCliente.id, dadosCliente);
        toast.showSuccess(`✅ Cliente "${razaoSocial}" atualizado com sucesso!`);
      } else {
        await clientesService.criar(dadosCliente);
        toast.showSuccess(`✅ Cliente "${razaoSocial}" criado com sucesso!`);
      }

      setModalOpen(false);
      onClientesChange();

    } catch (error: any) {
      console.error('Erro ao salvar cliente:', error);
      const mensagem = error.response?.data?.erro || error.message || 'Erro ao salvar cliente';
      setErro(mensagem);
      toast.showError(`❌ ${mensagem}`);
    } finally {
      setCarregando(false);
    }
  };

  // ============================================================
  // 🔥 EXCLUIR COM MODAL DE CONFIRMAÇÃO
  // ============================================================

  const openConfirmModal = (id: string, razaoSocial: string) => {
    setConfirmModal({
      isOpen: true,
      id,
      razaoSocial,
      loading: false,
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleConfirmExclusao = async () => {
    const { id, razaoSocial } = confirmModal;
    if (!id) {
      toast.showError('❌ ID do cliente não informado');
      closeConfirmModal();
      return;
    }

    setConfirmModal(prev => ({ ...prev, loading: true }));

    try {
      console.log(`🗑️ Excluindo cliente: ${id} - ${razaoSocial}`);
      
      await clientesService.excluir(id);
      
      closeConfirmModal();
      onClientesChange();
      
      toast.showSuccess(`✅ Cliente "${razaoSocial}" excluído com sucesso!`);
      
    } catch (error: any) {
      console.error('❌ Erro ao excluir cliente:', error);
      
      const mensagemErro = error.response?.data?.erro || error.message || 'Erro ao excluir cliente';
      
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

  const clientesOrdenados = useMemo(() => {
    const filtrados = clientes.filter(c =>
      c.razaoSocial.toLowerCase().includes(busca.toLowerCase()) ||
      c.documento.includes(busca) ||
      (c.nomeFantasia && c.nomeFantasia.toLowerCase().includes(busca.toLowerCase()))
    );

    return [...filtrados].sort((a, b) => {
      let valorA: any;
      let valorB: any;

      if (ordenacaoCampo === 'endereco.nomeMunicipio') {
        valorA = a.endereco.nomeMunicipio || '';
        valorB = b.endereco.nomeMunicipio || '';
      } else if (ordenacaoCampo === 'endereco.uf') {
        valorA = a.endereco.uf || '';
        valorB = b.endereco.uf || '';
      } else {
        valorA = a[ordenacaoCampo] || '';
        valorB = b[ordenacaoCampo] || '';
      }

      if (typeof valorA === 'string' && typeof valorB === 'string') {
        return ordenacaoDirecao === 'asc'
          ? valorA.localeCompare(valorB)
          : valorB.localeCompare(valorA);
      }

      return 0;
    });
  }, [clientes, busca, ordenacaoCampo, ordenacaoDirecao]);

  const IconeOrdenacao = ({ campo }: { campo: OrdenacaoCampo }) => {
    if (ordenacaoCampo !== campo) {
      return <ArrowUpDown className="w-3 h-3 text-slate-400 ml-1" />;
    }
    return ordenacaoDirecao === 'asc'
      ? <ArrowUp className="w-3 h-3 text-sky-600 ml-1" />
      : <ArrowDown className="w-3 h-3 text-sky-600 ml-1" />;
  };

  const thClass = "py-3 px-4 text-left text-xs font-bold text-slate-700 cursor-pointer hover:text-sky-600 transition-colors select-none";

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      
      {/* HEADER */}
      <div className={`${corBg} rounded-xl border ${corBorder} p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}>
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-8 h-8 ${corIconBg} rounded-lg flex items-center justify-center text-white shadow-sm`}>
              <Users className="w-4 h-4" />
            </span>
            <h1 className="text-base font-bold text-slate-900">Clientes</h1>
            <span className={`${corBgBadge} ${corTextDark} text-[10px] font-bold px-2 py-0.5 rounded-full border ${corBorder}`}>
              {clientes.length} cadastros
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cadastro de clientes e tomadores de serviços com validação fiscal.
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs font-semibold text-slate-700">Cadastro de Clientes</div>
          <div className={`text-[10px] font-medium ${corText}`}>{clientes.length} clientes ativos</div>
        </div>
      </div>

      {/* Busca e Botão */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 flex items-center bg-white border border-slate-200 rounded-lg p-1.5 shadow-sm">
          <Search className="w-4 h-4 text-slate-400 ml-1.5" />
          <input
            type="text"
            placeholder="Buscar por Razão Social, Nome Fantasia ou CPF/CNPJ..."
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
          <span>Novo Cliente</span>
        </button>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className={thClass} onClick={() => handleOrdenar('tipo')}>
                  <div className="flex items-center">Tipo <IconeOrdenacao campo="tipo" /></div>
                </th>
                <th className={thClass} onClick={() => handleOrdenar('razaoSocial')}>
                  <div className="flex items-center">Razão Social / Nome <IconeOrdenacao campo="razaoSocial" /></div>
                </th>
                <th className={thClass} onClick={() => handleOrdenar('documento')}>
                  <div className="flex items-center">CPF / CNPJ <IconeOrdenacao campo="documento" /></div>
                </th>
                <th className={thClass} onClick={() => handleOrdenar('email')}>
                  <div className="flex items-center">E-mail / Telefone <IconeOrdenacao campo="email" /></div>
                </th>
                <th className={thClass} onClick={() => handleOrdenar('endereco.nomeMunicipio')}>
                  <div className="flex items-center">Cidade / UF <IconeOrdenacao campo="endereco.nomeMunicipio" /></div>
                </th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clientesOrdenados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">Nenhum cliente encontrado</p>
                    <p className="text-xs text-slate-400">
                      {busca ? 'Tente ajustar os termos da busca' : 'Clique em "Novo Cliente" para começar'}
                    </p>
                  </td>
                </tr>
              ) : (
                clientesOrdenados.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        c.tipo === 'CLIENTE' ? 'bg-sky-100 text-sky-800' :
                        c.tipo === 'AMBOS' ? 'bg-violet-100 text-violet-800' :
                        'bg-violet-100 text-violet-800'
                      }`}>
                        {c.tipo}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div>{c.razaoSocial}</div>
                      {c.nomeFantasia && <div className="text-[10px] text-slate-400 font-normal">{c.nomeFantasia}</div>}
                    </td>
                    <td className="py-3 px-4 font-mono">{formatarCpfCnpj(c.documento)}</td>
                    <td className="py-3 px-4">
                      <div>{c.email || '-'}</div>
                      <div className="text-[10px] text-slate-400">{c.telefone || '-'}</div>
                    </td>
                    <td className="py-3 px-4">{c.endereco.nomeMunicipio} - {c.endereco.uf}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openConfirmModal(c.id, c.razaoSocial)}
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
        title="Excluir Cliente"
        message={`Tem certeza que deseja excluir permanentemente o cliente "${confirmModal.razaoSocial}"?\n\nEsta ação não pode ser desfeita.`}
        confirmText="Excluir Permanentemente"
        cancelText="Cancelar"
        loading={confirmModal.loading}
      />

      {/* MODAL DE CADASTRO/EDIÇÃO */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className={`w-7 h-7 ${corIconBg} rounded-lg flex items-center justify-center text-white shadow-sm`}>
                  <Users className="w-3.5 h-3.5" />
                </span>
                <h2 className="text-sm font-bold text-slate-900">
                  {editandoCliente ? 'Editar Cadastro' : 'Novo Cliente'}
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
                  <label className="block font-semibold text-slate-700 mb-1">Tipo de Parceiro</label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as any)}
                    className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus} bg-white`}
                  >
                    <option value="CLIENTE">Cliente (Tomador)</option>
                    <option value="FORNECEDOR">Fornecedor</option>
                    <option value="AMBOS">Ambos</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">CPF ou CNPJ *</label>
                  <input
                    type="text"
                    value={documento}
                    onChange={(e) => setDocumento(e.target.value)}
                    placeholder="00.000.000/0000-00"
                    className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Razão Social / Nome *</label>
                  <input
                    type="text"
                    value={razaoSocial}
                    onChange={(e) => setRazaoSocial(e.target.value)}
                    className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nome Fantasia</label>
                  <input
                    type="text"
                    value={nomeFantasia}
                    onChange={(e) => setNomeFantasia(e.target.value)}
                    className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Telefone</label>
                  <input
                    type="text"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Logradouro</label>
                  <input
                    type="text"
                    value={logradouro}
                    onChange={(e) => setLogradouro(e.target.value)}
                    className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Número</label>
                  <input
                    type="text"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bairro</label>
                  <input
                    type="text"
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                    className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Município</label>
                  <input
                    type="text"
                    value={nomeMunicipio}
                    onChange={(e) => setNomeMunicipio(e.target.value)}
                    className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">UF</label>
                  <input
                    type="text"
                    value={uf}
                    onChange={(e) => setUf(e.target.value)}
                    className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                  />
                </div>
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
                      <span>Salvar Cadastro</span>
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