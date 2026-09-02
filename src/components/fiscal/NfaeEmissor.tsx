// src/components/fiscal/NfaeEmissor.tsx

import React, { useState } from 'react';
import { 
  FileBadge2, Send, CheckCircle2, AlertTriangle, Eye, Download,
  User, Building, Package, Calculator, Shield, FileText,
  Plus, Trash2, Hash, Calendar, Clock, DollarSign,
  Zap, Gauge, Users, Home, MapPin, Phone, Mail,
  CreditCard, Receipt, Layers, Info, QrCode, Barcode,
  XCircle, RefreshCw, Edit2
} from 'lucide-react';
import { NFAeDocumento, ItemNfae } from '../../types/fiscal';
import { ClienteFornecedor, ConfiguracaoEmpresa, Produto } from '../../types/erp';
import { StorageService } from '../../utils/storage';
import { formatarMoeda, formatarCpfCnpj, validarCpfOuCnpj, limparDocumento } from '../../utils/cpfCnpjValidator';
import { gerarChaveAcessoNFe } from '../../utils/chaveAcesso';
import { nfaeService } from '../../services/nfae.service';
import { useToast } from '../../hooks/useToast';

interface NfaeEmissorProps {
  empresa: ConfiguracaoEmpresa;
  clientes: ClienteFornecedor[];
  produtos: Produto[];
  onNfaeEmitida: (nfae: NFAeDocumento) => void;
  onViewDanfae: (nfae: NFAeDocumento) => void;
}

type MotivoEmissaoNFAe = 'PRODUTOR_RURAL' | 'MEI_SEM_IE' | 'PF_ATIVO_PESSOAL' | 'FEIRAS_EVENTOS' | 'DEVOLUCAO_AVULSA' | 'OUTROS';
type TipoPessoa = 'PF' | 'PJ';

