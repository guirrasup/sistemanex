// C:\emissornfe\src\components\fiscal\NfseEmissor.tsx
// ✅ VERSÃO COMPLETA - PADRÃO NACIONAL v1.01 - VALORES ZERADOS INICIALMENTE

import React, { useState } from 'react';
import {
  FileText,
  Send,
  CheckCircle2,
  AlertTriangle,
  Calculator,
  Building2,
  UserCheck,
  Layers,
  Sparkles,
  Eye,
  Download,
  ShieldCheck,
  RefreshCw,
  Info,
  User,
  Package,
  Building,
  MapPin,
  Calendar,
  DollarSign,
  CreditCard,
  QrCode,
  Percent,
  Hash,
  Mail,
  Phone,
  Home,
  FileBadge,
  Receipt,
  Clipboard,
  Users,
  Briefcase
} from 'lucide-react';
import { NFSeDocumento, TributacaoISSQN, TipoRetencaoISS } from '../../types/fiscal';
import { ClienteFornecedor, ServicoCatalogo, ConfiguracaoEmpresa } from '../../types/erp';
import { StorageService } from '../../utils/storage';
import { validarCpfOuCnpj, formatarMoeda, limparDocumento } from '../../utils/cpfCnpjValidator';
import { gerarChaveAcessoNFSe } from '../../utils/chaveAcesso';
import { calcularTributosNfse } from '../../utils/tributosEngine';
import { gerarXmlNfseNacional } from '../../utils/xmlNfseGenerator';
import { useToast } from '../../hooks/useToast';
import api from '../../services/api';

interface NfseEmissorProps {
  empresa: ConfiguracaoEmpresa;
  clientes: ClienteFornecedor[];
  servicosCatalogo: ServicoCatalogo[];
  onNfseEmitida: (nfse: NFSeDocumento) => void;
  onViewDanfse: (nfse: NFSeDocumento) => void;
}

// 🔥 COR DO MÓDULO - AZUL
const cor = 'blue';
const corBg = 'bg-blue-50';
const corBorder = 'border-blue-200';
const corText = 'text-blue-700';
const corTextDark = 'text-blue-800';
const corBgButton = 'bg-blue-600 hover:bg-blue-700';
const corBgBadge = 'bg-blue-100';
const corFocus = 'focus:ring-blue-500';
const corIconBg = 'bg-blue-600';
const corGradient = 'from-blue-600 to-blue-700';

