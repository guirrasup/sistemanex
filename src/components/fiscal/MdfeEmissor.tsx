// src/components/fiscal/MdfeEmissor.tsx

import React, { useState } from 'react';
import {
  Truck,
  Send,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Download,
  MapPin,
  Package,
  FileText,
  UserCheck,
  CreditCard,
  Plus,
  Trash2,
  Navigation,
  Route,
  Weight,
  Box,
  User,
  Building,
  Calculator,
  Receipt,
  Barcode,
  X,
  RefreshCw,
  DollarSign,
  Shield,
  FileCheck,
  Clipboard,
  Edit2,
  Save,
  Info,
  FolderOpen
} from 'lucide-react';
import { MDFeDocumento, ModalMDFe, TipoEmitenteMDFe, TipoCargaMDFe } from '../../types/mdfe';
import { ClienteFornecedor, ConfiguracaoEmpresa } from '../../types/erp';
import { formatarMoeda, formatarCpfCnpj, limparDocumento } from '../../utils/cpfCnpjValidator';
import { mdfeService } from '../../services/mdfe.service';
import { useToast } from '../../hooks/useToast';
import { ConfirmModal } from '../ui/ConfirmModal';

interface MdfeEmissorProps {
  empresa: ConfiguracaoEmpresa;
  clientes: ClienteFornecedor[];
  onMdfeEmitido: (mdfe: MDFeDocumento) => void;
  onViewMdfe: (mdfe: MDFeDocumento) => void;
}

// 🔥 COR DO MÓDULO - LARANJA/TEAL (COR ÚNICA PARA MDF-e)
const MODAL_COLOR = 'orange';
const corBg = 'bg-orange-50';
const corBorder = 'border-orange-200';
const corText = 'text-orange-700';
const corTextDark = 'text-orange-800';
const corBgButton = 'bg-orange-600 hover:bg-orange-700';
const corBgBadge = 'bg-orange-100';
const corFocus = 'focus:ring-orange-500';
const corIconBg = 'bg-orange-600';
const corGradient = 'from-orange-600 to-orange-700';