export const NfaeEmissor: React.FC<NfaeEmissorProps> = ({
  empresa,
  clientes,
  produtos,
  onNfaeEmitida,
  onViewDanfae,
}) => {
  const toast = useToast();

  // ============================================================
  // STATE - TODOS OS CAMPOS ZERADOS
  // ============================================================

  // 1. IDENTIFICAÇÃO
  const [serie, setSerie] = useState<number>(900);
  const [tpAmb, setTpAmb] = useState<string>('1');
  const [tpEmis, setTpEmis] = useState<string>('1');
  const [naturezaOperacao, setNaturezaOperacao] = useState<string>('');
  const [motivoEmissao, setMotivoEmissao] = useState<MotivoEmissaoNFAe>('PRODUTOR_RURAL');
  const [descricaoMotivo, setDescricaoMotivo] = useState<string>('');

  // 2. REQUERENTE (EMITENTE AVULSO)
  const [selectedRequerenteId, setSelectedRequerenteId] = useState<string>('');
  const [requerenteTipoPessoa, setRequerenteTipoPessoa] = useState<TipoPessoa>('PF');
  const [requerenteDoc, setRequerenteDoc] = useState<string>('');
  const [requerenteNome, setRequerenteNome] = useState<string>('');
  const [requerenteInscricaoProdutor, setRequerenteInscricaoProdutor] = useState<string>('');
  const [requerenteLogradouro, setRequerenteLogradouro] = useState<string>('');
  const [requerenteNumero, setRequerenteNumero] = useState<string>('');
  const [requerenteComplemento, setRequerenteComplemento] = useState<string>('');
  const [requerenteBairro, setRequerenteBairro] = useState<string>('');
  const [requerenteMun, setRequerenteMun] = useState<string>('');
  const [requerenteMunIbge, setRequerenteMunIbge] = useState<string>('');
  const [requerenteUf, setRequerenteUf] = useState<string>('');
  const [requerenteCep, setRequerenteCep] = useState<string>('');
  const [requerenteTelefone, setRequerenteTelefone] = useState<string>('');
  const [requerenteEmail, setRequerenteEmail] = useState<string>('');

  // 3. DESTINATÁRIO
  const [selectedDestinatarioId, setSelectedDestinatarioId] = useState<string>('');
  const [destinatarioTipoPessoa, setDestinatarioTipoPessoa] = useState<TipoPessoa>('PJ');
  const [destinatarioDoc, setDestinatarioDoc] = useState<string>('');
  const [destinatarioNome, setDestinatarioNome] = useState<string>('');
  const [destinatarioIE, setDestinatarioIE] = useState<string>('');
  const [destinatarioLogradouro, setDestinatarioLogradouro] = useState<string>('');
  const [destinatarioNumero, setDestinatarioNumero] = useState<string>('');
  const [destinatarioComplemento, setDestinatarioComplemento] = useState<string>('');
  const [destinatarioBairro, setDestinatarioBairro] = useState<string>('');
  const [destinatarioMun, setDestinatarioMun] = useState<string>('');
  const [destinatarioMunIbge, setDestinatarioMunIbge] = useState<string>('');
  const [destinatarioUf, setDestinatarioUf] = useState<string>('');
  const [destinatarioCep, setDestinatarioCep] = useState<string>('');
  const [destinatarioTelefone, setDestinatarioTelefone] = useState<string>('');
  const [destinatarioEmail, setDestinatarioEmail] = useState<string>('');

  // 4. PRODUTOS / INSUMOS
  const [itens, setItens] = useState<ItemNfae[]>([]);
  const [selectedProdutoId, setSelectedProdutoId] = useState<string>('');
  const [quantidadeItem, setQuantidadeItem] = useState<number>(1);
  const [valorUnitarioItem, setValorUnitarioItem] = useState<number>(0);

  // 5. TRIBUTAÇÃO
  const [aliquotaICMS, setAliquotaICMS] = useState<number>(0);
  const [baseCalculoICMS, setBaseCalculoICMS] = useState<number>(0);
  const [valorICMS, setValorICMS] = useState<number>(0);

  // 6. DAE - GUIA DE ARRECADAÇÃO
  const [numeroDAE, setNumeroDAE] = useState<string>('');
  const [codigoBarrasDAE, setCodigoBarrasDAE] = useState<string>('');
  const [chavePixDAE, setChavePixDAE] = useState<string>('');
  const [dataVencimentoDAE, setDataVencimentoDAE] = useState<string>('');
  const [valorDAE, setValorDAE] = useState<number>(0);
  const [statusPagamentoDAE, setStatusPagamentoDAE] = useState<'PAGO' | 'AGUARDANDO_PAGAMENTO' | 'ISENTO'>('AGUARDANDO_PAGAMENTO');

  // 7. ORGÃO EMISSOR
  const [orgaoEmissor, setOrgaoEmissor] = useState<string>('');

  // 8. OBSERVAÇÕES
  const [observacoes, setObservacoes] = useState<string>('');

  // UI
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);
  const [erros, setErros] = useState<string[]>([]);
  const [sucessoNfae, setSucessoNfae] = useState<NFAeDocumento | null>(null);

  // ============================================================
  // CÁLCULOS
  // ============================================================
  const totalProdutos = itens.reduce((acc, item) => acc + item.valorTotal, 0);
  const valorTotalNota = totalProdutos;

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleSelectRequerente = (clienteId: string) => {
    setSelectedRequerenteId(clienteId);
    if (!clienteId) return;
    const cli = clientes.find(c => c.id === clienteId);
    if (cli) {
      setRequerenteDoc(cli.documento);
      setRequerenteNome(cli.razaoSocial);
      setRequerenteTipoPessoa(cli.documento.replace(/\D/g, '').length === 11 ? 'PF' : 'PJ');
      setRequerenteLogradouro(cli.endereco.logradouro);
      setRequerenteNumero(cli.endereco.numero);
      setRequerenteComplemento(cli.endereco.complemento || '');
      setRequerenteBairro(cli.endereco.bairro);
      setRequerenteMun(cli.endereco.nomeMunicipio);
      setRequerenteMunIbge(cli.endereco.codigoMunicipio);
      setRequerenteUf(cli.endereco.uf);
      setRequerenteCep(cli.endereco.cep);
      setRequerenteTelefone(cli.telefone || '');
      setRequerenteEmail(cli.email || '');
    }
  };

  const handleSelectDestinatario = (clienteId: string) => {
    setSelectedDestinatarioId(clienteId);
    if (!clienteId) return;
    const cli = clientes.find(c => c.id === clienteId);
    if (cli) {
      setDestinatarioDoc(cli.documento);
      setDestinatarioNome(cli.razaoSocial);
      setDestinatarioTipoPessoa(cli.documento.replace(/\D/g, '').length === 11 ? 'PF' : 'PJ');
      setDestinatarioIE(cli.inscricaoEstadual || '');
      setDestinatarioLogradouro(cli.endereco.logradouro);
      setDestinatarioNumero(cli.endereco.numero);
      setDestinatarioComplemento(cli.endereco.complemento || '');
      setDestinatarioBairro(cli.endereco.bairro);
      setDestinatarioMun(cli.endereco.nomeMunicipio);
      setDestinatarioMunIbge(cli.endereco.codigoMunicipio);
      setDestinatarioUf(cli.endereco.uf);
      setDestinatarioCep(cli.endereco.cep);
      setDestinatarioTelefone(cli.telefone || '');
      setDestinatarioEmail(cli.email || '');
    }
  };

  const adicionarItem = () => {
    if (!selectedProdutoId) {
      toast.showWarning('Selecione um produto');
      return;
    }
    if (quantidadeItem <= 0) {
      toast.showWarning('Quantidade deve ser maior que zero');
      return;
    }

    const prod = produtos.find(p => p.id === selectedProdutoId);
    if (!prod) return;

    const valorUnit = valorUnitarioItem > 0 ? valorUnitarioItem : prod.precoVenda;
    const total = quantidadeItem * valorUnit;
    const icms = (total * (aliquotaICMS || prod.aliquotaICMS || 0)) / 100;

    const novoItem: ItemNfae = {
      id: `item-${Date.now()}`,
      codigo: prod.codigo,
      descricao: prod.descricao,
      ncm: prod.ncm,
      unidade: prod.unidade,
      quantidade: quantidadeItem,
      valorUnitario: valorUnit,
      valorTotal: total,
      aliquotaICMS: aliquotaICMS || prod.aliquotaICMS || 0,
      valorICMS: icms,
    };

    setItens(prev => [...prev, novoItem]);
    setSelectedProdutoId('');
    setQuantidadeItem(1);
    setValorUnitarioItem(0);
  };

  const removerItem = (index: number) => {
    setItens(prev => prev.filter((_, i) => i !== index));
  };

  const atualizarItem = (index: number, campo: string, valor: any) => {
    setItens(prev => prev.map((item, i) => {
      if (i === index) {
        const updated = { ...item, [campo]: valor };
        if (campo === 'quantidade' || campo === 'valorUnitario') {
          const qtd = campo === 'quantidade' ? valor : item.quantidade;
          const vUnit = campo === 'valorUnitario' ? valor : item.valorUnitario;
          updated.valorTotal = qtd * vUnit;
          updated.valorICMS = (updated.valorTotal * updated.aliquotaICMS) / 100;
        }
        return updated;
      }
      return item;
    }));
  };

  // ============================================================
  // VALIDAÇÃO
  // ============================================================
  const validarNfae = (): boolean => {
    const errs: string[] = [];

    if (!requerenteDoc || !requerenteNome) {
      errs.push('1. Informe os dados do Requerente (emitente avulso).');
    }
    if (!destinatarioDoc || !destinatarioNome) {
      errs.push('2. Informe os dados do Destinatário.');
    }
    if (itens.length === 0) {
      errs.push('3. Adicione pelo menos um produto/insumo.');
    }
    if (!naturezaOperacao.trim()) {
      errs.push('4. Informe a Natureza da Operação.');
    }
    if (!motivoEmissao) {
      errs.push('5. Selecione o Motivo da Emissão.');
    }
    if (totalProdutos <= 0) {
      errs.push('6. O valor total dos produtos deve ser maior que zero.');
    }

    setErros(errs);
    return errs.length === 0;
  };

  // ============================================================
  // TRANSMISSÃO
  // ============================================================
  const handleTransmitirNfae = async () => {
    if (!validarNfae()) return;

    setIsTransmitting(true);
    setErros([]);

    try {
      const numero = Math.floor(100 + Math.random() * 900);
      const aamm = new Date().toISOString().slice(2, 4) + new Date().toISOString().slice(5, 7);

      const chaveData = gerarChaveAcessoNFe({
        codigoUf: requerenteMunIbge.slice(0, 2) || '35',
        anoMes: aamm,
        cnpjEmitente: empresa.cnpj,
        modelo: '63',
        serie: serie || 900,
        numero,
        tipoEmissao: 1,
      });

      const docDestLimpo = limparDocumento(destinatarioDoc);
      const isCnpjDest = docDestLimpo.length === 14;

      const novaNfae: any = {
        modelo: '63',
        serie: serie || 900,
        numero,
        chaveAcesso: chaveData.chaveCompleta,
        dataHoraEmissao: new Date().toISOString(),
        naturezaOperacao,
        motivoEmissao,
        descricaoMotivo: descricaoMotivo || motivoEmissao,
        ambiente: parseInt(tpAmb) || 1,
        tipoEmissao: parseInt(tpEmis) || 1,
        status: 'AUTORIZADA',
        requerente: {
          tipoPessoa: requerenteTipoPessoa,
          documento: requerenteDoc,
          nome: requerenteNome,
          inscricaoProdutor: requerenteInscricaoProdutor || undefined,
          logradouro: requerenteLogradouro,
          numero: requerenteNumero,
          complemento: requerenteComplemento || '',
          bairro: requerenteBairro,
          municipio: requerenteMun,
          municipioIbge: requerenteMunIbge,
          uf: requerenteUf,
          cep: requerenteCep,
          telefone: requerenteTelefone || '',
          email: requerenteEmail || '',
        },
        destinatario: {
          tipoPessoa: isCnpjDest ? 'PJ' : 'PF',
          documento: destinatarioDoc,
          nome: destinatarioNome,
          ie: destinatarioIE || 'ISENTO',
          logradouro: destinatarioLogradouro,
          numero: destinatarioNumero,
          complemento: destinatarioComplemento || '',
          bairro: destinatarioBairro,
          municipio: destinatarioMun,
          municipioIbge: destinatarioMunIbge,
          uf: destinatarioUf,
          cep: destinatarioCep,
          telefone: destinatarioTelefone || '',
          email: destinatarioEmail || '',
        },
        itens,
        valorTotalProdutos: totalProdutos,
        baseCalculoICMS: baseCalculoICMS || totalProdutos,
        aliquotaICMSMediana: aliquotaICMS || 0,
        valorTotalICMS: itens.reduce((acc, item) => acc + item.valorICMS, 0),
        valorTotalNota: totalProdutos,
        guiaDAE: {
          numero: numeroDAE || `DAE-${Date.now()}`,
          codigoBarras: codigoBarrasDAE || '00000000000000000000000000000000000',
          chavePix: chavePixDAE || '00000000000000000000000000000000000',
          vencimento: dataVencimentoDAE || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          valor: valorDAE || totalProdutos,
          status: statusPagamentoDAE,
        },
        orgaoEmissorSefaz: orgaoEmissor || 'SEFAZ/SP',
        protocoloAutorizacao: `1352600${Math.floor(1000000 + Math.random() * 9000000)}`,
        dataHoraAutorizacao: new Date().toISOString(),
        informacoesComplementares: observacoes || '',
        xmlAssinado: `<nfeProc versao="4.00"><NFe><infNFe Id="NFe${chaveData.chaveCompleta}" versao="4.00"><ide><cUF>${requerenteMunIbge.slice(0, 2) || '35'}</cUF><mod>63</mod><nNF>${numero}</nNF></ide></infNFe></NFe></nfeProc>`,
        empresaId: empresa.id,
        destinatarioId: selectedDestinatarioId,
      };

      const response = await nfaeService.emitir(novaNfae);

      if (response) {
        StorageService.addNfae(response);
        onNfaeEmitida(response);
        setSucessoNfae(response);
        toast.showSuccess(`✅ NFA-e Nº ${numero} emitida com sucesso!`);
      }

    } catch (error: any) {
      console.error('❌ Erro ao emitir NFA-e:', error);
      setErros([error.message || 'Falha ao emitir NFA-e.']);
      toast.showError(`❌ ${error.message || 'Falha ao emitir NFA-e'}`);
    } finally {
      setIsTransmitting(false);
    }
  };

  // ============================================================
  // CORES
  // ============================================================
  const cor = 'amber';
  const corBg = 'bg-amber-50';
  const corBorder = 'border-amber-200';
  const corText = 'text-amber-700';
  const corTextDark = 'text-amber-800';
  const corBgButton = 'bg-amber-600 hover:bg-amber-700';
  const corBgBadge = 'bg-amber-100';
  const corFocus = 'focus:ring-amber-500';
  const corIconBg = 'bg-amber-600';

  // ============================================================
  // RENDER - MESMO LAYOUT DO NFE (VERTICAL, SEM CÍRCULOS)
  // ============================================================
  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      
      {/* HEADER */}
      <div className={`${corBg} rounded-xl border ${corBorder} p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}>
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-8 h-8 ${corIconBg} rounded-lg flex items-center justify-center text-white shadow-sm`}>
              <FileBadge2 className="w-4 h-4" />
            </span>
            <h1 className="text-base font-bold text-slate-900">Emissão de NFA-e (Modelo 63)</h1>
            <span className={`${corBgBadge} ${corTextDark} text-[10px] font-bold px-2 py-0.5 rounded-full border ${corBorder}`}>
              Energia Elétrica
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Nota Fiscal Avulsa Eletrônica para fornecimento de energia elétrica.
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs font-semibold text-slate-700">Série {serie || 900}</div>
          <div className={`text-[10px] font-medium ${corText}`}>Próxima NFA-e: Nº {Math.floor(Math.random() * 900) + 100}</div>
        </div>
      </div>

      {/* BANNER SUCESSO */}
      {sucessoNfae && (
        <div className={`${corBg} border ${corBorder} rounded-xl p-4 shadow-sm animate-fadeIn`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className={`w-5 h-5 ${corText} shrink-0 mt-0.5`} />
              <div>
                <h3 className={`text-sm font-bold ${corTextDark}`}>
                  NFA-e Nº {sucessoNfae.numero} Autorizada!
                </h3>
                <p className="text-xs text-amber-800 font-mono mt-0.5">
                  Chave: {sucessoNfae.chaveAcesso}
                </p>
                <div className="text-[11px] text-amber-700 mt-1">
                  Requerente: {sucessoNfae.requerente?.nome} • Total: {formatarMoeda(sucessoNfae.valorTotalNota)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onViewDanfae(sucessoNfae)}
                className={`${corBgButton} text-white font-medium text-xs px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Visualizar DANFAE</span>
              </button>
              <button
                onClick={() => {
                  const blob = new Blob([sucessoNfae.xmlAssinado], { type: 'application/xml' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `NFAe_${sucessoNfae.numero}_SUP.xml`;
                  a.click();
                }}
                className="bg-white hover:bg-slate-100 text-slate-700 font-medium text-xs px-3 py-2 rounded-lg border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>XML</span>
              </button>
              <button
                onClick={() => setSucessoNfae(null)}
                className="text-xs text-slate-600 hover:text-slate-900 underline ml-2 cursor-pointer"
              >
                Nova NFA-e
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
            <span>Erros na NFA-e:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 pl-2">
            {erros.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ============================================================
          BLOCO 1: REQUERENTE
          ============================================================ */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <User className={`w-4 h-4 ${corText}`} />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">1. Requerente (Emitente Avulso)</h3>
          </div>
          <select
            value={selectedRequerenteId}
            onChange={(e) => handleSelectRequerente(e.target.value)}
            className={`text-xs bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 ${corFocus} font-medium text-slate-700 max-w-[200px]`}
          >
            <option value="">-- Escolher Cliente --</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>{c.razaoSocial}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2.5 text-xs">
          <div>
            <label className="block font-medium text-slate-600 mb-1">CPF / CNPJ *</label>
            <input
              type="text"
              value={requerenteDoc}
              onChange={(e) => setRequerenteDoc(e.target.value)}
              className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              placeholder="00.000.000/0000-00"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Razão Social / Nome *</label>
            <input
              type="text"
              value={requerenteNome}
              onChange={(e) => setRequerenteNome(e.target.value)}
              className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              placeholder="Nome ou Razão Social"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Inscrição Produtor Rural</label>
            <input
              type="text"
              value={requerenteInscricaoProdutor}
              onChange={(e) => setRequerenteInscricaoProdutor(e.target.value)}
              className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              placeholder="Inscrição do produtor"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-medium text-slate-600 mb-1">Município</label>
              <input
                type="text"
                value={requerenteMun}
                onChange={(e) => setRequerenteMun(e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                placeholder="Cidade"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">UF</label>
              <input
                type="text"
                value={requerenteUf}
                onChange={(e) => setRequerenteUf(e.target.value.toUpperCase())}
                className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus} uppercase`}
                maxLength={2}
                placeholder="SP"
              />
            </div>
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Logradouro</label>
            <input
              type="text"
              value={requerenteLogradouro}
              onChange={(e) => setRequerenteLogradouro(e.target.value)}
              className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              placeholder="Rua, Avenida..."
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-medium text-slate-600 mb-1">Número</label>
              <input
                type="text"
                value={requerenteNumero}
                onChange={(e) => setRequerenteNumero(e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                placeholder="123"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">Complemento</label>
              <input
                type="text"
                value={requerenteComplemento}
                onChange={(e) => setRequerenteComplemento(e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                placeholder="Complemento"
              />
            </div>
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Bairro</label>
            <input
              type="text"
              value={requerenteBairro}
              onChange={(e) => setRequerenteBairro(e.target.value)}
              className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              placeholder="Bairro"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">CEP</label>
            <input
              type="text"
              value={requerenteCep}
              onChange={(e) => setRequerenteCep(e.target.value)}
              className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              placeholder="00000-000"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-medium text-slate-600 mb-1">Telefone</label>
              <input
                type="text"
                value={requerenteTelefone}
                onChange={(e) => setRequerenteTelefone(e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                placeholder="(00) 0000-0000"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">E-mail</label>
              <input
                type="email"
                value={requerenteEmail}
                onChange={(e) => setRequerenteEmail(e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                placeholder="email@empresa.com"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          BLOCO 2: DESTINATÁRIO
          ============================================================ */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <Building className={`w-4 h-4 ${corText}`} />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">2. Destinatário</h3>
          </div>
          <select
            value={selectedDestinatarioId}
            onChange={(e) => handleSelectDestinatario(e.target.value)}
            className={`text-xs bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 ${corFocus} font-medium text-slate-700 max-w-[200px]`}
          >
            <option value="">-- Escolher Cliente --</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>{c.razaoSocial}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2.5 text-xs">
          <div>
            <label className="block font-medium text-slate-600 mb-1">CPF / CNPJ *</label>
            <input
              type="text"
              value={destinatarioDoc}
              onChange={(e) => setDestinatarioDoc(e.target.value)}
              className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              placeholder="00.000.000/0000-00"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Razão Social / Nome *</label>
            <input
              type="text"
              value={destinatarioNome}
              onChange={(e) => setDestinatarioNome(e.target.value)}
              className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              placeholder="Nome ou Razão Social"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Inscrição Estadual</label>
            <input
              type="text"
              value={destinatarioIE}
              onChange={(e) => setDestinatarioIE(e.target.value)}
              className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              placeholder="ISENTO ou número"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-medium text-slate-600 mb-1">Município</label>
              <input
                type="text"
                value={destinatarioMun}
                onChange={(e) => setDestinatarioMun(e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                placeholder="Cidade"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">UF</label>
              <input
                type="text"
                value={destinatarioUf}
                onChange={(e) => setDestinatarioUf(e.target.value.toUpperCase())}
                className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus} uppercase`}
                maxLength={2}
                placeholder="SP"
              />
            </div>
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Logradouro</label>
            <input
              type="text"
              value={destinatarioLogradouro}
              onChange={(e) => setDestinatarioLogradouro(e.target.value)}
              className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              placeholder="Rua, Avenida..."
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-medium text-slate-600 mb-1">Número</label>
              <input
                type="text"
                value={destinatarioNumero}
                onChange={(e) => setDestinatarioNumero(e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                placeholder="123"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">Complemento</label>
              <input
                type="text"
                value={destinatarioComplemento}
                onChange={(e) => setDestinatarioComplemento(e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                placeholder="Complemento"
              />
            </div>
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Bairro</label>
            <input
              type="text"
              value={destinatarioBairro}
              onChange={(e) => setDestinatarioBairro(e.target.value)}
              className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              placeholder="Bairro"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">CEP</label>
            <input
              type="text"
              value={destinatarioCep}
              onChange={(e) => setDestinatarioCep(e.target.value)}
              className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              placeholder="00000-000"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-medium text-slate-600 mb-1">Telefone</label>
              <input
                type="text"
                value={destinatarioTelefone}
                onChange={(e) => setDestinatarioTelefone(e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                placeholder="(00) 0000-0000"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">E-mail</label>
              <input
                type="email"
                value={destinatarioEmail}
                onChange={(e) => setDestinatarioEmail(e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                placeholder="email@empresa.com"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          BLOCO 3: IDENTIFICAÇÃO
          ============================================================ */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
          <Hash className={`w-4 h-4 ${corText}`} />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">3. Identificação</h3>
        </div>
        <div className="space-y-2.5 text-xs">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block font-medium text-slate-600 mb-1">Série</label>
              <input
                type="number"
                value={serie}
                onChange={(e) => setSerie(parseInt(e.target.value) || 900)}
                className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                min={900}
                max={999}
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">Motivo de Emissão</label>
              <select
                value={motivoEmissao}
                onChange={(e) => setMotivoEmissao(e.target.value as MotivoEmissaoNFAe)}
                className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              >
                <option value="PRODUTOR_RURAL">Produtor Rural</option>
                <option value="MEI_SEM_IE">MEI sem IE</option>
                <option value="PF_ATIVO_PESSOAL">PF com Atividade Pessoal</option>
                <option value="FEIRAS_EVENTOS">Feiras e Eventos</option>
                <option value="DEVOLUCAO_AVULSA">Devolução Avulsa</option>
                <option value="OUTROS">Outros</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">Natureza da Operação</label>
              <input
                type="text"
                value={naturezaOperacao}
                onChange={(e) => setNaturezaOperacao(e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                placeholder="Fornecimento de Energia"
              />
            </div>
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Descrição do Motivo</label>
            <textarea
              rows={2}
              value={descricaoMotivo}
              onChange={(e) => setDescricaoMotivo(e.target.value)}
              className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus} resize-none`}
              placeholder="Detalhamento do motivo da emissão avulsa..."
            />
          </div>
        </div>
      </div>

      {/* ============================================================
          BLOCO 4: PRODUTOS/INSUMOS
          ============================================================ */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <Package className={`w-4 h-4 ${corText}`} />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">4. Produtos / Insumos ({itens.length})</h3>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.001"
              value={quantidadeItem || ''}
              onChange={(e) => setQuantidadeItem(parseFloat(e.target.value) || 1)}
              className={`w-20 border border-slate-300 rounded-lg p-1 focus:outline-none focus:ring-2 ${corFocus} text-xs`}
              placeholder="Qtd"
            />
            <input
              type="number"
              step="0.01"
              value={valorUnitarioItem || ''}
              onChange={(e) => setValorUnitarioItem(parseFloat(e.target.value) || 0)}
              className={`w-24 border border-slate-300 rounded-lg p-1 focus:outline-none focus:ring-2 ${corFocus} text-xs`}
              placeholder="V. Unit"
            />
            <select
              value={selectedProdutoId}
              onChange={(e) => setSelectedProdutoId(e.target.value)}
              className={`text-xs bg-white border border-slate-300 rounded-lg p-1 focus:outline-none focus:ring-2 ${corFocus} min-w-[150px]`}
            >
              <option value="">Selecione...</option>
              {produtos.map(p => (
                <option key={p.id} value={p.id}>{p.codigo} - {p.descricao.slice(0, 20)}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={adicionarItem}
              disabled={!selectedProdutoId}
              className={`${corBgButton} text-white text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar</span>
            </button>
          </div>
        </div>

        {itens.length === 0 ? (
          <div className="p-6 border-2 border-dashed border-slate-200 rounded-lg text-center bg-slate-50/70">
            <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">Nenhum produto adicionado</p>
            <p className="text-[11px] text-slate-500">Selecione um produto no botão acima</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {itens.map((item, idx) => (
              <div key={item.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 text-sm">{item.descricao}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Cód: {item.codigo} | NCM: {item.ncm} | UN: {item.unidade}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removerItem(idx)}
                    className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-3 pt-2 border-t border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Qtd:</span>
                    <input
                      type="number"
                      step="0.001"
                      value={item.quantidade}
                      onChange={(e) => atualizarItem(idx, 'quantidade', parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-300 rounded p-1 font-bold text-slate-900 text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">V. Unitário:</span>
                    <input
                      type="number"
                      step="0.01"
                      value={item.valorUnitario}
                      onChange={(e) => atualizarItem(idx, 'valorUnitario', parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-300 rounded p-1 font-bold text-slate-900 text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">ICMS:</span>
                    <span className="font-medium text-amber-700 block mt-1.5">{formatarMoeda(item.valorICMS)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Total:</span>
                    <span className="font-bold text-slate-900 block mt-1.5">{formatarMoeda(item.valorTotal)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============================================================
          BLOCO 5: TRIBUTAÇÃO E DAE
          ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
            <Shield className={`w-4 h-4 ${corText}`} />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">5. Tributação ICMS</h3>
          </div>
          <div className="space-y-2.5 text-xs">
            <div>
              <label className="block font-medium text-slate-600 mb-1">Alíquota ICMS (%)</label>
              <input
                type="number"
                step="0.01"
                value={aliquotaICMS || ''}
                onChange={(e) => setAliquotaICMS(parseFloat(e.target.value) || 0)}
                className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                placeholder="12.00"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">Base de Cálculo (R$)</label>
              <input
                type="number"
                step="0.01"
                value={baseCalculoICMS || ''}
                onChange={(e) => setBaseCalculoICMS(parseFloat(e.target.value) || 0)}
                className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus} font-bold`}
                placeholder="0,00"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">Valor ICMS (R$)</label>
              <input
                type="number"
                step="0.01"
                value={valorICMS || ''}
                onChange={(e) => setValorICMS(parseFloat(e.target.value) || 0)}
                className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus} font-bold`}
                placeholder="0,00"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
            <Barcode className={`w-4 h-4 ${corText}`} />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">6. Guia DAE</h3>
          </div>
          <div className="space-y-2.5 text-xs">
            <div>
              <label className="block font-medium text-slate-600 mb-1">Número da Guia DAE</label>
              <input
                type="text"
                value={numeroDAE}
                onChange={(e) => setNumeroDAE(e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus} font-mono`}
                placeholder="DAE-000000"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-medium text-slate-600 mb-1">Vencimento</label>
                <input
                  type="date"
                  value={dataVencimentoDAE}
                  onChange={(e) => setDataVencimentoDAE(e.target.value)}
                  className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={valorDAE || ''}
                  onChange={(e) => setValorDAE(parseFloat(e.target.value) || 0)}
                  className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus} font-bold`}
                  placeholder="0,00"
                />
              </div>
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">Status</label>
              <select
                value={statusPagamentoDAE}
                onChange={(e) => setStatusPagamentoDAE(e.target.value as any)}
                className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              >
                <option value="AGUARDANDO_PAGAMENTO">Aguardando Pagamento</option>
                <option value="PAGO">Pago</option>
                <option value="ISENTO">Isento</option>
              </select>
            </div>
          </div>
        </div>

      </div>

      {/* ============================================================
          BLOCO 6: ÓRGÃO EMISSOR E OBSERVAÇÕES
          ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
            <Building className={`w-4 h-4 ${corText}`} />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">7. Órgão Emissor</h3>
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">SEFAZ Emissora</label>
            <input
              type="text"
              value={orgaoEmissor}
              onChange={(e) => setOrgaoEmissor(e.target.value)}
              className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              placeholder="SEFAZ/SP"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
            <FileText className={`w-4 h-4 ${corText}`} />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">8. Observações</h3>
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Informações Complementares</label>
            <textarea
              rows={3}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus} resize-none`}
              placeholder="Observações complementares..."
            />
          </div>
        </div>

      </div>

      {/* ============================================================
          BLOCO 7: TOTAIS E AÇÕES
          ============================================================ */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
          <DollarSign className={`w-4 h-4 ${corText}`} />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">9. Totais e Ações</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-4">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-slate-500 block">Total Produtos</span>
            <span className="text-lg font-bold text-slate-900">{formatarMoeda(totalProdutos)}</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-slate-500 block">Total ICMS</span>
            <span className="text-lg font-bold text-amber-700">{formatarMoeda(itens.reduce((acc, item) => acc + item.valorICMS, 0))}</span>
          </div>
          <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-3 rounded-lg text-white">
            <span className="text-amber-100 block">Total da NFA-e</span>
            <span className="text-lg font-bold text-white">{formatarMoeda(valorTotalNota)}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleTransmitirNfae}
          disabled={isTransmitting || itens.length === 0}
          id="btn-emitir-nfae"
          className={`w-full ${corBgButton} disabled:bg-slate-300 text-white text-sm font-bold py-3 px-4 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50`}
        >
          {isTransmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Transmitindo NFA-e...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>EMITIR & AUTORIZAR NFA-e (MODELO 63)</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};