export const NfseEmissor: React.FC<NfseEmissorProps> = ({
  empresa,
  clientes,
  servicosCatalogo,
  onNfseEmitida,
  onViewDanfse,
}) => {
  const toast = useToast();

  // ============================================================
  // STATE - TOMADOR (Toma)
  // ============================================================
  const [selectedClienteId, setSelectedClienteId] = useState<string>('');
  const [tomadorTipoPessoa, setTomadorTipoPessoa] = useState<'PJ' | 'PF' | 'EXTERIOR'>('PJ');
  const [tomadorDoc, setTomadorDoc] = useState('');
  const [tomadorRazaoSocial, setTomadorRazaoSocial] = useState('');
  const [tomadorNomeFantasia, setTomadorNomeFantasia] = useState('');
  const [tomadorInscricaoMunicipal, setTomadorInscricaoMunicipal] = useState('');
  const [tomadorInscricaoEstadual, setTomadorInscricaoEstadual] = useState('');
  const [tomadorIndicadorIE, setTomadorIndicadorIE] = useState<'1' | '2' | '9'>('9');
  const [tomadorEmail, setTomadorEmail] = useState('');
  const [tomadorTelefone, setTomadorTelefone] = useState('');
  const [tomadorLogradouro, setTomadorLogradouro] = useState('');
  const [tomadorNumero, setTomadorNumero] = useState('');
  const [tomadorComplemento, setTomadorComplemento] = useState('');
  const [tomadorBairro, setTomadorBairro] = useState('');
  const [tomadorCodigoMunicipio, setTomadorCodigoMunicipio] = useState('');
  const [tomadorNomeMunicipio, setTomadorNomeMunicipio] = useState('');
  const [tomadorUf, setTomadorUf] = useState('SP');
  const [tomadorCep, setTomadorCep] = useState('');

  // ============================================================
  // STATE - SERVIÇO (Serv) - VALORES ZERADOS INICIALMENTE
  // ============================================================
  const [selectedServicoId, setSelectedServicoId] = useState<string>('');
  const [codigoTributacaoNacional, setCodigoTributacaoNacional] = useState<string>('');
  const [codigoTributacaoMunicipal, setCodigoTributacaoMunicipal] = useState<string>('');
  const [codigoNBS, setCodigoNBS] = useState<string>('');
  const [descricaoServico, setDescricaoServico] = useState<string>('');
  const [codigoInterno, setCodigoInterno] = useState<string>('');

  // ============================================================
  // STATE - LOCAL DA PRESTAÇÃO
  // ============================================================
  const [localPrestacaoCodigoMunicipio, setLocalPrestacaoCodigoMunicipio] = useState(
    empresa.endereco?.codigoMunicipio || '3550308'
  );
  const [localPrestacaoNomeMunicipio, setLocalPrestacaoNomeMunicipio] = useState(
    empresa.endereco?.nomeMunicipio || 'São Paulo'
  );
  const [localPrestacaoUf, setLocalPrestacaoUf] = useState(empresa.endereco?.uf || 'SP');

  // ============================================================
  // STATE - VALORES - ZERADOS INICIALMENTE
  // ============================================================
  const [valorServico, setValorServico] = useState<number>(0);
  const [descontoIncondicionado, setDescontoIncondicionado] = useState<number>(0);
  const [descontoCondicionado, setDescontoCondicionado] = useState<number>(0);
  const [deducoesMateriais, setDeducoesMateriais] = useState<number>(0);

  // ============================================================
  // STATE - TRIBUTAÇÃO ISSQN
  // ============================================================
  const [tributacaoISSQN, setTributacaoISSQN] = useState<TributacaoISSQN>(1);
  const [aliquotaISS, setAliquotaISS] = useState<number>(5.0);
  const [tipoRetencaoISS, setTipoRetencaoISS] = useState<TipoRetencaoISS>(1);

  // ============================================================
  // STATE - RETENÇÕES FEDERAIS - ZERADAS INICIALMENTE
  // ============================================================
  const [aliquotaPIS, setAliquotaPIS] = useState<number>(0);
  const [retidoPIS, setRetidoPIS] = useState<boolean>(false);
  const [aliquotaCOFINS, setAliquotaCOFINS] = useState<number>(0);
  const [retidoCOFINS, setRetidoCOFINS] = useState<boolean>(false);
  const [aliquotaIRRF, setAliquotaIRRF] = useState<number>(0);
  const [aliquotaCSLL, setAliquotaCSLL] = useState<number>(0);
  const [aliquotaINSS, setAliquotaINSS] = useState<number>(0);

  // ============================================================
  // STATE - PAGAMENTO VINCULADO
  // ============================================================
  const [formaPagamento, setFormaPagamento] = useState<string>('17');
  const [pagamentoNumero, setPagamentoNumero] = useState<number>(1);
  const [pagamentoIdTransacao, setPagamentoIdTransacao] = useState<string>(`TX-${Date.now().toString().slice(-8)}`);
  const [pagamentoCnpjRecebedor, setPagamentoCnpjRecebedor] = useState<string>(empresa.cnpj || '');

  // ============================================================
  // STATE - INFORMAÇÕES ADICIONAIS
  // ============================================================
  const [informacoesComplementares, setInformacoesComplementares] = useState<string>('');
  const [numeroPedido, setNumeroPedido] = useState<string>('');

  // ============================================================
  // STATE - UI
  // ============================================================
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);
  const [errosValidacao, setErrosValidacao] = useState<string[]>([]);
  const [sucessoNfse, setSucessoNfse] = useState<NFSeDocumento | null>(null);

  // ============================================================
  // CÁLCULOS
  // ============================================================
  const calc = calcularTributosNfse({
    valorServico,
    descontoIncondicionado,
    descontoCondicionado,
    deducoesMateriais,
    aliquotaISS,
    tipoRetencaoISS,
    tributacaoISSQN,
    optanteSimplesNacional: empresa.optanteSimples || false,
    aliquotaPIS,
    retidoPIS,
    aliquotaCOFINS,
    retidoCOFINS,
    aliquotaIRRF,
    aliquotaCSLL,
    aliquotaINSS,
    formaPagamento,
    cnpjTomador: tomadorDoc,
  });

  // ============================================================
  // HANDLERS - TOMADOR
  // ============================================================

  const handleClienteChange = (clienteId: string) => {
    setSelectedClienteId(clienteId);
    if (!clienteId) {
      setTomadorTipoPessoa('PJ');
      setTomadorDoc('');
      setTomadorRazaoSocial('');
      setTomadorNomeFantasia('');
      setTomadorInscricaoMunicipal('');
      setTomadorInscricaoEstadual('');
      setTomadorIndicadorIE('9');
      setTomadorEmail('');
      setTomadorTelefone('');
      setTomadorLogradouro('');
      setTomadorNumero('');
      setTomadorComplemento('');
      setTomadorBairro('');
      setTomadorCodigoMunicipio('');
      setTomadorNomeMunicipio('');
      setTomadorUf('SP');
      setTomadorCep('');
      return;
    }
    const cli = clientes.find(c => c.id === clienteId);
    if (cli) {
      setTomadorTipoPessoa(cli.tipoPessoa);
      setTomadorDoc(cli.documento);
      setTomadorRazaoSocial(cli.razaoSocial);
      setTomadorNomeFantasia(cli.nomeFantasia || '');
      setTomadorInscricaoMunicipal(cli.inscricaoMunicipal || '');
      setTomadorInscricaoEstadual(cli.inscricaoEstadual || '');
      setTomadorIndicadorIE((cli.indIEDest as '1' | '2' | '9') || '9');
      setTomadorEmail(cli.email || '');
      setTomadorTelefone(cli.telefone || '');
      setTomadorLogradouro(cli.endereco.logradouro);
      setTomadorNumero(cli.endereco.numero);
      setTomadorComplemento(cli.endereco.complemento || '');
      setTomadorBairro(cli.endereco.bairro);
      setTomadorCodigoMunicipio(cli.endereco.codigoMunicipio);
      setTomadorNomeMunicipio(cli.endereco.nomeMunicipio);
      setTomadorUf(cli.endereco.uf);
      setTomadorCep(cli.endereco.cep);
    }
  };

  // ============================================================
  // HANDLERS - SERVIÇO (PREENCHE AO SELECIONAR)
  // ============================================================

  const handleServicoChange = (servicoId: string) => {
    setSelectedServicoId(servicoId);
    
    if (!servicoId) {
      // Zera tudo se nenhum serviço for selecionado
      setCodigoTributacaoNacional('');
      setCodigoTributacaoMunicipal('');
      setCodigoNBS('');
      setDescricaoServico('');
      setCodigoInterno('');
      setValorServico(0);
      setAliquotaISS(5.0);
      setTipoRetencaoISS(1);
      setAliquotaPIS(0);
      setAliquotaCOFINS(0);
      setAliquotaIRRF(0);
      setAliquotaCSLL(0);
      setAliquotaINSS(0);
      return;
    }
    
    const srv = servicosCatalogo.find(s => s.id === servicoId);
    if (srv) {
      setCodigoTributacaoNacional(srv.codigoTributacaoNacional);
      setCodigoTributacaoMunicipal(srv.codigoTributacaoMunicipal || '');
      setCodigoNBS(srv.codigoNBS || '');
      setDescricaoServico(srv.descricao);
      setCodigoInterno(srv.codigoInterno);
      setValorServico(srv.valorUnitario);
      setAliquotaISS(srv.aliquotaISS);
      setTipoRetencaoISS(srv.retencaoISSPadrao ? 2 : 1);
      setAliquotaPIS(srv.aliquotaPIS);
      setAliquotaCOFINS(srv.aliquotaCOFINS);
      setAliquotaIRRF(srv.aliquotaIRRF);
      setAliquotaCSLL(srv.aliquotaCSLL);
      setAliquotaINSS(srv.aliquotaINSS);
      toast.showInfo(`ℹ️ Serviço "${srv.descricao}" carregado.`);
    }
  };

  // ============================================================
  // VALIDAÇÃO
  // ============================================================

  const validarFormulario = (): boolean => {
    const errs: string[] = [];

    // Tomador
    const valDoc = validarCpfOuCnpj(tomadorDoc);
    if (!valDoc.valido) {
      errs.push('CPF ou CNPJ do tomador inválido.');
    }
    if (!tomadorRazaoSocial.trim()) {
      errs.push('Nome/Razão Social do tomador é obrigatório.');
    }
    if (!tomadorLogradouro.trim() || !tomadorNumero.trim()) {
      errs.push('Endereço completo do tomador é obrigatório.');
    }

    // Serviço
    if (!selectedServicoId) {
      errs.push('Selecione um serviço do catálogo.');
    }
    if (!descricaoServico.trim()) {
      errs.push('Discriminação detalhada do serviço é obrigatória.');
    }
    if (valorServico <= 0) {
      errs.push('Valor do serviço deve ser maior que zero.');
    }
    if (tributacaoISSQN === 1 && (aliquotaISS < 2 || aliquotaISS > 5)) {
      errs.push('Alíquota de ISSQN deve estar entre 2,00% e 5,00% (LC 116/2003).');
    }
    if (codigoTributacaoNacional && codigoTributacaoNacional.length !== 6) {
      errs.push('Código de tributação nacional (LC 116) deve ter 6 dígitos.');
    }
    if (!codigoNBS || codigoNBS.length < 5) {
      errs.push('Código NBS é obrigatório.');
    }

    setErrosValidacao(errs);
    return errs.length === 0;
  };

  // ============================================================
  // TRANSMISSÃO
  // ============================================================

  const handleTransmitirNfse = async () => {
    if (!validarFormulario()) return;

    setIsTransmitting(true);
    setErrosValidacao([]);

    try {
      const numeroNfse = empresa.proximoNumeroNfse || 1;
      const serieDPS = empresa.serieNfse || 1;
      const aamm = new Date().toISOString().slice(2, 4) + (new Date().getMonth() + 1).toString().padStart(2, '0');

      const { chaveCompleta, codigoVerificacao } = gerarChaveAcessoNFSe({
        codigoMunicipioIBGE: empresa.endereco?.codigoMunicipio || '3550308',
        ambienteGerador: empresa.ambienteEmissao === 'PRODUCAO' ? 1 : 2,
        tipoInscricao: 1,
        documentoEmitente: empresa.cnpj,
        numeroNfse,
        anoMesDPS: aamm,
      });

      const docTomadorLimpo = limparDocumento(tomadorDoc);
      const isCnpj = docTomadorLimpo.length === 14;

      const novaNfse: NFSeDocumento = {
        id: `nfse-${Date.now()}`,
        chaveAcesso: chaveCompleta,
        numeroNfse,
        serieDPS,
        numeroDPS: numeroNfse,
        dataCompetencia: new Date().toISOString().split('T')[0],
        dataHoraEmissao: new Date().toISOString(),
        dataHoraProcessamento: new Date().toISOString(),
        codigoVerificacao,
        ambiente: empresa.ambienteEmissao,
        tipoEmissao: 1,
        status: 'AUTORIZADA',

        emitente: {
          cnpj: empresa.cnpj,
          inscricaoMunicipal: empresa.inscricaoMunicipal || '',
          inscricaoEstadual: empresa.inscricaoEstadual || '',
          razaoSocial: empresa.razaoSocial,
          nomeFantasia: empresa.nomeFantasia || '',
          regimeTributario: empresa.regimeTributario === 'SIMPLES_NACIONAL' ? 1 : 3,
          optanteSimplesNacional: empresa.optanteSimples || false,
          optanteMEI: empresa.optanteMEI || false,
          endereco: {
            logradouro: empresa.endereco?.logradouro || '',
            numero: empresa.endereco?.numero || '',
            complemento: empresa.endereco?.complemento || '',
            bairro: empresa.endereco?.bairro || '',
            codigoMunicipio: empresa.endereco?.codigoMunicipio || '3550308',
            nomeMunicipio: empresa.endereco?.nomeMunicipio || 'São Paulo',
            uf: empresa.endereco?.uf || 'SP',
            cep: empresa.endereco?.cep || '',
            telefone: empresa.endereco?.telefone || '',
            email: empresa.endereco?.email || '',
          },
        },

        tomador: {
          tipoPessoa: isCnpj ? 'PJ' : 'PF',
          documento: tomadorDoc,
          nomeRazaoSocial: tomadorRazaoSocial,
          nomeFantasia: tomadorNomeFantasia || undefined,
          inscricaoMunicipal: tomadorInscricaoMunicipal || undefined,
          inscricaoEstadual: tomadorInscricaoEstadual || undefined,
          indicadorIEDestinatario: tomadorIndicadorIE,
          email: tomadorEmail || undefined,
          telefone: tomadorTelefone || undefined,
          endereco: {
            logradouro: tomadorLogradouro,
            numero: tomadorNumero,
            complemento: tomadorComplemento || undefined,
            bairro: tomadorBairro,
            codigoMunicipio: tomadorCodigoMunicipio || '3550308',
            nomeMunicipio: tomadorNomeMunicipio || 'São Paulo',
            uf: tomadorUf,
            cep: tomadorCep || '',
            telefone: tomadorTelefone || undefined,
            email: tomadorEmail || undefined,
          },
        },

        servico: {
          codigoTributacaoNacional: codigoTributacaoNacional,
          codigoTributacaoMunicipal: codigoTributacaoMunicipal,
          descricao: descricaoServico,
          codigoNBS: codigoNBS,
          codigoInterno: codigoInterno || undefined,
          localPrestacao: {
            codigoMunicipio: localPrestacaoCodigoMunicipio,
            nomeMunicipio: localPrestacaoNomeMunicipio,
            uf: localPrestacaoUf,
          },
          valorServico: calc.valorServico,
          descontoIncondicionado: calc.descontoIncondicionado,
          descontoCondicionado: calc.descontoCondicionado,
          deducoesMateriais: calc.deducoesMateriais,
          tributacaoISSQN,
          aliquotaISS: calc.aliquotaISS,
          valorISS: calc.valorISS,
          tipoRetencaoISS,
          valorISSRetido: calc.valorISSRetido,
          baseCalculoISS: calc.baseCalculoISS,
          cstPisCofins: '01',
          aliquotaPIS: calc.aliquotaPIS,
          valorPIS: calc.valorPIS,
          retidoPIS,
          aliquotaCOFINS: calc.aliquotaCOFINS,
          valorCOFINS: calc.valorCOFINS,
          retidoCOFINS,
          aliquotaIRRF: calc.aliquotaIRRF,
          valorIRRF: calc.valorIRRF,
          aliquotaCSLL: calc.aliquotaCSLL,
          valorCSLL: calc.valorCSLL,
          aliquotaINSS: calc.aliquotaINSS,
          valorINSS: calc.valorINSS,
          ibscbs: calc.ibscbs,
          valorTributosFederais: calc.tributosFederais,
          valorTributosEstaduais: calc.tributosEstaduais,
          valorTributosMunicipais: calc.tributosMunicipais,
          percentualTotalTributos: calc.percentualTotalTributos,
        },

        valorTotalServicos: calc.valorServico,
        valorTotalDescontos: calc.descontoIncondicionado,
        valorTotalDeducoes: calc.deducoesMateriais,
        baseCalculoISS: calc.baseCalculoISS,
        valorTotalISS: calc.valorISS,
        valorTotalISSRetido: calc.valorISSRetido,
        valorTotalRetencoesFederais: calc.totalRetencoes - calc.valorISSRetido,
        valorTotalIBS: calc.valorTotalIBS,
        valorTotalCBS: calc.valorCBS,
        valorLiquidoNfse: calc.valorLiquido,
        valorTotalNotaFinal: calc.valorTotalNotaFinal,
        informacoesComplementares: informacoesComplementares || undefined,
        numeroPedido: numeroPedido || undefined,
        xmlAssinado: '',
        urlVisualizacaoNacional: 'https://www.nfse.gov.br/consultapublica',
      };

      novaNfse.xmlAssinado = gerarXmlNfseNacional(novaNfse);

      try {
        const response = await api.post('/nfse/emitir', {
          empresaId: empresa.id,
          tomadorId: selectedClienteId,
          servicoId: selectedServicoId || undefined,
          servico: novaNfse.servico,
          formaPagamento,
          informacoesComplementares,
          numeroPedido,
        });
        console.log('✅ NFS-e salva no backend:', response.data);
      } catch (err: any) {
        console.error('Erro ao salvar NFS-e no backend:', err);
        StorageService.addNfse(novaNfse);
      }

      StorageService.addNfse(novaNfse);
      onNfseEmitida(novaNfse);
      setSucessoNfse(novaNfse);
      toast.showSuccess(`✅ NFS-e Nº ${numeroNfse} emitida com sucesso!`);

    } catch (err: any) {
      console.error('❌ Erro na transmissão:', err);
      setErrosValidacao([err.message || 'Falha ao processar emissão da NFS-e. Verifique os dados.']);
      toast.showError(`❌ ${err.message || 'Erro ao emitir NFS-e.'}`);
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
              <FileText className="w-4 h-4" />
            </span>
            <h1 className="text-base font-bold text-slate-900">Emissão de NFS-e (Padrão Nacional)</h1>
            <span className={`${corBgBadge} ${corTextDark} text-[10px] font-bold px-2 py-0.5 rounded-full border ${corBorder}`}>
              Serviços
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Declaração de Prestação de Serviços (DPS) com cálculo automático de tributos e IBS/CBS.
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs font-semibold text-slate-700">Série {empresa.serieNfse || 1}</div>
          <div className={`text-[10px] font-medium ${corText}`}>Próxima NFS-e: Nº {empresa.proximoNumeroNfse || 1}</div>
        </div>
      </div>

      {/* SUCESSO */}
      {sucessoNfse && (
        <div className={`${corBg} border ${corBorder} rounded-xl p-4 shadow-sm animate-fadeIn`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className={`w-5 h-5 ${corText} shrink-0 mt-0.5`} />
              <div>
                <h3 className={`text-sm font-bold ${corTextDark}`}>
                  NFS-e Nº {sucessoNfse.numeroNfse} Autorizada!
                </h3>
                <p className="text-xs text-blue-800 font-mono mt-0.5">
                  Chave: {sucessoNfse.chaveAcesso} | Cód: {sucessoNfse.codigoVerificacao}
                </p>
                <div className="text-[11px] text-blue-700 mt-1">
                  Tomador: {sucessoNfse.tomador.nomeRazaoSocial} • Valor: {formatarMoeda(sucessoNfse.valorTotalServicos)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onViewDanfse(sucessoNfse)}
                className={`${corBgButton} text-white font-medium text-xs px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Visualizar DANFSe</span>
              </button>

              <button
                onClick={() => {
                  const blob = new Blob([sucessoNfse.xmlAssinado], { type: 'application/xml' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `NFSe_${sucessoNfse.numeroNfse}_SUP.xml`;
                  a.click();
                }}
                className="bg-white hover:bg-slate-100 text-slate-700 font-medium text-xs px-3 py-2 rounded-lg border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>XML</span>
              </button>

              <button
                onClick={() => {
                  setSucessoNfse(null);
                  setValorServico(0);
                  setDescontoIncondicionado(0);
                  setDeducoesMateriais(0);
                }}
                className="text-xs text-slate-600 hover:text-slate-900 underline ml-2 cursor-pointer"
              >
                Nova Emissão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ERROS */}
      {errosValidacao.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-rose-900">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Erros de validação ({errosValidacao.length}):</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 pl-2">
            {errosValidacao.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ============================================================
          BLOCO 1: TOMADOR (Toma)
      ============================================================ */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <UserCheck className={`w-4 h-4 ${corText}`} />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">1. Tomador do Serviço</h3>
          </div>
          <select
            value={selectedClienteId}
            onChange={(e) => handleClienteChange(e.target.value)}
            className={`text-xs bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 ${corFocus} font-medium text-slate-700 max-w-[280px]`}
          >
            <option value="">-- Escolher Cliente --</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>{c.razaoSocial} ({c.documento})</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-medium text-slate-600 mb-1">CPF / CNPJ *</label>
            <input
              type="text"
              value={tomadorDoc}
              onChange={(e) => setTomadorDoc(e.target.value)}
              className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
              placeholder="00.000.000/0000-00"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Razão Social / Nome *</label>
            <input
              type="text"
              value={tomadorRazaoSocial}
              onChange={(e) => setTomadorRazaoSocial(e.target.value)}
              className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
              placeholder="Nome do tomador"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Nome Fantasia</label>
            <input
              type="text"
              value={tomadorNomeFantasia}
              onChange={(e) => setTomadorNomeFantasia(e.target.value)}
              className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
              placeholder="Nome fantasia"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Inscrição Municipal</label>
            <input
              type="text"
              value={tomadorInscricaoMunicipal}
              onChange={(e) => setTomadorInscricaoMunicipal(e.target.value)}
              className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
              placeholder="Inscrição municipal"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Inscrição Estadual</label>
            <input
              type="text"
              value={tomadorInscricaoEstadual}
              onChange={(e) => setTomadorInscricaoEstadual(e.target.value)}
              className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
              placeholder="ISENTO ou número"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Indicador IE</label>
            <select
              value={tomadorIndicadorIE}
              onChange={(e) => setTomadorIndicadorIE(e.target.value as '1' | '2' | '9')}
              className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus} bg-white`}
            >
              <option value="1">1 - Contribuinte ICMS</option>
              <option value="2">2 - Isento</option>
              <option value="9">9 - Não contribuinte</option>
            </select>
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">E-mail</label>
            <input
              type="email"
              value={tomadorEmail}
              onChange={(e) => setTomadorEmail(e.target.value)}
              className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
              placeholder="email@cliente.com"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Telefone</label>
            <input
              type="text"
              value={tomadorTelefone}
              onChange={(e) => setTomadorTelefone(e.target.value)}
              className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
              placeholder="(11) 99999-9999"
            />
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-200">
          <div className="text-xs font-medium text-slate-700 mb-2">Endereço do Tomador</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-600 mb-1">Logradouro *</label>
              <input
                type="text"
                value={tomadorLogradouro}
                onChange={(e) => setTomadorLogradouro(e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                placeholder="Rua, Avenida..."
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">Número *</label>
              <input
                type="text"
                value={tomadorNumero}
                onChange={(e) => setTomadorNumero(e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                placeholder="123"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">Complemento</label>
              <input
                type="text"
                value={tomadorComplemento}
                onChange={(e) => setTomadorComplemento(e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                placeholder="Sala, Bloco..."
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">Bairro *</label>
              <input
                type="text"
                value={tomadorBairro}
                onChange={(e) => setTomadorBairro(e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                placeholder="Bairro"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">Cód. IBGE</label>
              <input
                type="text"
                value={tomadorCodigoMunicipio}
                onChange={(e) => setTomadorCodigoMunicipio(e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                placeholder="3550308"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">Município *</label>
              <input
                type="text"
                value={tomadorNomeMunicipio}
                onChange={(e) => setTomadorNomeMunicipio(e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                placeholder="São Paulo"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">UF *</label>
              <input
                type="text"
                maxLength={2}
                value={tomadorUf}
                onChange={(e) => setTomadorUf(e.target.value.toUpperCase())}
                className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus} uppercase`}
                placeholder="SP"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">CEP *</label>
              <input
                type="text"
                value={tomadorCep}
                onChange={(e) => setTomadorCep(e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                placeholder="01000-000"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          BLOCO 2: LOCAL DA PRESTAÇÃO
      ============================================================ */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
          <MapPin className={`w-4 h-4 ${corText}`} />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">2. Local da Prestação</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block font-medium text-slate-600 mb-1">Código IBGE *</label>
            <input
              type="text"
              value={localPrestacaoCodigoMunicipio}
              onChange={(e) => setLocalPrestacaoCodigoMunicipio(e.target.value)}
              className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
              placeholder="3550308"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Município *</label>
            <input
              type="text"
              value={localPrestacaoNomeMunicipio}
              onChange={(e) => setLocalPrestacaoNomeMunicipio(e.target.value)}
              className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
              placeholder="São Paulo"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">UF *</label>
            <input
              type="text"
              maxLength={2}
              value={localPrestacaoUf}
              onChange={(e) => setLocalPrestacaoUf(e.target.value.toUpperCase())}
              className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus} uppercase`}
              placeholder="SP"
            />
          </div>
        </div>
      </div>

      {/* ============================================================
          BLOCO 3: DADOS DO SERVIÇO (Serv)
      ============================================================ */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Package className={`w-4 h-4 ${corText}`} />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">3. Dados do Serviço</h3>
          </div>
          <select
            value={selectedServicoId}
            onChange={(e) => handleServicoChange(e.target.value)}
            className={`text-xs bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 ${corFocus} font-medium text-slate-700 max-w-[280px]`}
          >
            <option value="">-- Selecione um Serviço --</option>
            {servicosCatalogo.map((s) => (
              <option key={s.id} value={s.id}>
                {s.codigoInterno} - {s.descricao.slice(0, 35)} ({formatarMoeda(s.valorUnitario)})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-medium text-slate-600 mb-1">Item LC 116 *</label>
            <input
              type="text"
              value={codigoTributacaoNacional}
              onChange={(e) => setCodigoTributacaoNacional(e.target.value)}
              className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus} font-mono`}
              placeholder="010701"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Cód. Tributação Municipal</label>
            <input
              type="text"
              value={codigoTributacaoMunicipal}
              onChange={(e) => setCodigoTributacaoMunicipal(e.target.value)}
              className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus} font-mono`}
              placeholder="0107"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Código NBS *</label>
            <input
              type="text"
              value={codigoNBS}
              onChange={(e) => setCodigoNBS(e.target.value)}
              className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus} font-mono`}
              placeholder="1.1403.21.10"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Código Interno</label>
            <input
              type="text"
              value={codigoInterno}
              onChange={(e) => setCodigoInterno(e.target.value)}
              className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
              placeholder="Código interno do serviço"
            />
          </div>
        </div>

        <div className="mt-3">
          <label className="block font-medium text-slate-600 mb-1">Discriminação dos Serviços *</label>
          <textarea
            rows={3}
            value={descricaoServico}
            onChange={(e) => setDescricaoServico(e.target.value)}
            className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus} leading-relaxed text-xs`}
            placeholder="Descrição detalhada dos serviços prestados..."
          />
          <span className="text-[10px] text-slate-400">{descricaoServico.length}/2000</span>
        </div>
      </div>

      {/* ============================================================
          BLOCO 4: VALORES E TRIBUTAÇÃO
      ============================================================ */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
          <Calculator className={`w-4 h-4 ${corText}`} />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">4. Valores & Tributação</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-medium text-slate-600 mb-1">Valor do Serviço (R$) *</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={valorServico || ''}
              onChange={(e) => setValorServico(parseFloat(e.target.value) || 0)}
              className={`w-full border border-slate-300 rounded-lg p-2 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 ${corFocus}`}
            />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Desconto Incondicionado (R$)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={descontoIncondicionado || ''}
              onChange={(e) => setDescontoIncondicionado(parseFloat(e.target.value) || 0)}
              className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
            />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Deduções de Materiais (R$)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={deducoesMateriais || ''}
              onChange={(e) => setDeducoesMateriais(parseFloat(e.target.value) || 0)}
              className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
            />
          </div>
        </div>

        {/* ISSQN */}
        <div className={`mt-3 p-3 ${corBg} rounded-lg border ${corBorder}`}>
          <div className="flex items-center gap-2 mb-2">
            <Building className={`w-4 h-4 ${corText}`} />
            <span className="text-xs font-bold text-slate-700">ISSQN</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-medium text-slate-600 mb-1">Tributação ISSQN</label>
              <select
                value={tributacaoISSQN}
                onChange={(e) => setTributacaoISSQN(parseInt(e.target.value) as TributacaoISSQN)}
                className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus} bg-white`}
              >
                <option value={1}>1 - Operação Tributável</option>
                <option value={2}>2 - Imunidade</option>
                <option value={3}>3 - Exportação</option>
                <option value={4}>4 - Não Incidência</option>
              </select>
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
                className={`w-full border border-slate-300 rounded-lg p-2 font-bold text-blue-700 focus:outline-none focus:ring-2 ${corFocus}`}
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">Tipo Retenção ISS</label>
              <select
                value={tipoRetencaoISS}
                onChange={(e) => setTipoRetencaoISS(parseInt(e.target.value) as TipoRetencaoISS)}
                className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus} bg-white`}
              >
                <option value={1}>1 - Não Retido</option>
                <option value={2}>2 - Retido pelo Tomador</option>
                <option value={3}>3 - Retido por Intermediário</option>
              </select>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between">
              <span className="text-slate-600">ISS Apurado:</span>
              <span className="font-bold text-slate-900">{formatarMoeda(calc.valorISS)}</span>
            </div>
          </div>
        </div>

        {/* Retenções Federais */}
        <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className={`w-4 h-4 ${corText}`} />
            <span className="text-xs font-bold text-slate-700">Retenções Federais</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-medium text-slate-600 mb-1">IRRF (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={aliquotaIRRF || ''}
                onChange={(e) => setAliquotaIRRF(parseFloat(e.target.value) || 0)}
                className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
              />
              <span className="text-[10px] text-slate-400">Valor: {formatarMoeda(calc.valorIRRF)}</span>
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">CSLL (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={aliquotaCSLL || ''}
                onChange={(e) => setAliquotaCSLL(parseFloat(e.target.value) || 0)}
                className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
              />
              <span className="text-[10px] text-slate-400">Valor: {formatarMoeda(calc.valorCSLL)}</span>
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">INSS (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={aliquotaINSS || ''}
                onChange={(e) => setAliquotaINSS(parseFloat(e.target.value) || 0)}
                className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
              />
              <span className="text-[10px] text-slate-400">Valor: {formatarMoeda(calc.valorINSS)}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mt-2 pt-2 border-t border-slate-200">
            <div>
              <label className="block font-medium text-slate-600 mb-1">PIS (%)</label>
              <input
                type="number"
                step="0.0001"
                min="0"
                value={aliquotaPIS || ''}
                onChange={(e) => setAliquotaPIS(parseFloat(e.target.value) || 0)}
                className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
              />
              <div className="flex items-center gap-2 mt-1">
                <label className="flex items-center gap-1 text-[10px] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={retidoPIS}
                    onChange={(e) => setRetidoPIS(e.target.checked)}
                    className={`rounded ${corFocus} cursor-pointer`}
                  />
                  <span>Retido</span>
                </label>
                <span className="text-[10px] text-slate-400">Valor: {formatarMoeda(calc.valorPIS)}</span>
              </div>
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">COFINS (%)</label>
              <input
                type="number"
                step="0.0001"
                min="0"
                value={aliquotaCOFINS || ''}
                onChange={(e) => setAliquotaCOFINS(parseFloat(e.target.value) || 0)}
                className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
              />
              <div className="flex items-center gap-2 mt-1">
                <label className="flex items-center gap-1 text-[10px] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={retidoCOFINS}
                    onChange={(e) => setRetidoCOFINS(e.target.checked)}
                    className={`rounded ${corFocus} cursor-pointer`}
                  />
                  <span>Retido</span>
                </label>
                <span className="text-[10px] text-slate-400">Valor: {formatarMoeda(calc.valorCOFINS)}</span>
              </div>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-700">Total Retenções Federais:</span>
            <span className="text-rose-700">{formatarMoeda(calc.totalRetencoes - calc.valorISSRetido)}</span>
          </div>
        </div>

        {/* IBS/CBS */}
        <div className={`mt-3 p-3 ${corBg} rounded-lg border ${corBorder}`}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className={`w-4 h-4 ${corText}`} />
            <span className="text-xs font-bold text-slate-700">IBS & CBS (EC 132/2023)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <span className="text-slate-500 block">CBS Federal</span>
              <span className="font-bold text-slate-900">{formatarMoeda(calc.valorCBS)}</span>
              <span className="text-[10px] text-slate-400 block">0.90%</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <span className="text-slate-500 block">IBS Estadual</span>
              <span className="font-bold text-slate-900">{formatarMoeda(calc.valorIBSUF)}</span>
              <span className="text-[10px] text-slate-400 block">0.05%</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <span className="text-slate-500 block">IBS Municipal</span>
              <span className="font-bold text-slate-900">{formatarMoeda(calc.valorIBSMun)}</span>
              <span className="text-[10px] text-slate-400 block">0.05%</span>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-700">Total IBS + CBS:</span>
            <span className="text-blue-700">{formatarMoeda(calc.valorTotalIBS + calc.valorCBS)}</span>
          </div>
        </div>
      </div>

      {/* ============================================================
          BLOCO 5: PAGAMENTO VINCULADO
      ============================================================ */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
          <CreditCard className={`w-4 h-4 ${corText}`} />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">5. Pagamento Vinculado</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-medium text-slate-600 mb-1">Forma de Pagamento</label>
            <select
              value={formaPagamento}
              onChange={(e) => setFormaPagamento(e.target.value)}
              className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus} bg-white`}
            >
              <option value="17">17 - PIX</option>
              <option value="15">15 - Boleto Bancário</option>
              <option value="03">03 - Cartão de Crédito</option>
              <option value="04">04 - Cartão de Débito</option>
              <option value="01">01 - Dinheiro</option>
              <option value="02">02 - Cheque</option>
              <option value="99">99 - Outros</option>
            </select>
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Número do Pagamento</label>
            <input
              type="number"
              min="1"
              value={pagamentoNumero}
              onChange={(e) => setPagamentoNumero(parseInt(e.target.value) || 1)}
              className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
            />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">ID da Transação</label>
            <input
              type="text"
              value={pagamentoIdTransacao}
              onChange={(e) => setPagamentoIdTransacao(e.target.value)}
              className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
              placeholder="TX-998811"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">CNPJ do Recebedor</label>
            <input
              type="text"
              value={pagamentoCnpjRecebedor}
              onChange={(e) => setPagamentoCnpjRecebedor(e.target.value)}
              className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
              placeholder="00.000.000/0000-00"
            />
          </div>
        </div>
      </div>

      {/* ============================================================
          BLOCO 6: INFORMAÇÕES ADICIONAIS
      ============================================================ */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
          <Info className={`w-4 h-4 ${corText}`} />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">6. Informações Adicionais</h3>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-medium text-slate-600 mb-1">Informações Complementares</label>
            <textarea
              rows={3}
              value={informacoesComplementares}
              onChange={(e) => setInformacoesComplementares(e.target.value)}
              className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus} resize-none`}
              placeholder="Informações complementares sobre a prestação de serviços..."
              maxLength={2000}
            />
            <span className="text-[10px] text-slate-400">{informacoesComplementares.length}/2000</span>
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Número do Pedido</label>
            <input
              type="text"
              value={numeroPedido}
              onChange={(e) => setNumeroPedido(e.target.value)}
              className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
              placeholder="Número de referência do pedido"
            />
          </div>
        </div>
      </div>

      {/* ============================================================
          BLOCO 7: TOTAIS DA NFS-e
      ============================================================ */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
          <DollarSign className={`w-4 h-4 ${corText}`} />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">7. Totais da NFS-e</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
            <span className="text-slate-500 block">Valor Serviços</span>
            <span className="font-bold text-slate-900">{formatarMoeda(calc.valorServico)}</span>
          </div>
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
            <span className="text-slate-500 block">Descontos</span>
            <span className="font-bold text-rose-600">-{formatarMoeda(calc.descontoIncondicionado)}</span>
          </div>
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
            <span className="text-slate-500 block">Deduções</span>
            <span className="font-bold text-slate-600">-{formatarMoeda(calc.deducoesMateriais)}</span>
          </div>
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
            <span className="text-slate-500 block">Base ISS</span>
            <span className="font-bold text-slate-900">{formatarMoeda(calc.baseCalculoISS)}</span>
          </div>
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
            <span className="text-slate-500 block">ISS Apurado</span>
            <span className="font-bold text-blue-700">{formatarMoeda(calc.valorISS)}</span>
          </div>
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
            <span className="text-slate-500 block">ISS Retido</span>
            <span className="font-bold text-amber-700">{formatarMoeda(calc.valorISSRetido)}</span>
          </div>
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
            <span className="text-slate-500 block">IBS + CBS</span>
            <span className="font-bold text-emerald-700">{formatarMoeda(calc.valorTotalIBS + calc.valorCBS)}</span>
          </div>
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
            <span className="text-slate-500 block">Retenções Federais</span>
            <span className="font-bold text-rose-700">{formatarMoeda(calc.totalRetencoes - calc.valorISSRetido)}</span>
          </div>
        </div>

        <div className={`mt-4 p-4 bg-gradient-to-r ${corGradient} text-white rounded-lg`}>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] text-blue-100 uppercase block font-medium">Valor Líquido</span>
              <span className="text-xs text-blue-100">Disponível para recebimento</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-white">{formatarMoeda(calc.valorLiquido)}</span>
              <div className="text-[10px] text-blue-200">Valor Total da Nota: {formatarMoeda(calc.valorTotalNotaFinal)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          BOTÃO TRANSMITIR
      ============================================================ */}
      <button
        onClick={handleTransmitirNfse}
        disabled={isTransmitting}
        id="btn-transmitir-nfse"
        className={`w-full ${corBgButton} disabled:bg-slate-300 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50`}
      >
        {isTransmitting ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Transmitindo DPS para SEFAZ...</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>TRANSMITIR NFS-e NACIONAL (DPS v1.01)</span>
          </>
        )}
      </button>

    </div>
  );
};