export const MdfeEmissor: React.FC<MdfeEmissorProps> = ({
  empresa,
  clientes,
  onMdfeEmitido,
  onViewMdfe,
}) => {
  const toast = useToast();

  // ============================================================
  // STATE - EMITENTE
  // ============================================================
  const [selectedEmitenteId, setSelectedEmitenteId] = useState<string>('');
  const [emitenteDoc, setEmitenteDoc] = useState('');
  const [emitenteNome, setEmitenteNome] = useState('');
  const [emitenteIE, setEmitenteIE] = useState('');
  const [emitenteLogradouro, setEmitenteLogradouro] = useState('');
  const [emitenteNumero, setEmitenteNumero] = useState('');
  const [emitenteBairro, setEmitenteBairro] = useState('');
  const [emitenteMun, setEmitenteMun] = useState('');
  const [emitenteMunIbge, setEmitenteMunIbge] = useState('');
  const [emitenteUf, setEmitenteUf] = useState('SP');
  const [emitenteCep, setEmitenteCep] = useState('');

  // ============================================================
  // STATE - IDENTIFICAÇÃO
  // ============================================================
  const [modal, setModal] = useState<ModalMDFe>('RODOVIARIO');
  const [tpEmit, setTpEmit] = useState<TipoEmitenteMDFe>('PRESTADOR_SERVICO');
  const [tpTransp, setTpTransp] = useState<'ETC' | 'TAC' | 'CTC'>('ETC');
  const [UFIni, setUFIni] = useState('SP');
  const [UFFim, setUFFim] = useState('RJ');
  const [dhIniViagem, setDhIniViagem] = useState('');
  const [indCanalVerde, setIndCanalVerde] = useState(false);
  const [indCarregaPosterior, setIndCarregaPosterior] = useState(false);

  // ============================================================
  // STATE - MUNICÍPIOS DE CARREGAMENTO
  // ============================================================
  const [municipiosCarrega, setMunicipiosCarrega] = useState<{ codigo: string; nome: string }[]>([]);
  const [novoMunCarregaCodigo, setNovoMunCarregaCodigo] = useState('');
  const [novoMunCarregaNome, setNovoMunCarregaNome] = useState('');

  // ============================================================
  // STATE - PERCURSOS
  // ============================================================
  const [percursos, setPercursos] = useState<string[]>([]);
  const [novoPercurso, setNovoPercurso] = useState('');

  // ============================================================
  // STATE - MUNICÍPIOS DE DESCARGA
  // ============================================================
  const [municipiosDescarga, setMunicipiosDescarga] = useState<{
    codigo: string;
    nome: string;
    ctes: { chave: string; segundoCodigoBarras?: string; indReentrega?: boolean }[];
    nfes: { chave: string; segundoCodigoBarras?: string; indReentrega?: boolean }[];
    mdfesTransp: { chave: string; indReentrega?: boolean }[];
  }[]>([]);
  const [novoMunDescargaCodigo, setNovoMunDescargaCodigo] = useState('');
  const [novoMunDescargaNome, setNovoMunDescargaNome] = useState('');
  const [novaChaveCTe, setNovaChaveCTe] = useState('');
  const [novaChaveNFe, setNovaChaveNFe] = useState('');
  const [novaChaveMDFe, setNovaChaveMDFe] = useState('');
  const [munDescargaSelecionado, setMunDescargaSelecionado] = useState<number | null>(null);

  // ============================================================
  // STATE - PRODUTO PREDOMINANTE
  // ============================================================
  const [tpCarga, setTpCarga] = useState<TipoCargaMDFe>('CARGA_GERAL');
  const [xProd, setXProd] = useState('');
  const [cEAN, setCEAN] = useState('');
  const [NCM, setNCM] = useState('');

  // ============================================================
  // STATE - TOTALIZADORES
  // ============================================================
  const [vCarga, setVCarga] = useState<number>(0);
  const [cUnid, setCUnid] = useState<'01' | '02'>('01');
  const [qCarga, setQCarga] = useState<number>(0);

  // ============================================================
  // STATE - SEGUROS
  // ============================================================
  const [seguros, setSeguros] = useState<SeguroMDFe[]>([]);
  const [novoSeguro, setNovoSeguro] = useState<SeguroMDFe>({
    responsavel: '1',
  });
  const [mostrarSeguro, setMostrarSeguro] = useState(false);

  // ============================================================
  // STATE - LACRES
  // ============================================================
  const [lacres, setLacres] = useState<string[]>([]);
  const [novoLacre, setNovoLacre] = useState('');

  // ============================================================
  // STATE - AUTORIZADOS DOWNLOAD
  // ============================================================
  const [autorizadosDownload, setAutorizadosDownload] = useState<{ cnpj?: string; cpf?: string }[]>([]);
  const [novoAutCNPJ, setNovoAutCNPJ] = useState('');
  const [novoAutCPF, setNovoAutCPF] = useState('');

  // ============================================================
  // STATE - INFORMAÇÕES ADICIONAIS
  // ============================================================
  const [infAdFisco, setInfAdFisco] = useState('');
  const [infCpl, setInfCpl] = useState('');

  // ============================================================
  // STATE - UI
  // ============================================================
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [erros, setErros] = useState<string[]>([]);
  const [sucessoMdfe, setSucessoMdfe] = useState<MDFeDocumento | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    onConfirm: () => void;
    title: string;
    message: string;
    loading: boolean;
  }>({
    isOpen: false,
    onConfirm: () => {},
    title: '',
    message: '',
    loading: false,
  });

  // ============================================================
  // HANDLERS - EMITENTE
  // ============================================================

  const handleSelectEmitente = (clienteId: string) => {
    setSelectedEmitenteId(clienteId);
    if (!clienteId) {
      setEmitenteDoc('');
      setEmitenteNome('');
      setEmitenteIE('');
      setEmitenteLogradouro('');
      setEmitenteNumero('');
      setEmitenteBairro('');
      setEmitenteMun('');
      setEmitenteMunIbge('');
      setEmitenteUf('SP');
      setEmitenteCep('');
      return;
    }
    const cli = clientes.find(c => c.id === clienteId);
    if (cli) {
      setEmitenteDoc(cli.documento);
      setEmitenteNome(cli.razaoSocial);
      setEmitenteIE(cli.inscricaoEstadual || 'ISENTO');
      setEmitenteLogradouro(cli.endereco.logradouro);
      setEmitenteNumero(cli.endereco.numero);
      setEmitenteBairro(cli.endereco.bairro);
      setEmitenteMun(cli.endereco.nomeMunicipio);
      setEmitenteMunIbge(cli.endereco.codigoMunicipio);
      setEmitenteUf(cli.endereco.uf);
      setEmitenteCep(cli.endereco.cep);
    }
  };

  // ============================================================
  // HANDLERS - MUNICÍPIOS DE CARREGAMENTO
  // ============================================================

  const handleAddMunCarrega = () => {
    if (!novoMunCarregaCodigo || !novoMunCarregaNome) {
      toast.showWarning('⚠️ Informe código e nome do município de carregamento.');
      return;
    }
    if (municipiosCarrega.length >= 50) {
      toast.showWarning('⚠️ Máximo de 50 municípios de carregamento.');
      return;
    }
    setMunicipiosCarrega([
      ...municipiosCarrega,
      { codigo: novoMunCarregaCodigo, nome: novoMunCarregaNome }
    ]);
    setNovoMunCarregaCodigo('');
    setNovoMunCarregaNome('');
  };

  const handleRemoveMunCarrega = (index: number) => {
    setMunicipiosCarrega(municipiosCarrega.filter((_, i) => i !== index));
  };

  // ============================================================
  // HANDLERS - PERCURSOS
  // ============================================================

  const handleAddPercurso = () => {
    if (!novoPercurso) {
      toast.showWarning('⚠️ Informe a UF do percurso.');
      return;
    }
    if (percursos.includes(novoPercurso)) {
      toast.showWarning('⚠️ UF já adicionada ao percurso.');
      return;
    }
    if (percursos.length >= 25) {
      toast.showWarning('⚠️ Máximo de 25 UFs no percurso.');
      return;
    }
    setPercursos([...percursos, novoPercurso]);
    setNovoPercurso('');
  };

  const handleRemovePercurso = (index: number) => {
    setPercursos(percursos.filter((_, i) => i !== index));
  };

  // ============================================================
  // HANDLERS - MUNICÍPIOS DE DESCARGA
  // ============================================================

  const handleAddMunDescarga = () => {
    if (!novoMunDescargaCodigo || !novoMunDescargaNome) {
      toast.showWarning('⚠️ Informe código e nome do município de descarga.');
      return;
    }
    if (municipiosDescarga.length >= 1000) {
      toast.showWarning('⚠️ Máximo de 1000 municípios de descarga.');
      return;
    }
    setMunicipiosDescarga([
      ...municipiosDescarga,
      { codigo: novoMunDescargaCodigo, nome: novoMunDescargaNome, ctes: [], nfes: [], mdfesTransp: [] }
    ]);
    setNovoMunDescargaCodigo('');
    setNovoMunDescargaNome('');
  };

  const handleRemoveMunDescarga = (index: number) => {
    setMunicipiosDescarga(municipiosDescarga.filter((_, i) => i !== index));
  };

  const handleAddCTe = (index: number) => {
    if (!novaChaveCTe) {
      toast.showWarning('⚠️ Informe a chave do CT-e (44 dígitos).');
      return;
    }
    const chaveLimpa = novaChaveCTe.replace(/\D/g, '');
    if (chaveLimpa.length !== 44) {
      toast.showWarning('⚠️ Chave do CT-e deve ter 44 dígitos.');
      return;
    }
    const mun = municipiosDescarga[index];
    const totalCTe = municipiosDescarga.reduce((acc, m) => acc + (m.ctes?.length || 0), 0);
    if (totalCTe >= 20000) {
      toast.showWarning('⚠️ Máximo de 20000 CT-e no manifesto.');
      return;
    }
    const novos = [...municipiosDescarga];
    novos[index].ctes = [...(novos[index].ctes || []), { chave: chaveLimpa }];
    setMunicipiosDescarga(novos);
    setNovaChaveCTe('');
  };

  const handleAddNFe = (index: number) => {
    if (!novaChaveNFe) {
      toast.showWarning('⚠️ Informe a chave da NF-e (44 dígitos).');
      return;
    }
    const chaveLimpa = novaChaveNFe.replace(/\D/g, '');
    if (chaveLimpa.length !== 44) {
      toast.showWarning('⚠️ Chave da NF-e deve ter 44 dígitos.');
      return;
    }
    const totalNFe = municipiosDescarga.reduce((acc, m) => acc + (m.nfes?.length || 0), 0);
    if (totalNFe >= 20000) {
      toast.showWarning('⚠️ Máximo de 20000 NF-e no manifesto.');
      return;
    }
    const novos = [...municipiosDescarga];
    novos[index].nfes = [...(novos[index].nfes || []), { chave: chaveLimpa }];
    setMunicipiosDescarga(novos);
    setNovaChaveNFe('');
  };

  const handleAddMDFeTransp = (index: number) => {
    if (!novaChaveMDFe) {
      toast.showWarning('⚠️ Informe a chave do MDF-e (44 dígitos).');
      return;
    }
    const chaveLimpa = novaChaveMDFe.replace(/\D/g, '');
    if (chaveLimpa.length !== 44) {
      toast.showWarning('⚠️ Chave do MDF-e deve ter 44 dígitos.');
      return;
    }
    const totalMDFe = municipiosDescarga.reduce((acc, m) => acc + (m.mdfesTransp?.length || 0), 0);
    if (totalMDFe >= 20000) {
      toast.showWarning('⚠️ Máximo de 20000 MDF-e no manifesto (Aquaviário).');
      return;
    }
    const novos = [...municipiosDescarga];
    novos[index].mdfesTransp = [...(novos[index].mdfesTransp || []), { chave: chaveLimpa }];
    setMunicipiosDescarga(novos);
    setNovaChaveMDFe('');
  };

  const handleRemoveCTe = (munIndex: number, docIndex: number) => {
    const novos = [...municipiosDescarga];
    novos[munIndex].ctes = novos[munIndex].ctes?.filter((_, i) => i !== docIndex) || [];
    setMunicipiosDescarga(novos);
  };

  const handleRemoveNFe = (munIndex: number, docIndex: number) => {
    const novos = [...municipiosDescarga];
    novos[munIndex].nfes = novos[munIndex].nfes?.filter((_, i) => i !== docIndex) || [];
    setMunicipiosDescarga(novos);
  };

  const handleRemoveMDFeTransp = (munIndex: number, docIndex: number) => {
    const novos = [...municipiosDescarga];
    novos[munIndex].mdfesTransp = novos[munIndex].mdfesTransp?.filter((_, i) => i !== docIndex) || [];
    setMunicipiosDescarga(novos);
  };

  // ============================================================
  // HANDLERS - SEGUROS
  // ============================================================

  const handleAddSeguro = () => {
    if (!novoSeguro.responsavel) {
      toast.showWarning('⚠️ Informe o responsável pelo seguro.');
      return;
    }
    if (novoSeguro.responsavel === '2') {
      if (!novoSeguro.responsavelCNPJ && !novoSeguro.responsavelCPF) {
        toast.showWarning('⚠️ Informe CNPJ ou CPF do responsável pelo seguro.');
        return;
      }
    }
    setSeguros([...seguros, { ...novoSeguro }]);
    setNovoSeguro({ responsavel: '1' });
    setMostrarSeguro(false);
  };

  const handleRemoveSeguro = (index: number) => {
    setSeguros(seguros.filter((_, i) => i !== index));
  };

  // ============================================================
  // HANDLERS - LACRES
  // ============================================================

  const handleAddLacre = () => {
    if (!novoLacre) {
      toast.showWarning('⚠️ Informe o número do lacre.');
      return;
    }
    setLacres([...lacres, novoLacre]);
    setNovoLacre('');
  };

  const handleRemoveLacre = (index: number) => {
    setLacres(lacres.filter((_, i) => i !== index));
  };

  // ============================================================
  // HANDLERS - AUTORIZADOS DOWNLOAD
  // ============================================================

  const handleAddAutXML = () => {
    if (!novoAutCNPJ && !novoAutCPF) {
      toast.showWarning('⚠️ Informe CNPJ ou CPF do autorizado.');
      return;
    }
    if (autorizadosDownload.length >= 10) {
      toast.showWarning('⚠️ Máximo de 10 autorizados para download.');
      return;
    }
    const novo: { cnpj?: string; cpf?: string } = {};
    if (novoAutCNPJ) {
      const cnpjLimpo = novoAutCNPJ.replace(/\D/g, '');
      if (cnpjLimpo.length !== 14) {
        toast.showWarning('⚠️ CNPJ deve ter 14 dígitos.');
        return;
      }
      novo.cnpj = cnpjLimpo;
    }
    if (novoAutCPF) {
      const cpfLimpo = novoAutCPF.replace(/\D/g, '');
      if (cpfLimpo.length !== 11) {
        toast.showWarning('⚠️ CPF deve ter 11 dígitos.');
        return;
      }
      novo.cpf = cpfLimpo;
    }
    setAutorizadosDownload([...autorizadosDownload, novo]);
    setNovoAutCNPJ('');
    setNovoAutCPF('');
  };

  const handleRemoveAutXML = (index: number) => {
    setAutorizadosDownload(autorizadosDownload.filter((_, i) => i !== index));
  };

  // ============================================================
  // VALIDAÇÃO
  // ============================================================

  const validarAntesDeTransmitir = (): string[] => {
    const errs: string[] = [];

    // Emitente
    if (!emitenteDoc || !emitenteNome) {
      errs.push('Emitente: CPF/CNPJ e Razão Social são obrigatórios.');
    }

    // Municípios de carregamento
    if (municipiosCarrega.length === 0) {
      errs.push('Adicione pelo menos 1 município de carregamento.');
    }
    if (municipiosCarrega.length > 50) {
      errs.push('Máximo de 50 municípios de carregamento.');
    }

    // Percursos
    if (percursos.length > 25) {
      errs.push('Máximo de 25 UFs no percurso.');
    }

    // Municípios de descarga
    if (municipiosDescarga.length === 0) {
      errs.push('Adicione pelo menos 1 município de descarga.');
    }
    if (municipiosDescarga.length > 1000) {
      errs.push('Máximo de 1000 municípios de descarga.');
    }

    // Documentos
    const totalCTe = municipiosDescarga.reduce((acc, m) => acc + (m.ctes?.length || 0), 0);
    const totalNFe = municipiosDescarga.reduce((acc, m) => acc + (m.nfes?.length || 0), 0);
    const totalMDFe = municipiosDescarga.reduce((acc, m) => acc + (m.mdfesTransp?.length || 0), 0);

    if (totalCTe === 0 && totalNFe === 0 && totalMDFe === 0) {
      errs.push('Adicione pelo menos 1 documento fiscal (CT-e, NF-e ou MDF-e).');
    }
    if (totalCTe > 20000) errs.push('Máximo de 20000 CT-e.');
    if (totalNFe > 20000) errs.push('Máximo de 20000 NF-e.');
    if (totalMDFe > 20000) errs.push('Máximo de 20000 MDF-e (Aquaviário).');

    // Produto predominante
    if (!xProd) errs.push('Descrição do produto predominante é obrigatória.');

    // Totalizadores
    if (vCarga <= 0) errs.push('Valor total da carga deve ser maior que zero.');
    if (qCarga <= 0) errs.push('Peso total da carga deve ser maior que zero.');

    return errs;
  };

  // ============================================================
  // TRANSMISSÃO
  // ============================================================

  const handleTransmitirMdfe = async () => {
    setErros([]);

    const errs = validarAntesDeTransmitir();
    if (errs.length > 0) {
      setErros(errs);
      return;
    }

    // Confirmar antes de enviar
    setConfirmModal({
      isOpen: true,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, loading: true }));
        await executarTransmissao();
        setConfirmModal(prev => ({ ...prev, loading: false, isOpen: false }));
      },
      title: 'Confirmar Emissão',
      message: `Deseja emitir o MDF-e com ${municipiosCarrega.length} municípios de carregamento, ${municipiosDescarga.length} municípios de descarga e ${municipiosDescarga.reduce((acc, m) => acc + (m.ctes?.length || 0) + (m.nfes?.length || 0), 0)} documentos fiscais vinculados?`,
      loading: false,
    });
  };

  const executarTransmissao = async () => {
    setIsTransmitting(true);
    setErros([]);

    try {
      // Monta payload
      const payload: any = {
        emitenteId: selectedEmitenteId || undefined,
        modal,
        tpEmit,
        tpTransp: tpTransp as any,
        UFIni,
        UFFim,
        dhIniViagem: dhIniViagem || undefined,
        indCanalVerde,
        indCarregaPosterior,
        municipiosCarrega: municipiosCarrega.map(m => ({
          codigo: m.codigo,
          nome: m.nome
        })),
        percursos: percursos.map(uf => ({ uf })),
        municipiosDescarga: municipiosDescarga.map(m => ({
          codigo: m.codigo,
          nome: m.nome,
          ctes: m.ctes?.map(c => ({
            chave: c.chave,
            segundoCodigoBarras: c.segundoCodigoBarras,
            indReentrega: c.indReentrega
          })) || [],
          nfes: m.nfes?.map(n => ({
            chave: n.chave,
            segundoCodigoBarras: n.segundoCodigoBarras,
            indReentrega: n.indReentrega
          })) || [],
          mdfesTransp: m.mdfesTransp?.map(md => ({
            chave: md.chave,
            indReentrega: md.indReentrega
          })) || [],
        })),
        tpCarga,
        xProd,
        cEAN: cEAN || undefined,
        NCM: NCM || undefined,
        vCarga,
        cUnid,
        qCarga,
        seguros: seguros.map(s => ({
          responsavel: s.responsavel,
          responsavelCNPJ: s.responsavelCNPJ,
          responsavelCPF: s.responsavelCPF,
          seguradoraNome: s.seguradoraNome,
          seguradoraCNPJ: s.seguradoraCNPJ,
          apolice: s.apolice,
          averbacoes: s.averbacoes || []
        })),
        lacres,
        autorizadosDownload,
        infAdFisco: infAdFisco || undefined,
        infCpl: infCpl || undefined,
      };

      const result = await mdfeService.emitir(payload);

      if (result) {
        setSucessoMdfe(result);
        onMdfeEmitido(result);
        toast.showSuccess(`✅ MDF-e Nº ${result.numero} emitido com sucesso!`);
      } else {
        setErros(['Erro ao emitir MDF-e. Tente novamente.']);
        toast.showError('❌ Erro ao emitir MDF-e.');
      }

    } catch (error: any) {
      console.error('❌ Erro na transmissão:', error);
      const mensagem = error.response?.data?.erro || error.message || 'Erro ao emitir MDF-e';
      setErros([mensagem]);
      toast.showError(`❌ ${mensagem}`);
    } finally {
      setIsTransmitting(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      
      {/* HEADER */}
      <div className={`${corBg} rounded-xl border ${corBorder} p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}>
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-8 h-8 ${corIconBg} rounded-lg flex items-center justify-center text-white shadow-sm`}>
              <Truck className="w-4 h-4" />
            </span>
            <h1 className="text-base font-bold text-slate-900">
              Emissão de MDF-e (Manifesto de Documentos Fiscais)
            </h1>
            <span className={`${corBgBadge} ${corTextDark} text-[10px] font-bold px-2 py-0.5 rounded-full border ${corBorder}`}>
              Modelo 58
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Agrupamento de documentos fiscais para transporte de cargas.
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs font-semibold text-slate-700">Série {empresa.serieMdfe || 1}</div>
          <div className={`text-[10px] font-medium ${corText}`}>Próximo MDF-e: Nº {empresa.proximoNumeroMdfe || 1}</div>
        </div>
      </div>

      {/* SUCESSO */}
      {sucessoMdfe && (
        <div className={`${corBg} border ${corBorder} rounded-xl p-4 shadow-sm animate-fadeIn`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className={`w-5 h-5 ${corText} shrink-0 mt-0.5`} />
              <div>
                <h3 className={`text-sm font-bold ${corTextDark}`}>
                  MDF-e Nº {sucessoMdfe.numero} Emitido com Sucesso!
                </h3>
                <p className="text-xs text-orange-800 font-mono mt-0.5">
                  Chave: {sucessoMdfe.chaveAcesso}
                </p>
                <div className="text-[11px] text-orange-700 mt-1">
                  {sucessoMdfe.UFIni} ➔ {sucessoMdfe.UFFim} • 
                  {sucessoMdfe.municipiosCarrega.length} carregamentos • 
                  {sucessoMdfe.municipiosDescarga.length} descargas
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onViewMdfe(sucessoMdfe)}
                className={`${corBgButton} text-white font-medium text-xs px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Visualizar</span>
              </button>

              <button
                onClick={() => {
                  const blob = new Blob([sucessoMdfe.xmlAssinado], { type: 'application/xml' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `MDFe_${sucessoMdfe.numero}_SUP.xml`;
                  a.click();
                }}
                className="bg-white hover:bg-slate-100 text-slate-700 font-medium text-xs px-3 py-2 rounded-lg border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>XML</span>
              </button>

              <button
                onClick={() => {
                  setSucessoMdfe(null);
                  // Limpar formulário
                }}
                className="text-xs text-slate-600 hover:text-slate-900 underline ml-2 cursor-pointer"
              >
                Novo MDF-e
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ERROS */}
      {erros.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-rose-900">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Pendências no MDF-e ({erros.length}):</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 pl-2">
            {erros.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* FORMULÁRIO */}
      <div className="space-y-4">
        
        {/* ============================================================
            BLOCO 1: EMITENTE
        ============================================================ */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <User className={`w-4 h-4 ${corText}`} />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">1. Emitente</h3>
            </div>
            <select
              value={selectedEmitenteId}
              onChange={(e) => handleSelectEmitente(e.target.value)}
              className={`text-xs bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 ${corFocus} font-medium text-slate-700 max-w-[280px]`}
            >
              <option value="">-- Escolher Cliente --</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.razaoSocial} ({c.documento})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-medium text-slate-600 mb-1">CPF / CNPJ *</label>
              <input
                type="text"
                value={emitenteDoc}
                onChange={(e) => setEmitenteDoc(e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                placeholder="00.000.000/0000-00"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-600 mb-1">Razão Social / Nome *</label>
              <input
                type="text"
                value={emitenteNome}
                onChange={(e) => setEmitenteNome(e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                placeholder="Razão Social do emitente"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">Inscrição Estadual</label>
              <input
                type="text"
                value={emitenteIE}
                onChange={(e) => setEmitenteIE(e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                placeholder="ISENTO ou número"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">Município</label>
              <input
                type="text"
                value={emitenteMun}
                onChange={(e) => setEmitenteMun(e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                placeholder="São Paulo"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">UF</label>
              <input
                type="text"
                value={emitenteUf}
                onChange={(e) => setEmitenteUf(e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                placeholder="SP"
              />
            </div>
          </div>
        </div>

        {/* ============================================================
            BLOCO 2: IDENTIFICAÇÃO DO MDF-e
        ============================================================ */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
            <FileText className={`w-4 h-4 ${corText}`} />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">2. Identificação do MDF-e</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-medium text-slate-600 mb-1">Modal *</label>
              <select
                value={modal}
                onChange={(e) => setModal(e.target.value as ModalMDFe)}
                className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus} bg-white`}
              >
                <option value="RODOVIARIO">🚛 Rodoviário</option>
                <option value="AEREO">✈️ Aéreo</option>
                <option value="AQUAVIARIO">🚢 Aquaviário</option>
                <option value="FERROVIARIO">🚂 Ferroviário</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">Tipo Emitente *</label>
              <select
                value={tpEmit}
                onChange={(e) => setTpEmit(e.target.value as TipoEmitenteMDFe)}
                className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus} bg-white`}
              >
                <option value="PRESTADOR_SERVICO">Prestador de serviço</option>
                <option value="TRANSPORTADOR_CARGA_PROPRIA">Transportador carga própria</option>
                <option value="CTE_GLOBALIZADO">CT-e Globalizado</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">UF Início *</label>
              <input
                type="text"
                maxLength={2}
                value={UFIni}
                onChange={(e) => setUFIni(e.target.value.toUpperCase())}
                className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus} uppercase`}
                placeholder="SP"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">UF Fim *</label>
              <input
                type="text"
                maxLength={2}
                value={UFFim}
                onChange={(e) => setUFFim(e.target.value.toUpperCase())}
                className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus} uppercase`}
                placeholder="RJ"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">Início Viagem</label>
              <input
                type="datetime-local"
                value={dhIniViagem}
                onChange={(e) => setDhIniViagem(e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
              />
            </div>
            <div className="flex items-center gap-4 pt-2">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={indCanalVerde}
                  onChange={(e) => setIndCanalVerde(e.target.checked)}
                  className={`rounded ${corFocus} cursor-pointer`}
                />
                <span>Canal Verde</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={indCarregaPosterior}
                  onChange={(e) => setIndCarregaPosterior(e.target.checked)}
                  className={`rounded ${corFocus} cursor-pointer`}
                />
                <span>Carga Posterior</span>
              </label>
            </div>
          </div>
        </div>

        {/* ============================================================
            BLOCO 3: MUNICÍPIOS DE CARREGAMENTO
        ============================================================ */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <MapPin className={`w-4 h-4 ${corText}`} />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                3. Municípios de Carregamento ({municipiosCarrega.length}/50)
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            <input
              type="text"
              value={novoMunCarregaCodigo}
              onChange={(e) => setNovoMunCarregaCodigo(e.target.value)}
              placeholder="Código IBGE"
              className={`w-32 border border-slate-300 rounded-lg p-1.5 text-xs focus:outline-none focus:ring-2 ${corFocus}`}
            />
            <input
              type="text"
              value={novoMunCarregaNome}
              onChange={(e) => setNovoMunCarregaNome(e.target.value)}
              placeholder="Nome do município"
              className={`flex-1 border border-slate-300 rounded-lg p-1.5 text-xs focus:outline-none focus:ring-2 ${corFocus}`}
            />
            <button
              type="button"
              onClick={handleAddMunCarrega}
              className={`${corBgButton} text-white text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar</span>
            </button>
          </div>

          {municipiosCarrega.length === 0 ? (
            <div className="p-4 border-2 border-dashed border-slate-200 rounded-lg text-center bg-slate-50/70">
              <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">Nenhum município de carregamento</p>
              <p className="text-[11px] text-slate-500">Adicione pelo menos 1 município</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {municipiosCarrega.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 ${corBg} border ${corBorder} rounded-lg text-xs`}
                >
                  <span className="font-mono text-[10px] text-slate-500">{m.codigo}</span>
                  <span className="font-medium text-slate-700">{m.nome}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMunCarrega(idx)}
                    className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ============================================================
            BLOCO 4: PERCURSOS
        ============================================================ */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Route className={`w-4 h-4 ${corText}`} />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                4. Percurso ({percursos.length}/25)
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            <input
              type="text"
              maxLength={2}
              value={novoPercurso}
              onChange={(e) => setNovoPercurso(e.target.value.toUpperCase())}
              placeholder="UF"
              className={`w-16 border border-slate-300 rounded-lg p-1.5 text-xs focus:outline-none focus:ring-2 ${corFocus} uppercase`}
            />
            <button
              type="button"
              onClick={handleAddPercurso}
              className={`${corBgButton} text-white text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar UF</span>
            </button>
          </div>

          {percursos.length === 0 ? (
            <div className="text-xs text-slate-500 p-2 text-center bg-slate-50 rounded-lg border border-slate-200">
              Nenhuma UF de percurso adicionada (opcional)
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {percursos.map((uf, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs font-bold text-blue-700`}
                >
                  <span>{uf}</span>
                  <button
                    type="button"
                    onClick={() => handleRemovePercurso(idx)}
                    className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ============================================================
            BLOCO 5: MUNICÍPIOS DE DESCARGA E DOCUMENTOS
        ============================================================ */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <FolderOpen className={`w-4 h-4 ${corText}`} />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                5. Municípios de Descarga ({municipiosDescarga.length}/1000)
              </h3>
            </div>
          </div>

          {/* Adicionar município de descarga */}
          <div className="flex flex-wrap gap-2 mb-4">
            <input
              type="text"
              value={novoMunDescargaCodigo}
              onChange={(e) => setNovoMunDescargaCodigo(e.target.value)}
              placeholder="Código IBGE"
              className={`w-32 border border-slate-300 rounded-lg p-1.5 text-xs focus:outline-none focus:ring-2 ${corFocus}`}
            />
            <input
              type="text"
              value={novoMunDescargaNome}
              onChange={(e) => setNovoMunDescargaNome(e.target.value)}
              placeholder="Nome do município"
              className={`flex-1 border border-slate-300 rounded-lg p-1.5 text-xs focus:outline-none focus:ring-2 ${corFocus}`}
            />
            <button
              type="button"
              onClick={handleAddMunDescarga}
              className={`${corBgButton} text-white text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar</span>
            </button>
          </div>

          {municipiosDescarga.length === 0 ? (
            <div className="p-4 border-2 border-dashed border-slate-200 rounded-lg text-center bg-slate-50/70">
              <FolderOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">Nenhum município de descarga</p>
              <p className="text-[11px] text-slate-500">Adicione pelo menos 1 município</p>
            </div>
          ) : (
            <div className="space-y-4">
              {municipiosDescarga.map((mun, idx) => (
                <div key={idx} className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-slate-500">{mun.codigo}</span>
                      <span className="font-bold text-slate-900 text-sm">{mun.nome}</span>
                      <span className="text-[10px] text-slate-400">
                        CT-e: {mun.ctes?.length || 0} • NF-e: {mun.nfes?.length || 0} • MDF-e: {mun.mdfesTransp?.length || 0}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMunDescargaSelecionado(idx === munDescargaSelecionado ? null : idx)}
                      className={`text-xs font-medium px-2 py-1 rounded-lg transition-colors ${munDescargaSelecionado === idx ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'} cursor-pointer`}
                    >
                      {munDescargaSelecionado === idx ? 'Ocultar' : 'Gerenciar'}
                    </button>
                  </div>

                  {munDescargaSelecionado === idx && (
                    <div className="mt-3 pt-3 border-t border-slate-200 space-y-3">
                      {/* CT-e */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold text-slate-700">CT-e</span>
                          <span className="text-[10px] text-slate-400">({mun.ctes?.length || 0})</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <input
                            type="text"
                            value={novaChaveCTe}
                            onChange={(e) => setNovaChaveCTe(e.target.value.replace(/\D/g, ''))}
                            placeholder="Chave CT-e (44 dígitos)"
                            maxLength={44}
                            className={`flex-1 border border-slate-300 rounded-lg p-1.5 text-xs font-mono focus:outline-none focus:ring-2 ${corFocus}`}
                          />
                          <button
                            type="button"
                            onClick={() => handleAddCTe(idx)}
                            className={`${corBgButton} text-white text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Adicionar</span>
                          </button>
                        </div>
                        {mun.ctes && mun.ctes.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {mun.ctes.map((cte, cIdx) => (
                              <div key={cIdx} className="flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded-lg text-[10px] font-mono">
                                <span className="text-slate-600">{cte.chave.slice(0, 8)}...{cte.chave.slice(-6)}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveCTe(idx, cIdx)}
                                  className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* NF-e */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold text-slate-700">NF-e</span>
                          <span className="text-[10px] text-slate-400">({mun.nfes?.length || 0})</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <input
                            type="text"
                            value={novaChaveNFe}
                            onChange={(e) => setNovaChaveNFe(e.target.value.replace(/\D/g, ''))}
                            placeholder="Chave NF-e (44 dígitos)"
                            maxLength={44}
                            className={`flex-1 border border-slate-300 rounded-lg p-1.5 text-xs font-mono focus:outline-none focus:ring-2 ${corFocus}`}
                          />
                          <button
                            type="button"
                            onClick={() => handleAddNFe(idx)}
                            className={`${corBgButton} text-white text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Adicionar</span>
                          </button>
                        </div>
                        {mun.nfes && mun.nfes.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {mun.nfes.map((nfe, nIdx) => (
                              <div key={nIdx} className="flex items-center gap-1 px-2 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-[10px] font-mono">
                                <span className="text-slate-600">{nfe.chave.slice(0, 8)}...{nfe.chave.slice(-6)}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveNFe(idx, nIdx)}
                                  className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* MDF-e (Aquaviário) */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold text-slate-700">MDF-e (Aquaviário)</span>
                          <span className="text-[10px] text-slate-400">({mun.mdfesTransp?.length || 0})</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <input
                            type="text"
                            value={novaChaveMDFe}
                            onChange={(e) => setNovaChaveMDFe(e.target.value.replace(/\D/g, ''))}
                            placeholder="Chave MDF-e (44 dígitos)"
                            maxLength={44}
                            className={`flex-1 border border-slate-300 rounded-lg p-1.5 text-xs font-mono focus:outline-none focus:ring-2 ${corFocus}`}
                          />
                          <button
                            type="button"
                            onClick={() => handleAddMDFeTransp(idx)}
                            className={`${corBgButton} text-white text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Adicionar</span>
                          </button>
                        </div>
                        {mun.mdfesTransp && mun.mdfesTransp.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {mun.mdfesTransp.map((md, mIdx) => (
                              <div key={mIdx} className="flex items-center gap-1 px-2 py-1 bg-purple-50 border border-purple-200 rounded-lg text-[10px] font-mono">
                                <span className="text-slate-600">{md.chave.slice(0, 8)}...{md.chave.slice(-6)}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveMDFeTransp(idx, mIdx)}
                                  className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveMunDescarga(idx)}
                        className="text-xs text-rose-600 hover:text-rose-800 font-medium transition-colors cursor-pointer"
                      >
                        Remover município de descarga
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ============================================================
            BLOCO 6: PRODUTO PREDOMINANTE
        ============================================================ */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
            <Package className={`w-4 h-4 ${corText}`} />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">6. Produto Predominante</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-medium text-slate-600 mb-1">Tipo de Carga *</label>
              <select
                value={tpCarga}
                onChange={(e) => setTpCarga(e.target.value as TipoCargaMDFe)}
                className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus} bg-white`}
              >
                <option value="GRANEL_SOLIDO">Granel Sólido</option>
                <option value="GRANEL_LIQUIDO">Granel Líquido</option>
                <option value="FRIGORIFICADA">Frigorificada</option>
                <option value="CONTEINERIZADA">Conteinerizada</option>
                <option value="CARGA_GERAL">Carga Geral</option>
                <option value="NEOGRANEL">Neogranel</option>
                <option value="PERIGOSA_GRANEL_SOLIDO">Perigosa (Granel Sólido)</option>
                <option value="PERIGOSA_GRANEL_LIQUIDO">Perigosa (Granel Líquido)</option>
                <option value="PERIGOSA_FRIGORIFICADA">Perigosa (Frigorificada)</option>
                <option value="PERIGOSA_CONTEINERIZADA">Perigosa (Conteinerizada)</option>
                <option value="PERIGOSA_CARGA_GERAL">Perigosa (Carga Geral)</option>
                <option value="GRANEL_PRESSURIZADA">Granel Pressurizada</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-600 mb-1">Descrição do Produto *</label>
              <input
                type="text"
                value={xProd}
                onChange={(e) => setXProd(e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                placeholder="Ex: Equipamentos eletrônicos, Peças automotivas..."
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">EAN / GTIN</label>
              <input
                type="text"
                value={cEAN}
                onChange={(e) => setCEAN(e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                placeholder="Código de barras"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">NCM</label>
              <input
                type="text"
                value={NCM}
                onChange={(e) => setNCM(e.target.value.replace(/\D/g, ''))}
                maxLength={8}
                className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus} font-mono`}
                placeholder="8 dígitos"
              />
            </div>
          </div>
        </div>

        {/* ============================================================
            BLOCO 7: TOTALIZADORES
        ============================================================ */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
            <Calculator className={`w-4 h-4 ${corText}`} />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">7. Totalizadores</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-medium text-slate-600 mb-1">Valor da Carga (R$) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={vCarga || ''}
                onChange={(e) => setVCarga(parseFloat(e.target.value) || 0)}
                className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus} font-bold`}
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">Unidade de Peso</label>
              <select
                value={cUnid}
                onChange={(e) => setCUnid(e.target.value as '01' | '02')}
                className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus} bg-white`}
              >
                <option value="01">KG</option>
                <option value="02">TON</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">Peso da Carga *</label>
              <input
                type="number"
                step="0.001"
                min="0.001"
                value={qCarga || ''}
                onChange={(e) => setQCarga(parseFloat(e.target.value) || 0)}
                className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus} font-bold`}
              />
            </div>
          </div>

          <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="text-slate-500">CT-e:</span>
                <span className="font-bold ml-1">{municipiosDescarga.reduce((acc, m) => acc + (m.ctes?.length || 0), 0)}</span>
              </div>
              <div>
                <span className="text-slate-500">NF-e:</span>
                <span className="font-bold ml-1">{municipiosDescarga.reduce((acc, m) => acc + (m.nfes?.length || 0), 0)}</span>
              </div>
              <div>
                <span className="text-slate-500">MDF-e:</span>
                <span className="font-bold ml-1">{municipiosDescarga.reduce((acc, m) => acc + (m.mdfesTransp?.length || 0), 0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================
            BLOCO 8: SEGURO
        ============================================================ */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Shield className={`w-4 h-4 ${corText}`} />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">8. Seguro ({seguros.length})</h3>
            </div>
            <button
              type="button"
              onClick={() => setMostrarSeguro(!mostrarSeguro)}
              className={`text-xs font-medium px-3 py-1 rounded-lg transition-colors ${mostrarSeguro ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'} cursor-pointer`}
            >
              {mostrarSeguro ? 'Ocultar' : '+ Adicionar Seguro'}
            </button>
          </div>

          {mostrarSeguro && (
            <div className="space-y-3 p-3 border border-slate-200 rounded-lg bg-slate-50/50">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Responsável *</label>
                  <select
                    value={novoSeguro.responsavel}
                    onChange={(e) => setNovoSeguro({ ...novoSeguro, responsavel: e.target.value as '1' | '2' })}
                    className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus} bg-white`}
                  >
                    <option value="1">Emitente do MDF-e</option>
                    <option value="2">Contratante do frete</option>
                  </select>
                </div>
                {novoSeguro.responsavel === '2' && (
                  <>
                    <div>
                      <label className="block font-medium text-slate-600 mb-1">CNPJ (contratante)</label>
                      <input
                        type="text"
                        value={novoSeguro.responsavelCNPJ || ''}
                        onChange={(e) => setNovoSeguro({ ...novoSeguro, responsavelCNPJ: e.target.value })}
                        className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                        placeholder="00.000.000/0000-00"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-slate-600 mb-1">CPF (contratante)</label>
                      <input
                        type="text"
                        value={novoSeguro.responsavelCPF || ''}
                        onChange={(e) => setNovoSeguro({ ...novoSeguro, responsavelCPF: e.target.value })}
                        className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                        placeholder="000.000.000-00"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Seguradora</label>
                  <input
                    type="text"
                    value={novoSeguro.seguradoraNome || ''}
                    onChange={(e) => setNovoSeguro({ ...novoSeguro, seguradoraNome: e.target.value })}
                    className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                    placeholder="Nome da seguradora"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">CNPJ Seguradora</label>
                  <input
                    type="text"
                    value={novoSeguro.seguradoraCNPJ || ''}
                    onChange={(e) => setNovoSeguro({ ...novoSeguro, seguradoraCNPJ: e.target.value })}
                    className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                    placeholder="00.000.000/0000-00"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Apólice</label>
                  <input
                    type="text"
                    value={novoSeguro.apolice || ''}
                    onChange={(e) => setNovoSeguro({ ...novoSeguro, apolice: e.target.value })}
                    className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                    placeholder="Número da apólice"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setMostrarSeguro(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleAddSeguro}
                  className={`${corBgButton} text-white text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Seguro</span>
                </button>
              </div>
            </div>
          )}

          {seguros.length > 0 && (
            <div className="space-y-2 mt-2">
              {seguros.map((s, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <div>
                    <span className="font-medium">Responsável: {s.responsavel === '1' ? 'Emitente' : 'Contratante'}</span>
                    {s.seguradoraNome && <span className="ml-2 text-slate-500">Seguradora: {s.seguradoraNome}</span>}
                    {s.apolice && <span className="ml-2 text-slate-500">Apólice: {s.apolice}</span>}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSeguro(idx)}
                    className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ============================================================
            BLOCO 9: LACRES
        ============================================================ */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
            <Barcode className={`w-4 h-4 ${corText}`} />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">9. Lacres</h3>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            <input
              type="text"
              value={novoLacre}
              onChange={(e) => setNovoLacre(e.target.value)}
              placeholder="Número do lacre"
              className={`flex-1 border border-slate-300 rounded-lg p-1.5 text-xs focus:outline-none focus:ring-2 ${corFocus}`}
            />
            <button
              type="button"
              onClick={handleAddLacre}
              className={`${corBgButton} text-white text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar</span>
            </button>
          </div>

          {lacres.length === 0 ? (
            <div className="text-xs text-slate-500 p-2 text-center bg-slate-50 rounded-lg border border-slate-200">
              Nenhum lacre adicionado (opcional)
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {lacres.map((l, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono"
                >
                  <span>{l}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveLacre(idx)}
                    className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ============================================================
            BLOCO 10: AUTORIZADOS DOWNLOAD
        ============================================================ */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
            <UserCheck className={`w-4 h-4 ${corText}`} />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">10. Autorizados para Download ({autorizadosDownload.length}/10)</h3>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            <input
              type="text"
              value={novoAutCNPJ}
              onChange={(e) => setNovoAutCNPJ(e.target.value.replace(/\D/g, ''))}
              placeholder="CNPJ (14 dígitos)"
              maxLength={14}
              className={`w-36 border border-slate-300 rounded-lg p-1.5 text-xs font-mono focus:outline-none focus:ring-2 ${corFocus}`}
            />
            <span className="text-xs text-slate-400 self-center">ou</span>
            <input
              type="text"
              value={novoAutCPF}
              onChange={(e) => setNovoAutCPF(e.target.value.replace(/\D/g, ''))}
              placeholder="CPF (11 dígitos)"
              maxLength={11}
              className={`w-32 border border-slate-300 rounded-lg p-1.5 text-xs font-mono focus:outline-none focus:ring-2 ${corFocus}`}
            />
            <button
              type="button"
              onClick={handleAddAutXML}
              className={`${corBgButton} text-white text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar</span>
            </button>
          </div>

          {autorizadosDownload.length === 0 ? (
            <div className="text-xs text-slate-500 p-2 text-center bg-slate-50 rounded-lg border border-slate-200">
              Nenhum autorizado para download (opcional)
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {autorizadosDownload.map((a, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs font-mono"
                >
                  <span>{a.cnpj ? formatarCpfCnpj(a.cnpj) : a.cpf ? formatarCpfCnpj(a.cpf) : ''}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAutXML(idx)}
                    className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ============================================================
            BLOCO 11: INFORMAÇÕES ADICIONAIS
        ============================================================ */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
            <Info className={`w-4 h-4 ${corText}`} />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">11. Informações Adicionais</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-medium text-slate-600 mb-1">Informações de interesse do Fisco</label>
              <textarea
                rows={2}
                value={infAdFisco}
                onChange={(e) => setInfAdFisco(e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus} resize-none`}
                placeholder="Norma referenciada, informações complementares..."
                maxLength={2000}
              />
              <span className="text-[10px] text-slate-400">{infAdFisco.length}/2000</span>
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">Informações complementares de interesse do contribuinte</label>
              <textarea
                rows={2}
                value={infCpl}
                onChange={(e) => setInfCpl(e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus} resize-none`}
                placeholder="Observações gerais..."
                maxLength={5000}
              />
              <span className="text-[10px] text-slate-400">{infCpl.length}/5000</span>
            </div>
          </div>
        </div>

        {/* ============================================================
            BOTÃO TRANSMITIR
        ============================================================ */}
        <button
          type="button"
          onClick={handleTransmitirMdfe}
          disabled={isTransmitting}
          className={`w-full ${corBgButton} disabled:bg-slate-300 text-white font-bold text-xs py-3 px-4 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50`}
        >
          {isTransmitting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Transmitindo MDF-e...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>EMITIR & AUTORIZAR MDF-e (MODELO 58)</span>
            </>
          )}
        </button>

      </div>

      {/* MODAL DE CONFIRMAÇÃO */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        type="warning"
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Confirmar Emissão"
        cancelText="Cancelar"
        loading={confirmModal.loading}
      />

    </div>
  );
};