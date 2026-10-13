// src/components/fiscal/CteEmissor.tsx
import React, { useState } from 'react';
import { 
  Truck, Send, AlertTriangle,
  MapPin, Package, FileText, UserCheck, CreditCard,
  Plus, Trash2, Navigation, Route, Weight, Box,
  User, Building, Calculator, Receipt, Barcode,
  Calendar, Clock, Info, Shield, DollarSign, Layers,
  Hash, Mail, Phone, Home, MapPinned, Users, FileBadge2, RefreshCw
} from 'lucide-react';
import { CTeDocumento, CTeComponenteValor, CTeQuantidade, CTeDocumentoTransportado } from '../../types/fiscal';
import { ClienteFornecedor, ConfiguracaoEmpresa, TransportadoraERP } from '../../types/erp';
import { StorageService } from '../../utils/storage';
import { formatarMoeda, formatarCpfCnpj, validarCpfOuCnpj, limparDocumento } from '../../utils/cpfCnpjValidator';
import { gerarChaveAcessoNFe, calcularDVMod11NFe, isChaveAcesso44, limparChaveAcesso } from '../../utils/chaveAcesso';
import { cteService } from '../../services/cte.service';
import { useToast } from '../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/apiError';
import { DacteLayout } from './DacteLayout';
import { BotaoCabecalho, EmissorLayout, ResumoEmissor, SecaoEmissor } from './emissor/EmissorKit';
import { ResumoEmissaoModal } from './ResumoEmissaoModal';
import { CampoCpfCnpj } from '../ui/CampoCpfCnpj';

// ============================================================
// INTERFACES
// ============================================================

interface CteEmissorProps {
  empresa: ConfiguracaoEmpresa;
  clientes: ClienteFornecedor[];
  transportadoras: TransportadoraERP[];
  onCteEmitido: (cte: CTeDocumento) => void;
  onViewDacte: (cteId: string) => void;
}

// ============================================================
// TIPOS DE MODAL
// ============================================================

type ModalCTe = 'RODOVIARIO' | 'AEREO' | 'AQUAVIARIO' | 'FERROVIARIO' | 'DUTOVIARIO' | 'MULTIMODAL';
type TipoServicoCTe = 0 | 1 | 2 | 3 | 4;
type TomadorServicoCTe = 0 | 1 | 2 | 3 | 4;
type IndicadorIECTe = '1' | '2' | '9';
type TipoCTe = 'NORMAL' | 'COMPLEMENTO_VALORES' | 'SUBSTITUICAO';

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

const CteEmissorConteudo: React.FC<CteEmissorProps & { onLimparTudo: () => void }> = ({
  onLimparTudo,
  empresa,
  clientes,
  transportadoras,
  onCteEmitido,
  onViewDacte,
}) => {
  const toast = useToast();

  // ============================================================
  // STATE - IDENTIFICAÇÃO (ide)
  // ============================================================
  const [cCT, setCCT] = useState<string>('');
  const [CFOP, setCFOP] = useState<string>('6353');
  // 🔥 CTe.natOp é VarChar(60) — o texto completo anterior ("Prestação de
  // Serviço de Transporte de Cargas Intermunicipal / Interestadual", 75
  // caracteres) sempre estourava a coluna e quebrava toda emissão real com
  // "value too long for the column's type" (mesma classe de bug já corrigida
  // pra NFS-e nesta sessão). Encurtado pra caber com folga.
  const [natOp, setNatOp] = useState<string>('Prestação de Serviço de Transporte de Cargas');
  const [serie, setSerie] = useState<number>(1);
  const [tpImp, setTpImp] = useState<string>('1');
  const [tpEmis, setTpEmis] = useState<string>('1');
  const [tpAmb, setTpAmb] = useState<string>(String(empresa.ambienteEmissao || 1));
  const [tpCTe, setTpCTe] = useState<TipoCTe>('NORMAL');
  const [modal, setModal] = useState<ModalCTe>('RODOVIARIO');
  const [tpServ, setTpServ] = useState<TipoServicoCTe>(0);

  // ============================================================
  // STATE - REMETENTE (infRem)
  // ============================================================
  const [selectedRemetenteId, setSelectedRemetenteId] = useState<string>('');
  const [remetenteDoc, setRemetenteDoc] = useState<string>('');
  const [remetenteNome, setRemetenteNome] = useState<string>('');
  const [remetenteIE, setRemetenteIE] = useState<string>('');
  const [remetenteIEST, setRemetenteIEST] = useState<string>('');
  const [remetenteLogradouro, setRemetenteLogradouro] = useState<string>('');
  const [remetenteNumero, setRemetenteNumero] = useState<string>('');
  const [remetenteComplemento, setRemetenteComplemento] = useState<string>('');
  const [remetenteBairro, setRemetenteBairro] = useState<string>('');
  const [remetenteMun, setRemetenteMun] = useState<string>('');
  const [remetenteMunIbge, setRemetenteMunIbge] = useState<string>('');
  const [remetenteUf, setRemetenteUf] = useState<string>('SP');
  const [remetenteCep, setRemetenteCep] = useState<string>('');
  const [remetenteFone, setRemetenteFone] = useState<string>('');
  const [remetenteEmail, setRemetenteEmail] = useState<string>('');
  const [remetenteCPais, setRemetenteCPais] = useState<string>('1058');
  const [remetenteXPais, setRemetenteXPais] = useState<string>('BRASIL');

  // ============================================================
  // STATE - DESTINATÁRIO (infDest)
  // ============================================================
  const [selectedDestinatarioId, setSelectedDestinatarioId] = useState<string>('');
  const [destinatarioDoc, setDestinatarioDoc] = useState<string>('');
  const [destinatarioNome, setDestinatarioNome] = useState<string>('');
  const [destinatarioIE, setDestinatarioIE] = useState<string>('');
  const [destinatarioIEST, setDestinatarioIEST] = useState<string>('');
  const [destinatarioLogradouro, setDestinatarioLogradouro] = useState<string>('');
  const [destinatarioNumero, setDestinatarioNumero] = useState<string>('');
  const [destinatarioComplemento, setDestinatarioComplemento] = useState<string>('');
  const [destinatarioBairro, setDestinatarioBairro] = useState<string>('');
  const [destinatarioMun, setDestinatarioMun] = useState<string>('');
  const [destinatarioMunIbge, setDestinatarioMunIbge] = useState<string>('');
  const [destinatarioUf, setDestinatarioUf] = useState<string>('RJ');
  const [destinatarioCep, setDestinatarioCep] = useState<string>('');
  const [destinatarioFone, setDestinatarioFone] = useState<string>('');
  const [destinatarioEmail, setDestinatarioEmail] = useState<string>('');
  const [destinatarioCPais, setDestinatarioCPais] = useState<string>('1058');
  const [destinatarioXPais, setDestinatarioXPais] = useState<string>('BRASIL');

  // ============================================================
  // STATE - TOMADOR (toma3/toma4)
  // ============================================================
  const [tomadorServico, setTomadorServico] = useState<TomadorServicoCTe>(0);
  const [indIEToma, setIndIEToma] = useState<IndicadorIECTe>('9');
  
  const [tomadorCNPJ, setTomadorCNPJ] = useState<string>('');
  const [tomadorCPF, setTomadorCPF] = useState<string>('');
  const [tomadorIE, setTomadorIE] = useState<string>('');
  const [tomadorxNome, setTomadorxNome] = useState<string>('');
  const [tomadorxFant, setTomadorxFant] = useState<string>('');
  const [tomadorFone, setTomadorFone] = useState<string>('');
  const [tomadorEmail, setTomadorEmail] = useState<string>('');
  const [tomadorxLgr, setTomadorxLgr] = useState<string>('');
  const [tomadorNro, setTomadorNro] = useState<string>('');
  const [tomadorxCpl, setTomadorxCpl] = useState<string>('');
  const [tomadorxBairro, setTomadorxBairro] = useState<string>('');
  const [tomadorcMun, setTomadorcMun] = useState<string>('');
  const [tomadorxMun, setTomadorxMun] = useState<string>('');
  const [tomadorCEP, setTomadorCEP] = useState<string>('');
  const [tomadorUF, setTomadorUF] = useState<string>('SP');
  const [tomadorcPais, setTomadorcPais] = useState<string>('1058');
  const [tomadorxPais, setTomadorxPais] = useState<string>('BRASIL');

  // ============================================================
  // STATE - PERCURSO (fluxo)
  // ============================================================
  const [munInicioNome, setMunInicioNome] = useState<string>('São Paulo');
  const [munInicioUf, setMunInicioUf] = useState<string>('SP');
  const [munInicioIbge, setMunInicioIbge] = useState<string>('3550308');
  const [munFimNome, setMunFimNome] = useState<string>('Rio de Janeiro');
  const [munFimUf, setMunFimUf] = useState<string>('RJ');
  const [munFimIbge, setMunFimIbge] = useState<string>('3304557');
  const [xOrig, setXOrig] = useState<string>('');
  const [xDest, setXDest] = useState<string>('');
  const [xRota, setXRota] = useState<string>('');

  // ============================================================
  // STATE - PREVISÃO DE ENTREGA (Entrega)
  // ============================================================
  const [tpPer, setTpPer] = useState<string>('0');
  const [dProg, setDProg] = useState<string>('');
  const [dIni, setDIni] = useState<string>('');
  const [dFim, setDFim] = useState<string>('');
  const [tpHor, setTpHor] = useState<string>('0');
  const [hProg, setHProg] = useState<string>('');
  const [hIni, setHIni] = useState<string>('');
  const [hFim, setHFim] = useState<string>('');

  // ============================================================
  // STATE - CARGA (infCarga)
  // ============================================================
  const [produtoPredominante, setProdutoPredominante] = useState<string>('Equipamentos de Tecnologia, Servidores e Peças de TI');
  const [xOutCat, setXOutCat] = useState<string>('FRIA, GRANEL, REFRIGERADA');
  const [valorCargaAverbada, setValorCargaAverbada] = useState<number>(85000);

  const [quantidades, setQuantidades] = useState<CTeQuantidade[]>([
    { cUnid: '01', tpMed: 'PESO BRUTO', qCarga: 280 },
    { cUnid: '03', tpMed: 'VOLUMES', qCarga: 6 },
  ]);

  // ============================================================
  // STATE - DOCUMENTOS TRANSPORTADOS (infDoc)
  // ============================================================
  const [documentos, setDocumentos] = useState<CTeDocumentoTransportado[]>([]);
  // 🔥 O placeholder anterior tinha DV errado e, mesmo depois de corrigido o
  // DV, ainda embutia um "CNPJ" que parece real mas não passa no dígito
  // verificador de CNPJ (18236447000190) — a SEFAZ real valida os dois
  // digitos, então toda emissão de teste era rejeitada ("DV inválido" e
  // depois "CNPJ zerado ou inválido"). Refeito com um CNPJ de verdade
  // (público, check-digit válido) e DV mod-11 correto.
  const [chavesNfeTexto, setChavesNfeTexto] = useState<string>('35260847960950051702550010000010411123456780');

  // ============================================================
  // STATE - TRANSPORTADORA
  // ============================================================
  // 🔥 RNTRC/veículo/motorista foram removidos daqui — o modelo CTe no banco
  // não tem coluna nenhuma pra esses 3 campos (confirmado no schema.prisma), e
  // o XML real (layout 4.00) só usa o RNTRC vindo da Transportadora vinculada
  // (Transportadora.rntrc, via transportadoraId — veículo/condutor migraram
  // pro MDF-e no layout 4.00). Os campos antigos eram só teatro: coletados,
  // validados pelo backend, e depois descartados (transportadoraId nunca era
  // enviado). Agora seleciona a transportadora de verdade; sem transportadora
  // (carga própria), o XML usa RNTRC "ISENTO" — comportamento legítimo.
  const [selectedTransportadoraId, setSelectedTransportadoraId] = useState<string>('');

  // ============================================================
  // STATE - COMPONENTES DO VALOR (vPrest)
  // ============================================================
  const [fretePeso, setFretePeso] = useState<number>(1850);
  const [freteValor, setFreteValor] = useState<number>(250);
  const [pedagio, setPedagio] = useState<number>(180);
  const [taxaGris, setTaxaGris] = useState<number>(120);
  const [outrasTaxas, setOutrasTaxas] = useState<number>(0);

  // ============================================================
  // STATE - IMPOSTOS (imp)
  // ============================================================
  const [cstICMS, setCstICMS] = useState<string>('00');
  const [aliquotaICMS, setAliquotaICMS] = useState<number>(12.0);
  const [pRedBC, setPRedBC] = useState<number>(0);
  const [pICMSSTRet, setPICMSSTRet] = useState<number>(0);
  const [vCred, setVCred] = useState<number>(0);
  const [pRedBCOutraUF, setPRedBCOutraUF] = useState<number>(0);
  const [pICMSOutraUF, setPICMSOutraUF] = useState<number>(0);
  const [indSN, setIndSN] = useState<string>('');

  // ============================================================
  // STATE - CT-e DE SUBSTITUIÇÃO E COMPLEMENTO
  // ============================================================
  const [chCteSub, setChCteSub] = useState<string>('');
  const [indAlteraToma, setIndAlteraToma] = useState<string>('');
  const [chCTeComplementado, setChCTeComplementado] = useState<string>('');

  // ============================================================
  // STATE - CONTINGÊNCIA
  // ============================================================
  const [dhCont, setDhCont] = useState<string>('');
  const [xJust, setXJust] = useState<string>('');

  // ============================================================
  // STATE - COMPRAS GOVERNAMENTAIS
  // ============================================================
  const [tpEnteGov, setTpEnteGov] = useState<string>('');
  const [pRedutor, setPRedutor] = useState<string>('');
  const [tpOperGov, setTpOperGov] = useState<string>('');

  // ============================================================
  // STATE - OBSERVAÇÕES
  // ============================================================
  const [xObs, setXObs] = useState<string>('');
  const [infAdFisco, setInfAdFisco] = useState<string>('');
  const [xObsGlobalizado, setXObsGlobalizado] = useState<string>('');

  // ============================================================
  // STATE - AUTORIZADOS PARA DOWNLOAD
  // ============================================================
  const [autXML, setAutXML] = useState<{ CNPJ?: string; CPF?: string }[]>([]);

  // ============================================================
  // STATE - UI
  // ============================================================
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);
  const [isCarregandoUltima, setIsCarregandoUltima] = useState<boolean>(false);
  const [erros, setErros] = useState<string[]>([]);
  const [sucessoCte, setSucessoCte] = useState<CTeDocumento | null>(null);
  const [tentouEnviar, setTentouEnviar] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);

  // ============================================================
  // CÁLCULOS
  // ============================================================
  const totalFrete = fretePeso + freteValor + pedagio + taxaGris + outrasTaxas;
  const baseCalculoICMS = totalFrete;
  const valorICMS = (baseCalculoICMS * aliquotaICMS) / 100;
  const valorPIS = (totalFrete * 0.65) / 100;
  const valorCOFINS = (totalFrete * 3.00) / 100;
  const valorTributosAprox = valorICMS + valorPIS + valorCOFINS;

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleSelectRemetente = (clienteId: string) => {
    setSelectedRemetenteId(clienteId);
    if (!clienteId) {
      limparRemetente();
      return;
    }
    const cli = clientes.find(c => c.id === clienteId);
    if (cli) {
      setRemetenteDoc(cli.documento);
      setRemetenteNome(cli.razaoSocial);
      setRemetenteIE(cli.inscricaoEstadual || 'ISENTO');
      setRemetenteIEST(cli.inscricaoEstadualST || '');
      setRemetenteLogradouro(cli.endereco.logradouro);
      setRemetenteNumero(cli.endereco.numero);
      setRemetenteComplemento(cli.endereco.complemento || '');
      setRemetenteBairro(cli.endereco.bairro);
      setRemetenteMun(cli.endereco.nomeMunicipio);
      setRemetenteMunIbge(cli.endereco.codigoMunicipio);
      setRemetenteUf(cli.endereco.uf);
      setRemetenteCep(cli.endereco.cep);
      setRemetenteFone(cli.telefone || '');
      setRemetenteEmail(cli.email || '');
      setMunInicioNome(cli.endereco.nomeMunicipio);
      setMunInicioUf(cli.endereco.uf);
      setMunInicioIbge(cli.endereco.codigoMunicipio);
    }
  };

  const limparRemetente = () => {
    setRemetenteDoc('');
    setRemetenteNome('');
    setRemetenteIE('');
    setRemetenteIEST('');
    setRemetenteLogradouro('');
    setRemetenteNumero('');
    setRemetenteComplemento('');
    setRemetenteBairro('');
    setRemetenteMun('');
    setRemetenteMunIbge('');
    setRemetenteUf('SP');
    setRemetenteCep('');
    setRemetenteFone('');
    setRemetenteEmail('');
  };

  const handleSelectDestinatario = (clienteId: string) => {
    setSelectedDestinatarioId(clienteId);
    if (!clienteId) {
      limparDestinatario();
      return;
    }
    const cli = clientes.find(c => c.id === clienteId);
    if (cli) {
      setDestinatarioDoc(cli.documento);
      setDestinatarioNome(cli.razaoSocial);
      setDestinatarioIE(cli.inscricaoEstadual || 'ISENTO');
      setDestinatarioIEST(cli.inscricaoEstadualST || '');
      setDestinatarioLogradouro(cli.endereco.logradouro);
      setDestinatarioNumero(cli.endereco.numero);
      setDestinatarioComplemento(cli.endereco.complemento || '');
      setDestinatarioBairro(cli.endereco.bairro);
      setDestinatarioMun(cli.endereco.nomeMunicipio);
      setDestinatarioMunIbge(cli.endereco.codigoMunicipio);
      setDestinatarioUf(cli.endereco.uf);
      setDestinatarioCep(cli.endereco.cep);
      setDestinatarioFone(cli.telefone || '');
      setDestinatarioEmail(cli.email || '');
      setMunFimNome(cli.endereco.nomeMunicipio);
      setMunFimUf(cli.endereco.uf);
      setMunFimIbge(cli.endereco.codigoMunicipio);
    }
  };

  const limparDestinatario = () => {
    setDestinatarioDoc('');
    setDestinatarioNome('');
    setDestinatarioIE('');
    setDestinatarioIEST('');
    setDestinatarioLogradouro('');
    setDestinatarioNumero('');
    setDestinatarioComplemento('');
    setDestinatarioBairro('');
    setDestinatarioMun('');
    setDestinatarioMunIbge('');
    setDestinatarioUf('RJ');
    setDestinatarioCep('');
    setDestinatarioFone('');
    setDestinatarioEmail('');
  };

  const adicionarDocumento = () => {
    const chaves = chavesNfeTexto
      .split(/[\n,;]/)
      .map(s => limparChaveAcesso(s))
      .filter(s => isChaveAcesso44(s));

    const novosDocs: CTeDocumentoTransportado[] = chaves.map(chave => ({
      tipo: 'NFe',
      chave,
      dEmi: new Date().toISOString(),
    }));

    setDocumentos(prev => [...prev, ...novosDocs]);
    setChavesNfeTexto('');
  };

  const removerDocumento = (index: number) => {
    setDocumentos(prev => prev.filter((_, i) => i !== index));
  };

  const adicionarQuantidade = () => {
    setQuantidades(prev => [...prev, { cUnid: '01', tpMed: '', qCarga: 0 }]);
  };

  const removerQuantidade = (index: number) => {
    setQuantidades(prev => prev.filter((_, i) => i !== index));
  };

  const atualizarQuantidade = <K extends keyof (typeof quantidades)[number]>(
    index: number,
    campo: K,
    valor: (typeof quantidades)[number][K]
  ) => {
    setQuantidades(prev => prev.map((q, i) =>
      i === index ? { ...q, [campo]: valor } : q
    ));
  };

  const adicionarAutXML = () => {
    setAutXML(prev => [...prev, { CNPJ: '', CPF: '' }]);
  };

  const removerAutXML = (index: number) => {
    setAutXML(prev => prev.filter((_, i) => i !== index));
  };

  const atualizarAutXML = (index: number, campo: 'CNPJ' | 'CPF', valor: string) => {
    setAutXML(prev => prev.map((a, i) =>
      i === index ? { ...a, [campo]: valor } : a
    ));
  };

  // ============================================================
  // CARREGAR ÚLTIMA NOTA
  // ============================================================

  const handleCarregarUltima = async () => {
    setIsCarregandoUltima(true);
    setErros([]);
    try {
      const resposta = await cteService.listar({ page: 1, limit: 1 });
      const ultima = resposta.data?.[0];
      if (!ultima) {
        toast.showError('Nenhum CT-e anterior encontrado.');
        return;
      }

      // Shape cru do backend (schema.prisma do CT-e segue o leiaute SEFAZ ao
      // pé da letra) — não são chaves de documentos ou municípios de
      // descarga/carga de propósito: são específicos da viagem anterior.
      const raw = ultima as unknown as {
        remetenteId?: string;
        destinatarioId?: string;
        transportadoraId?: string | null;
        modal?: string;
        tpServ?: string;
        toma?: string;
        natOp?: string;
        CFOP?: string;
        proPred?: string;
      };

      if (raw.remetenteId) handleSelectRemetente(raw.remetenteId);
      if (raw.destinatarioId) handleSelectDestinatario(raw.destinatarioId);
      setSelectedTransportadoraId(raw.transportadoraId || '');
      if (raw.modal) setModal(raw.modal as ModalCTe);
      if (raw.natOp) setNatOp(raw.natOp);
      if (raw.CFOP) setCFOP(raw.CFOP);
      if (raw.proPred) setProdutoPredominante(raw.proPred);

      toast.showSuccess('Dados do último CT-e carregados (remetente, destinatário, modal, produto). Municípios de descarga e documentos transportados ficam de fora de propósito — revise antes de emitir.');
    } catch (error: unknown) {
      toast.showError(getApiErrorMessage(error, 'Erro ao carregar o último CT-e'));
    } finally {
      setIsCarregandoUltima(false);
    }
  };

  // ============================================================
  // VALIDAÇÃO
  // ============================================================
  const validarCte = (): boolean => {
    const errs: string[] = [];

    if (!remetenteDoc || !remetenteNome) {
      errs.push('Informe os dados completos do Remetente (embarcador da carga).');
    } else if (!validarCpfOuCnpj(remetenteDoc).valido) {
      errs.push('CPF/CNPJ do Remetente inválido — confira os dígitos verificadores.');
    }

    if (!destinatarioDoc || !destinatarioNome) {
      errs.push('Informe os dados completos do Destinatário da carga.');
    } else if (!validarCpfOuCnpj(destinatarioDoc).valido) {
      errs.push('CPF/CNPJ do Destinatário inválido — confira os dígitos verificadores.');
    }

    if (tomadorServico === 4 && tomadorCNPJ && !validarCpfOuCnpj(tomadorCNPJ).valido) {
      errs.push('CPF/CNPJ do Tomador inválido — confira os dígitos verificadores.');
    }

    if (!produtoPredominante.trim()) {
      errs.push('Informe o Produto Predominante da carga transportada.');
    }
    if (valorCargaAverbada <= 0) {
      errs.push('Informe o Valor da Carga para fins de averbação securitária.');
    }

    if (totalFrete <= 0) {
      errs.push('O valor total da prestação do frete deve ser maior que zero.');
    }

    if (documentos.length === 0) {
      errs.push('Adicione pelo menos 1 documento transportado (chave de NF-e).');
    }

    if (tpCTe === 'SUBSTITUICAO' && !chCteSub) {
      errs.push('Informe a chave do CT-e substituído.');
    }

    if (tpCTe === 'COMPLEMENTO_VALORES' && !chCTeComplementado) {
      errs.push('Informe a chave do CT-e complementado.');
    }

    setErros(errs);
    return errs.length === 0;
  };

  // 🔥 Classe do input: borda vermelha só depois de tentar emitir (tentouEnviar)
  // e o campo estar vazio — mesmo padrão já usado em NfeEmissor/NfceEmissor/NfseEmissor.
  const classeCampo = (valor: string, base = `w-full border rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`) =>
    tentouEnviar && !valor.trim()
      ? `${base} border-rose-400 bg-rose-50 focus:ring-rose-500`
      : `${base} border-ink-300`;

  const handleClickEmitir = () => {
    setTentouEnviar(true);
    if (!validarCte()) {
      toast.showError('Preencha os campos obrigatórios destacados em vermelho antes de emitir.');
      return;
    }
    setShowPreview(true);
  };

  // ============================================================
  // TRANSMISSÃO
  // ============================================================
  const handleTransmitirCte = async () => {
    if (!validarCte()) return;

    setIsTransmitting(true);
    setErros([]);

    try {
      const numero = Math.floor(100 + Math.random() * 900);
      const aamm = new Date().toISOString().slice(2, 4) + new Date().toISOString().slice(5, 7);
      // 🔥 cUF (código IBGE da UF) tem que ser da EMPRESA emitente, não do
      // remetente da carga — usar o remetente aqui fazia o cUF do CT-e (e da
      // própria chave de acesso) sair errado sempre que remetente e emitente
      // são de UFs diferentes. Isso confundia o autorizador SVRS (rejeição real:
      // "O tpEmis informado é incompatível com SVC-RS" — o SVRS interpretava o
      // documento como uma tentativa de contingência de outra UF, por causa do
      // cUF errado, em vez de emissão normal da própria UF autorizada por ele).
      const codigoUfEmitente = empresa.endereco?.codigoMunicipio?.slice(0, 2) || '35';

      const chaveData = gerarChaveAcessoNFe({
        codigoUf: codigoUfEmitente,
        anoMes: aamm,
        cnpjEmitente: empresa.cnpj,
        modelo: '57',
        serie,
        numero,
        tipoEmissao: 1,
      });

      const chavesList = documentos.map(d => d.chave);

      const novoCte = {
        // IDENTIFICAÇÃO
        versao: '4.00',
        Id: `CTe${chaveData.chaveCompleta}`,
        // 🔥 emitenteCNPJ é o que o backend usa pra gerar a CHAVE DE ACESSO REAL
        // (gerarChaveAcessoNFe, dentro de cteService.emitirCte) — sem essa chave
        // aqui, o backend sempre caía no default "00000000000000" e emitia com
        // uma chave de acesso com CNPJ errado embutido (rejeitável pela SEFAZ).
        emitenteCNPJ: empresa.cnpj,
        cUF: codigoUfEmitente,
        cCT: chaveData.codigoNumerico,
        CFOP,
        natOp,
        mod: '57',
        serie,
        // ⚠️ nCT NÃO é enviado de propósito: o backend usa `data.nCT` se vier
        // preenchido, ignorando sua própria numeração sequencial — o `numero`
        // sorteado aqui (100-999) era só pra montar a chave de acesso local de
        // preview; enviá-lo faria o backend gravar um número de CT-e não
        // sequencial e sujeito a colisão. O backend gera o número real.
        dhEmi: new Date().toISOString(),
        tpImp,
        tpEmis,
        cDV: chaveData.dv,
        tpAmb: parseInt(tpAmb),
        tpCTe,
        procEmi: '0',
        verProc: 'SUP-TECNOLOGIA-1.0',
        indGlobalizado: false,
        cMunEnv: remetenteMunIbge,
        xMunEnv: remetenteMun,
        UFEnv: remetenteUf,
        modal,
        tpServ,
        cMunIni: munInicioIbge,
        xMunIni: munInicioNome,
        UFIni: munInicioUf,
        cMunFim: munFimIbge,
        xMunFim: munFimNome,
        UFFim: munFimUf,
        retira: '1',
        indIEToma,

        // 🔥 TOMADOR — backend lê data.tomadorServico (não "toma") pra decidir o
        // TomadorServicoCTe; mandar só "toma" fazia o backend sempre cair no
        // default REMETENTE, ignorando o que o usuário escolheu no formulário.
        toma: tomadorServico,
        tomadorServico,
        tomadorCNPJ: tomadorServico === 4 ? tomadorCNPJ : undefined,
        tomadorCPF: tomadorServico === 4 ? tomadorCPF : undefined,
        tomadorIE: tomadorServico === 4 ? tomadorIE : undefined,
        tomadorxNome: tomadorServico === 4 ? tomadorxNome : undefined,
        tomadorxFant: tomadorServico === 4 ? tomadorxFant : undefined,
        tomadorFone: tomadorServico === 4 ? tomadorFone : undefined,
        tomadorEmail: tomadorServico === 4 ? tomadorEmail : undefined,
        tomadorxLgr: tomadorServico === 4 ? tomadorxLgr : undefined,
        tomadorNro: tomadorServico === 4 ? tomadorNro : undefined,
        tomadorxCpl: tomadorServico === 4 ? tomadorxCpl : undefined,
        tomadorxBairro: tomadorServico === 4 ? tomadorxBairro : undefined,
        tomadorcMun: tomadorServico === 4 ? tomadorcMun : undefined,
        tomadorxMun: tomadorServico === 4 ? tomadorxMun : undefined,
        tomadorCEP: tomadorServico === 4 ? tomadorCEP : undefined,
        tomadorUF: tomadorServico === 4 ? tomadorUF : undefined,
        tomadorcPais: tomadorServico === 4 ? tomadorcPais : undefined,
        tomadorxPais: tomadorServico === 4 ? tomadorxPais : undefined,

        // CONTINGÊNCIA
        dhCont: dhCont || undefined,
        xJust: xJust || undefined,

        // COMPRAS GOVERNAMENTAIS
        tpEnteGov: tpEnteGov || undefined,
        pRedutor: pRedutor || undefined,
        tpOperGov: tpOperGov || undefined,

        // DADOS COMPLEMENTARES
        xCaracAd: undefined,
        xCaracSer: undefined,
        xEmi: undefined,
        xOrig,
        xDest,
        xRota,

        // PREVISÃO DE ENTREGA
        tpPer: tpPer !== '0' ? tpPer : undefined,
        dProg: dProg || undefined,
        dIni: dIni || undefined,
        dFim: dFim || undefined,
        tpHor: tpHor !== '0' ? tpHor : undefined,
        hProg: hProg || undefined,
        hIni: hIni || undefined,
        hFim: hFim || undefined,

        // VALORES DA PRESTAÇÃO
        vTPrest: totalFrete,
        vRec: totalFrete,

        // 🔥 aliquotaICMS é o que o backend usa pra montar o grupo ICMS00 de
        // verdade (hoje o único CST realmente persistido — ver observação mais
        // abaixo); sem essa chave o backend sempre usava 12% fixo, ignorando o
        // valor escolhido no formulário.
        aliquotaICMS,

        // IMPOSTOS
        CST00: cstICMS === '00' ? '00' : undefined,
        vBC00: cstICMS === '00' ? baseCalculoICMS : undefined,
        pICMS00: cstICMS === '00' ? aliquotaICMS : undefined,
        vICMS00: cstICMS === '00' ? valorICMS : undefined,

        CST20: cstICMS === '20' ? '20' : undefined,
        pRedBC20: cstICMS === '20' ? pRedBC : undefined,
        vBC20: cstICMS === '20' ? baseCalculoICMS : undefined,
        pICMS20: cstICMS === '20' ? aliquotaICMS : undefined,
        vICMS20: cstICMS === '20' ? valorICMS : undefined,

        CST45: ['40', '41', '51'].includes(cstICMS) ? cstICMS : undefined,

        CST60: cstICMS === '60' ? '60' : undefined,
        vBCSTRet: cstICMS === '60' ? baseCalculoICMS : undefined,
        vICMSSTRet: cstICMS === '60' ? (baseCalculoICMS * pICMSSTRet) / 100 : undefined,
        pICMSSTRet: cstICMS === '60' ? pICMSSTRet : undefined,
        vCred: cstICMS === '60' ? vCred : undefined,

        CST90: cstICMS === '90' ? '90' : undefined,
        pRedBC90: cstICMS === '90' ? pRedBC : undefined,
        vBC90: cstICMS === '90' ? baseCalculoICMS : undefined,
        pICMS90: cstICMS === '90' ? aliquotaICMS : undefined,
        vICMS90: cstICMS === '90' ? valorICMS : undefined,

        CSTSN: indSN ? '90' : undefined,
        indSN: indSN || undefined,

        CSTOutraUF: undefined,
        pRedBCOutraUF,
        vBCOutraUF: undefined,
        pICMSOutraUF,
        vICMSOutraUF: undefined,

        vBCUFFim: undefined,
        pFCPUFFim: undefined,
        pICMSUFFim: undefined,
        pICMSInter: undefined,
        vFCPUFFim: undefined,
        vICMSUFFim: undefined,
        vICMSUFIni: undefined,

        // IBS/CBS
        CSTIBSCBS: undefined,
        cClassTrib: undefined,
        indDoacao: undefined,
        vBCIBS: undefined,
        pIBSUF: undefined,
        vIBSUF: undefined,
        pIBSMun: undefined,
        vIBSMun: undefined,
        pCBS: undefined,
        vCBS: undefined,

        // TOTAL DO DOCUMENTO
        vTotDFe: totalFrete,

        // 🔥 INFORMAÇÕES DA CARGA — as chaves aqui precisam bater com o que
        // cteService.emitirCte() (backend) lê (data.produtoPredominante /
        // data.valorCargaAverbada), não com os nomes de coluna do Prisma
        // (proPred/vCarga/vCargaAverb, que o backend monta sozinho a partir
        // dessas duas chaves). Antes disso, produtoPredominante/valorCargaAverbada
        // nunca chegavam no banco — sempre "undefined" no create(), e como proPred
        // é NOT NULL, a emissão real sempre quebrava com "Argument proPred is missing".
        produtoPredominante,
        valorCargaAverbada,
        xOutCat,

        // VEÍCULOS NOVOS
        veicChassi: undefined,
        veicCor: undefined,
        veicxCor: undefined,
        veiccMod: undefined,
        veicvUnit: undefined,
        veicvFrete: undefined,

        // COBRANÇA
        nFat: String(numero),
        vOrig: totalFrete,
        vDesc: 0,
        vLiq: totalFrete,

        // CT-e DE SUBSTITUIÇÃO
        chCteSub: tpCTe === 'SUBSTITUICAO' ? chCteSub : undefined,
        indAlteraToma: tpCTe === 'SUBSTITUICAO' ? indAlteraToma : undefined,

        // CT-e GLOBALIZADO
        xObsGlobalizado: xObsGlobalizado || undefined,

        // 🔥 status/chaveAcesso/protocoloAutorizacao/xmlAssinado NÃO são enviados —
        // o backend gera e assina tudo isso de verdade (chave própria, transmissão
        // real à SEFAZ) e ignora qualquer valor vindo do cliente pra esses campos;
        // mandar um "AUTORIZADA"/protocolo fabricado aqui só confundiria quem lê o
        // payload, sem efeito real algum.

        // RELACIONAMENTOS
        empresaId: empresa.id,
        emitenteId: empresa.id,
        remetenteId: selectedRemetenteId,
        destinatarioId: selectedDestinatarioId,
        transportadoraId: selectedTransportadoraId || undefined,

        // SUB-ESTRUTURAS
        componentes: [
          { xNome: 'FRETE PESO', vComp: fretePeso },
          { xNome: 'FRETE VALOR', vComp: freteValor },
          { xNome: 'PEDAGIO', vComp: pedagio },
          { xNome: 'GRIS', vComp: taxaGris },
          ...(outrasTaxas > 0 ? [{ xNome: 'OUTRAS TAXAS', vComp: outrasTaxas }] : []),
        ],
        quantidades,
        // ⚠️ Achado nesta revisão: o formulário juntava as chaves de NF-e (seção
        // "Documentos Transportados") mas nunca as incluía no payload — a SEFAZ
        // rejeita todo CT-e sem esse grupo ("Grupo Documentos Transportados deve
        // ser informado"), confirmado testando contra a SEFAZ real.
        documentos,
        duplicatas: [{ nDup: `${numero}/01`, dVenc: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), vDup: totalFrete }],
        observacoes: xObs ? [{ xCampo: 'obsGeral', xTexto: xObs }] : [],
        autorizadosDownload: autXML.filter(a => a.CNPJ || a.CPF),
      };

      const response = await cteService.emitir(novoCte as unknown as CTeDocumento);

      if (response) {
        StorageService.addCte(response);
        onCteEmitido(response);
        setSucessoCte(response);
        setTentouEnviar(false);
        // 🔥 O backend não lança erro quando a SEFAZ rejeita — o modal de
        // resumo abaixo mostra o status real (AUTORIZADA/REJEITADA) e o
        // motivo, então não tem mais um toast que sempre dizia "sucesso".
      }

    } catch (error: unknown) {
      console.error('Erro ao emitir CT-e:', error);
      const mensagemErro = getApiErrorMessage(error, 'Falha ao emitir CT-e junto à SEFAZ.');
      setErros([mensagemErro]);
      toast.showError(`${mensagemErro}`);
    } finally {
      setIsTransmitting(false);
      setShowPreview(false);
    }
  };

  // ============================================================
  // CORES - CYAN (ORIGINAL)
  // ============================================================
  const cor = 'cyan';
  const corBg = 'bg-brand-50';
  const corBorder = 'border-brand-200';
  const corText = 'text-brand-700';
  const corTextDark = 'text-brand-800';
  const corBgButton = 'bg-brand-600 hover:bg-brand-700';
  const corBgBadge = 'bg-brand-100';
  const corFocus = 'focus:ring-brand-500';
  const corIconBg = 'bg-brand-600';

  // ============================================================
  // RENDER - LAYOUT ORIGINAL (SEM CÍRCULOS, SEM FUNDO COLORIDO)
  // ============================================================
  return (
    <EmissorLayout
      icone={Truck}
      titulo="Novo CT-e"
      descricao="Conhecimento de transporte de cargas rodoviário, intermunicipal e interestadual."
      modelo="Mod. 57"
      serie={serie}
      proximoNumero={empresa.proximoNumeroCte || 1}
      ambiente={empresa.ambienteEmissao}
      acoes={
        <BotaoCabecalho
          onClick={handleCarregarUltima}
          icone={RefreshCw}
          carregando={isCarregandoUltima}
          title="Preenche o formulário com os dados do último CT-e autorizado"
        >
          {isCarregandoUltima ? 'Carregando…' : 'Carregar último CT-e'}
        </BotaoCabecalho>
      }
      secoes={[
        { id: 'remetente', titulo: 'Remetente' },
        { id: 'destinatario', titulo: 'Destinatário' },
        { id: 'tomador', titulo: 'Tomador do serviço' },
        { id: 'identificacao', titulo: 'Identificação' },
        { id: 'percurso', titulo: 'Percurso' },
        { id: 'carga', titulo: 'Carga transportada' },
        { id: 'transportadora', titulo: 'Transportadora' },
        { id: 'frete', titulo: 'Componentes do frete' },
        { id: 'icms', titulo: 'Tributação ICMS' },
        { id: 'entrega', titulo: 'Previsão de entrega' },
        { id: 'observacoes', titulo: 'Observações' },
        { id: 'autorizados', titulo: 'Autorizados para download' },
      ]}
      resumo={
        <ResumoEmissor
          total={{ rotulo: 'Valor da prestação', valor: totalFrete }}
          linhas={[
            { rotulo: 'Frete peso', valor: fretePeso },
            { rotulo: 'Frete valor', valor: freteValor },
            { rotulo: 'Pedágio', valor: pedagio },
            { rotulo: 'GRIS', valor: taxaGris },
            { rotulo: 'Outras taxas', valor: outrasTaxas },
            { rotulo: `ICMS (${aliquotaICMS}%)`, valor: valorICMS, tom: 'sutil' },
            { rotulo: 'Tributos aprox.', valor: valorTributosAprox, tom: 'sutil' },
          ]}
          info={[
            { rotulo: 'Percurso', valor: `${munInicioUf} → ${munFimUf}` },
            { rotulo: 'Carga averbada', valor: formatarMoeda(valorCargaAverbada) },
          ]}
          pronto={tentouEnviar && erros.length === 0}
          pendencias={erros}
          emitir={{ rotulo: 'Revisar e emitir CT-e', onClick: handleClickEmitir, transmitindo: isTransmitting }}
          onPreview={handleClickEmitir}
          onLimpar={onLimparTudo}
        />
      }
    >

      {sucessoCte && (
        <ResumoEmissaoModal
          aberto={!!sucessoCte}
          onClose={() => setSucessoCte(null)}
          status={((sucessoCte as unknown as { status?: string }).status as 'AUTORIZADA' | 'REJEITADA' | 'PROCESSANDO') || 'PROCESSANDO'}
          tipoDocumentoLabel="CT-e"
          numero={Number(sucessoCte.nCT) || 0}
          serie={Number(sucessoCte.serie) || 1}
          chaveAcesso={sucessoCte.chaveAcesso}
          protocolo={sucessoCte.protocoloAutorizacao || undefined}
          motivoRejeicao={(sucessoCte as unknown as { motivoRejeicao?: string }).motivoRejeicao || undefined}
          valorTotal={Number(sucessoCte.vTPrest) || 0}
          destinatarioNome={sucessoCte.destinatario?.nomeRazaoSocial || undefined}
          emailSugerido={empresa.contadorEmail || empresa.endereco?.email || ''}
          onVisualizar={() => sucessoCte?.id && onViewDacte(sucessoCte.id)}
          onEnviarEmail={(email) => cteService.enviarPorEmail(sucessoCte.id, email)}
        />
      )}


      <SecaoEmissor id="remetente" numero={1} titulo="Remetente" icone={User} descricao="Quem envia a carga"
        acao={
          <>
          <select
            value={selectedRemetenteId}
            onChange={(e) => handleSelectRemetente(e.target.value)}
            className={classeCampo(selectedRemetenteId, `text-xs bg-ink-50 border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 ${corFocus} font-medium text-ink-700 max-w-[200px]`)}
          >
            <option value="">-- Escolher Cliente --</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>{c.razaoSocial}</option>
            ))}
          </select>
          </>
        }
      >

        <div className="grid grid-cols-1 gap-x-4 gap-y-2.5 text-xs md:grid-cols-2">
          <div>
            <label className="block font-medium text-ink-600 mb-1">CNPJ / CPF <span className="text-danger">*</span></label>
            <CampoCpfCnpj
              value={remetenteDoc}
              onChange={setRemetenteDoc}
              className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              placeholder="00.000.000/0000-00"
            />
          </div>
          <div>
            <label className="block font-medium text-ink-600 mb-1">Razão Social <span className="text-danger">*</span></label>
            <input
              type="text"
              value={remetenteNome}
              onChange={(e) => setRemetenteNome(e.target.value)}
              className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              placeholder="Nome ou Razão Social"
            />
          </div>
          <div>
            <label className="block font-medium text-ink-600 mb-1">Inscrição Estadual</label>
            <input
              type="text"
              value={remetenteIE}
              onChange={(e) => setRemetenteIE(e.target.value)}
              className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              placeholder="ISENTO ou número"
            />
          </div>
          <div>
            <label className="block font-medium text-ink-600 mb-1">IE ST</label>
            <input
              type="text"
              value={remetenteIEST}
              onChange={(e) => setRemetenteIEST(e.target.value)}
              className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              placeholder="2-14 dígitos"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-medium text-ink-600 mb-1">Município</label>
              <input
                type="text"
                value={remetenteMun}
                onChange={(e) => {
                  setRemetenteMun(e.target.value);
                  setMunInicioNome(e.target.value);
                }}
                className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                placeholder="Cidade"
              />
            </div>
            <div>
              <label className="block font-medium text-ink-600 mb-1">UF</label>
              <input
                type="text"
                value={remetenteUf}
                onChange={(e) => {
                  setRemetenteUf(e.target.value);
                  setMunInicioUf(e.target.value);
                }}
                className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus} uppercase`}
                maxLength={2}
                placeholder="SP"
              />
            </div>
          </div>
          <div>
            <label className="block font-medium text-ink-600 mb-1">Logradouro</label>
            <input
              type="text"
              value={remetenteLogradouro}
              onChange={(e) => setRemetenteLogradouro(e.target.value)}
              className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              placeholder="Rua, Avenida..."
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-medium text-ink-600 mb-1">Número</label>
              <input
                type="text"
                value={remetenteNumero}
                onChange={(e) => setRemetenteNumero(e.target.value)}
                className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                placeholder="123"
              />
            </div>
            <div>
              <label className="block font-medium text-ink-600 mb-1">Complemento</label>
              <input
                type="text"
                value={remetenteComplemento}
                onChange={(e) => setRemetenteComplemento(e.target.value)}
                className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                placeholder="Complemento"
              />
            </div>
          </div>
          <div>
            <label className="block font-medium text-ink-600 mb-1">Bairro</label>
            <input
              type="text"
              value={remetenteBairro}
              onChange={(e) => setRemetenteBairro(e.target.value)}
              className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              placeholder="Bairro"
            />
          </div>
          <div>
            <label className="block font-medium text-ink-600 mb-1">CEP</label>
            <input
              type="text"
              value={remetenteCep}
              onChange={(e) => setRemetenteCep(e.target.value)}
              className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              placeholder="00000-000"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-medium text-ink-600 mb-1">Telefone</label>
              <input
                type="text"
                value={remetenteFone}
                onChange={(e) => setRemetenteFone(e.target.value)}
                className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                placeholder="(00) 0000-0000"
              />
            </div>
            <div>
              <label className="block font-medium text-ink-600 mb-1">E-mail</label>
              <input
                type="email"
                value={remetenteEmail}
                onChange={(e) => setRemetenteEmail(e.target.value)}
                className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                placeholder="email@empresa.com"
              />
            </div>
          </div>
        </div>
      </SecaoEmissor>

      <SecaoEmissor id="destinatario" numero={2} titulo="Destinatário" icone={Building} descricao="Quem recebe a carga"
        acao={
          <>
          <select
            value={selectedDestinatarioId}
            onChange={(e) => handleSelectDestinatario(e.target.value)}
            className={classeCampo(selectedDestinatarioId, `text-xs bg-ink-50 border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 ${corFocus} font-medium text-ink-700 max-w-[200px]`)}
          >
            <option value="">-- Escolher Cliente --</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>{c.razaoSocial}</option>
            ))}
          </select>
          </>
        }
      >

        <div className="grid grid-cols-1 gap-x-4 gap-y-2.5 text-xs md:grid-cols-2">
          <div>
            <label className="block font-medium text-ink-600 mb-1">CNPJ / CPF <span className="text-danger">*</span></label>
            <CampoCpfCnpj
              value={destinatarioDoc}
              onChange={setDestinatarioDoc}
              className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              placeholder="00.000.000/0000-00"
            />
          </div>
          <div>
            <label className="block font-medium text-ink-600 mb-1">Razão Social <span className="text-danger">*</span></label>
            <input
              type="text"
              value={destinatarioNome}
              onChange={(e) => setDestinatarioNome(e.target.value)}
              className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              placeholder="Nome ou Razão Social"
            />
          </div>
          <div>
            <label className="block font-medium text-ink-600 mb-1">Inscrição Estadual</label>
            <input
              type="text"
              value={destinatarioIE}
              onChange={(e) => setDestinatarioIE(e.target.value)}
              className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              placeholder="ISENTO ou número"
            />
          </div>
          <div>
            <label className="block font-medium text-ink-600 mb-1">IE ST</label>
            <input
              type="text"
              value={destinatarioIEST}
              onChange={(e) => setDestinatarioIEST(e.target.value)}
              className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              placeholder="2-14 dígitos"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-medium text-ink-600 mb-1">Município Destino</label>
              <input
                type="text"
                value={destinatarioMun}
                onChange={(e) => {
                  setDestinatarioMun(e.target.value);
                  setMunFimNome(e.target.value);
                }}
                className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                placeholder="Cidade"
              />
            </div>
            <div>
              <label className="block font-medium text-ink-600 mb-1">UF Destino</label>
              <input
                type="text"
                value={destinatarioUf}
                onChange={(e) => {
                  setDestinatarioUf(e.target.value);
                  setMunFimUf(e.target.value);
                }}
                className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus} uppercase`}
                maxLength={2}
                placeholder="RJ"
              />
            </div>
          </div>
          <div>
            <label className="block font-medium text-ink-600 mb-1">Logradouro</label>
            <input
              type="text"
              value={destinatarioLogradouro}
              onChange={(e) => setDestinatarioLogradouro(e.target.value)}
              className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              placeholder="Rua, Avenida..."
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-medium text-ink-600 mb-1">Número</label>
              <input
                type="text"
                value={destinatarioNumero}
                onChange={(e) => setDestinatarioNumero(e.target.value)}
                className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                placeholder="123"
              />
            </div>
            <div>
              <label className="block font-medium text-ink-600 mb-1">Complemento</label>
              <input
                type="text"
                value={destinatarioComplemento}
                onChange={(e) => setDestinatarioComplemento(e.target.value)}
                className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                placeholder="Complemento"
              />
            </div>
          </div>
          <div>
            <label className="block font-medium text-ink-600 mb-1">Bairro</label>
            <input
              type="text"
              value={destinatarioBairro}
              onChange={(e) => setDestinatarioBairro(e.target.value)}
              className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              placeholder="Bairro"
            />
          </div>
          <div>
            <label className="block font-medium text-ink-600 mb-1">CEP</label>
            <input
              type="text"
              value={destinatarioCep}
              onChange={(e) => setDestinatarioCep(e.target.value)}
              className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              placeholder="00000-000"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-medium text-ink-600 mb-1">Telefone</label>
              <input
                type="text"
                value={destinatarioFone}
                onChange={(e) => setDestinatarioFone(e.target.value)}
                className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                placeholder="(00) 0000-0000"
              />
            </div>
            <div>
              <label className="block font-medium text-ink-600 mb-1">E-mail</label>
              <input
                type="email"
                value={destinatarioEmail}
                onChange={(e) => setDestinatarioEmail(e.target.value)}
                className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                placeholder="email@empresa.com"
              />
            </div>
          </div>
        </div>
      </SecaoEmissor>

      <SecaoEmissor id="tomador" numero={3} titulo="Tomador do serviço" icone={UserCheck} descricao="Quem paga pelo frete">
        <div className="grid grid-cols-1 gap-x-4 gap-y-2.5 text-xs md:grid-cols-2">
          <div>
            <label className="block font-medium text-ink-600 mb-1">Tomador do Serviço</label>
            <select
              value={tomadorServico}
              onChange={(e) => setTomadorServico(parseInt(e.target.value) as TomadorServicoCTe)}
              className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
            >
              <option value={0}>0 - Remetente (CIF)</option>
              <option value={1}>1 - Expedidor</option>
              <option value={2}>2 - Recebedor</option>
              <option value={3}>3 - Destinatário (FOB)</option>
              <option value={4}>4 - Outros</option>
            </select>
          </div>

          {tomadorServico === 4 && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-ink-600 mb-1">CNPJ</label>
                  <CampoCpfCnpj tipo="CNPJ"
                    value={tomadorCNPJ}
                    onChange={setTomadorCNPJ}
                    className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                    placeholder="00.000.000/0000-00"
                  />
                </div>
                <div>
                  <label className="block font-medium text-ink-600 mb-1">Nome</label>
                  <input
                    type="text"
                    value={tomadorxNome}
                    onChange={(e) => setTomadorxNome(e.target.value)}
                    className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                    placeholder="Nome"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-ink-600 mb-1">IE</label>
                  <input
                    type="text"
                    value={tomadorIE}
                    onChange={(e) => setTomadorIE(e.target.value)}
                    className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                    placeholder="Inscrição Estadual"
                  />
                </div>
                <div>
                  <label className="block font-medium text-ink-600 mb-1">UF</label>
                  <input
                    type="text"
                    value={tomadorUF}
                    onChange={(e) => setTomadorUF(e.target.value.toUpperCase())}
                    className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus} uppercase`}
                    maxLength={2}
                    placeholder="SP"
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium text-ink-600 mb-1">Logradouro</label>
                <input
                  type="text"
                  value={tomadorxLgr}
                  onChange={(e) => setTomadorxLgr(e.target.value)}
                  className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                  placeholder="Rua, Avenida..."
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-ink-600 mb-1">Número</label>
                  <input
                    type="text"
                    value={tomadorNro}
                    onChange={(e) => setTomadorNro(e.target.value)}
                    className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                    placeholder="123"
                  />
                </div>
                <div>
                  <label className="block font-medium text-ink-600 mb-1">Complemento</label>
                  <input
                    type="text"
                    value={tomadorxCpl}
                    onChange={(e) => setTomadorxCpl(e.target.value)}
                    className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                    placeholder="Complemento"
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium text-ink-600 mb-1">Bairro</label>
                <input
                  type="text"
                  value={tomadorxBairro}
                  onChange={(e) => setTomadorxBairro(e.target.value)}
                  className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                  placeholder="Bairro"
                />
              </div>
              <div>
                <label className="block font-medium text-ink-600 mb-1">CEP</label>
                <input
                  type="text"
                  value={tomadorCEP}
                  onChange={(e) => setTomadorCEP(e.target.value)}
                  className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                  placeholder="00000-000"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-ink-600 mb-1">Telefone</label>
                  <input
                    type="text"
                    value={tomadorFone}
                    onChange={(e) => setTomadorFone(e.target.value)}
                    className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                    placeholder="(00) 0000-0000"
                  />
                </div>
                <div>
                  <label className="block font-medium text-ink-600 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={tomadorEmail}
                    onChange={(e) => setTomadorEmail(e.target.value)}
                    className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                    placeholder="email@empresa.com"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </SecaoEmissor>

      <SecaoEmissor id="identificacao" numero={4} titulo="Identificação" icone={Hash} descricao="Natureza, CFOP, tipo de CT-e e serviço">
        <div className="grid grid-cols-1 gap-x-4 gap-y-2.5 text-xs md:grid-cols-2">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block font-medium text-ink-600 mb-1">Tipo de CT-e</label>
              <select
                value={tpCTe}
                onChange={(e) => setTpCTe(e.target.value as TipoCTe)}
                className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              >
                <option value="NORMAL">Normal</option>
                <option value="COMPLEMENTO_VALORES">Complemento</option>
                <option value="SUBSTITUICAO">Substituição</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-ink-600 mb-1">Modal</label>
              <select
                value={modal}
                onChange={(e) => setModal(e.target.value as ModalCTe)}
                className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              >
                <option value="RODOVIARIO">Rodoviário</option>
                <option value="AEREO">Aéreo</option>
                <option value="AQUAVIARIO">Aquaviário</option>
                <option value="FERROVIARIO">Ferroviário</option>
                <option value="DUTOVIARIO">Dutoviário</option>
                <option value="MULTIMODAL">Multimodal</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-ink-600 mb-1">CFOP</label>
              <input
                type="text"
                value={CFOP}
                onChange={(e) => setCFOP(e.target.value)}
                className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus} font-mono`}
                placeholder="6353"
                maxLength={3}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-medium text-ink-600 mb-1">Série</label>
              <input
                type="number"
                value={serie}
                onChange={(e) => setSerie(parseInt(e.target.value) || 1)}
                className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                min={0}
                max={999}
              />
            </div>
            <div>
              <label className="block font-medium text-ink-600 mb-1">Natureza da Operação</label>
              <input
                type="text"
                value={natOp}
                onChange={(e) => setNatOp(e.target.value)}
                className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                placeholder="Descrição da natureza"
                maxLength={60}
              />
            </div>
          </div>
          {tpCTe === 'SUBSTITUICAO' && (
            <div>
              <label className="block font-medium text-ink-600 mb-1">Chave CT-e Substituído</label>
              <input
                type="text"
                value={chCteSub}
                onChange={(e) => setChCteSub(limparChaveAcesso(e.target.value))}
                className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus} font-mono`}
                placeholder="44 dígitos"
                maxLength={44}
              />
            </div>
          )}
          {tpCTe === 'COMPLEMENTO_VALORES' && (
            <div>
              <label className="block font-medium text-ink-600 mb-1">Chave CT-e Complementado</label>
              <input
                type="text"
                value={chCTeComplementado}
                onChange={(e) => setChCTeComplementado(limparChaveAcesso(e.target.value))}
                className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus} font-mono`}
                placeholder="44 dígitos"
                maxLength={44}
              />
            </div>
          )}
        </div>
      </SecaoEmissor>

      <SecaoEmissor id="percurso" numero={5} titulo="Percurso" icone={Route} descricao="Município de início e fim da prestação">
        <div className="grid grid-cols-1 gap-x-4 gap-y-2.5 text-xs md:grid-cols-2">
          <div>
            <label className="block font-medium text-ink-600 mb-1">Início da Prestação</label>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <input
                  type="text"
                  value={munInicioNome}
                  onChange={(e) => {
                    setMunInicioNome(e.target.value);
                    setRemetenteMun(e.target.value);
                  }}
                  className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                  placeholder="Cidade"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={munInicioUf}
                  onChange={(e) => {
                    setMunInicioUf(e.target.value.toUpperCase());
                    setRemetenteUf(e.target.value.toUpperCase());
                  }}
                  className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus} uppercase`}
                  maxLength={2}
                  placeholder="UF"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block font-medium text-ink-600 mb-1">Código IBGE Início</label>
            <input
              type="text"
              value={munInicioIbge}
              onChange={(e) => {
                setMunInicioIbge(e.target.value);
                setRemetenteMunIbge(e.target.value);
              }}
              className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus} font-mono`}
              placeholder="7 dígitos"
              maxLength={7}
            />
          </div>
          <div>
            <label className="block font-medium text-ink-600 mb-1">Término da Prestação</label>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <input
                  type="text"
                  value={munFimNome}
                  onChange={(e) => {
                    setMunFimNome(e.target.value);
                    setDestinatarioMun(e.target.value);
                  }}
                  className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                  placeholder="Cidade"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={munFimUf}
                  onChange={(e) => {
                    setMunFimUf(e.target.value.toUpperCase());
                    setDestinatarioUf(e.target.value.toUpperCase());
                  }}
                  className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus} uppercase`}
                  maxLength={2}
                  placeholder="UF"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block font-medium text-ink-600 mb-1">Código IBGE Fim</label>
            <input
              type="text"
              value={munFimIbge}
              onChange={(e) => {
                setMunFimIbge(e.target.value);
                setDestinatarioMunIbge(e.target.value);
              }}
              className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus} font-mono`}
              placeholder="7 dígitos"
              maxLength={7}
            />
          </div>
        </div>
      </SecaoEmissor>

      <SecaoEmissor id="carga" numero={6} titulo="Carga transportada" icone={Package} descricao="Produto predominante, quantidades e documentos"
        acao={
          <>
          <span className="text-[10px] text-ink-400">{quantidades.length} quantidades</span>
          </>
        }
      >

        <div className="grid grid-cols-1 gap-x-4 gap-y-2.5 text-xs md:grid-cols-2">
          <div>
            <label className="block font-medium text-ink-600 mb-1">Produto Predominante <span className="text-danger">*</span></label>
            <input
              type="text"
              value={produtoPredominante}
              onChange={(e) => setProdutoPredominante(e.target.value)}
              className={classeCampo(produtoPredominante)}
            />
          </div>
          <div>
            <label className="block font-medium text-ink-600 mb-1">Valor Carga (R$) <span className="text-danger">*</span></label>
            <input
              type="number"
              value={valorCargaAverbada}
              onChange={(e) => setValorCargaAverbada(parseFloat(e.target.value) || 0)}
              className={classeCampo(tentouEnviar && valorCargaAverbada <= 0 ? '' : 'x', `w-full border rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus} font-bold`)}
            />
          </div>
          <div>
            <label className="block font-medium text-ink-600 mb-1">Outras Características</label>
            <input
              type="text"
              value={xOutCat}
              onChange={(e) => setXOutCat(e.target.value)}
              className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              placeholder="FRIA, GRANEL, etc"
            />
          </div>

          <div className="pt-2 border-t border-ink-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-ink-600">Quantidades da Carga</span>
              <button
                type="button"
                onClick={adicionarQuantidade}
                className={`text-xs ${corText} hover:text-brand-800 font-medium flex items-center gap-1 cursor-pointer`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </button>
            </div>
            <div className="space-y-1.5">
              {quantidades.map((q, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-2">
                    <select
                      value={q.cUnid}
                      onChange={(e) => atualizarQuantidade(idx, 'cUnid', e.target.value)}
                      className={`w-full border border-ink-300 rounded-lg p-1 focus:outline-none focus:ring-2 ${corFocus} text-xs`}
                    >
                      <option value="00">M3</option>
                      <option value="01">KG</option>
                      <option value="02">TON</option>
                      <option value="03">UNIDADE</option>
                      <option value="04">LITROS</option>
                      <option value="05">MMBTU</option>
                    </select>
                  </div>
                  <div className="col-span-4">
                    <input
                      type="text"
                      value={q.tpMed}
                      onChange={(e) => atualizarQuantidade(idx, 'tpMed', e.target.value)}
                      className={`w-full border border-ink-300 rounded-lg p-1 focus:outline-none focus:ring-2 ${corFocus} text-xs`}
                      placeholder="Tipo (ex: PESO BRUTO)"
                    />
                  </div>
                  <div className="col-span-4">
                    <input
                      type="number"
                      step="0.0001"
                      value={q.qCarga}
                      onChange={(e) => atualizarQuantidade(idx, 'qCarga', parseFloat(e.target.value) || 0)}
                      className={`w-full border border-ink-300 rounded-lg p-1 focus:outline-none focus:ring-2 ${corFocus} text-xs font-bold`}
                    />
                  </div>
                  <div className="col-span-2 text-right">
                    <button
                      type="button"
                      onClick={() => removerQuantidade(idx)}
                      className="text-ink-400 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {quantidades.length === 0 && (
                <div className="text-xs text-ink-400 text-center py-2">
                  Nenhuma quantidade cadastrada. Clique em "Adicionar".
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-ink-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-ink-600">Documentos Transportados (NF-e)</span>
              <span className="text-[10px] text-ink-400">{documentos.length} documento(s)</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={chavesNfeTexto}
                onChange={(e) => setChavesNfeTexto(e.target.value)}
                className={`flex-1 border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus} text-xs font-mono`}
                placeholder="Digite as chaves das NF-e (44 dígitos)"
              />
              <button
                type="button"
                onClick={adicionarDocumento}
                className={`${corBgButton} text-white text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </button>
            </div>
            {documentos.length > 0 ? (
              <div className="mt-2 space-y-1">
                {documentos.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-ink-50 rounded-lg px-2 py-1 text-xs">
                    <span className="font-mono text-ink-700 truncate max-w-md">{doc.chave}</span>
                    <button
                      type="button"
                      onClick={() => removerDocumento(idx)}
                      className="text-ink-400 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`mt-2 text-center py-2 rounded-lg border ${
                tentouEnviar ? 'border-rose-300 bg-rose-50 text-rose-700' : 'border-ink-200 bg-ink-50/70 text-ink-400'
              }`}>
                <p className="text-xs font-semibold">Nenhum documento transportado adicionado</p>
                <p className="text-[11px]">Adicione ao menos 1 chave de NF-e acima</p>
              </div>
            )}
          </div>
        </div>
      </SecaoEmissor>

      <SecaoEmissor id="transportadora" numero={7} titulo="Transportadora" icone={Truck} descricao="Quem executa o transporte">
        <div className="text-xs">
          <label className="block font-medium text-ink-600 mb-1">Transportadora (opcional — carga própria fica ISENTO de RNTRC)</label>
          <select
            value={selectedTransportadoraId}
            onChange={(e) => setSelectedTransportadoraId(e.target.value)}
            className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
          >
            <option value="">-- Carga própria (sem transportadora terceirizada) --</option>
            {transportadoras.map(t => (
              <option key={t.id} value={t.id}>{t.razaoSocial} {t.rntrc ? `— RNTRC ${t.rntrc}` : ''}</option>
            ))}
          </select>
          {selectedTransportadoraId && (
            <p className="text-[11px] text-ink-500 mt-1">
              RNTRC: {transportadoras.find(t => t.id === selectedTransportadoraId)?.rntrc || 'não cadastrado para esta transportadora'}
            </p>
          )}
        </div>
      </SecaoEmissor>

      <SecaoEmissor id="frete" numero={8} titulo="Componentes do frete" icone={Calculator} descricao="Composição do valor da prestação">

        <div className="grid grid-cols-1 gap-x-4 gap-y-2.5 text-xs md:grid-cols-2">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <div>
              <label className="block font-medium text-ink-600 mb-1">Frete Peso</label>
              <input
                type="number"
                value={fretePeso}
                onChange={(e) => setFretePeso(parseFloat(e.target.value) || 0)}
                className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus} font-semibold`}
              />
            </div>
            <div>
              <label className="block font-medium text-ink-600 mb-1">Frete Valor</label>
              <input
                type="number"
                value={freteValor}
                onChange={(e) => setFreteValor(parseFloat(e.target.value) || 0)}
                className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              />
            </div>
            <div>
              <label className="block font-medium text-ink-600 mb-1">Pedágio</label>
              <input
                type="number"
                value={pedagio}
                onChange={(e) => setPedagio(parseFloat(e.target.value) || 0)}
                className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              />
            </div>
            <div>
              <label className="block font-medium text-ink-600 mb-1">Taxa GRIS</label>
              <input
                type="number"
                value={taxaGris}
                onChange={(e) => setTaxaGris(parseFloat(e.target.value) || 0)}
                className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              />
            </div>
            <div>
              <label className="block font-medium text-ink-600 mb-1">Outras Taxas</label>
              <input
                type="number"
                value={outrasTaxas}
                onChange={(e) => setOutrasTaxas(parseFloat(e.target.value) || 0)}
                className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              />
            </div>
          </div>

          <div className={`mt-3 p-3 ${corBg} rounded-lg border ${corBorder} text-xs`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex flex-wrap gap-3">
                <span className="text-ink-600">Base ICMS: <strong>{formatarMoeda(baseCalculoICMS)}</strong></span>
                <span className="text-ink-600">ICMS: <strong className={corText}>{formatarMoeda(valorICMS)}</strong></span>
                <span className="text-ink-600 text-[11px]">PIS/COFINS: {formatarMoeda(valorPIS + valorCOFINS)}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-ink-500 block">Total do Frete</span>
                <span className={`text-lg font-extrabold ${corText}`}>{formatarMoeda(totalFrete)}</span>
              </div>
            </div>
          </div>
        </div>
      </SecaoEmissor>

      <SecaoEmissor id="icms" numero={9} titulo="Tributação ICMS" icone={Shield} descricao="Situação tributária, base e alíquota">
        <div className="grid grid-cols-1 gap-x-4 gap-y-2.5 text-xs md:grid-cols-2">
          <div>
            <label className="block font-medium text-ink-600 mb-1">CST ICMS</label>
            <select
              value={cstICMS}
              onChange={(e) => setCstICMS(e.target.value)}
              className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
            >
              <option value="00">00 - Tributação Normal</option>
              <option value="20">20 - Redução BC</option>
              <option value="40">40 - Isenta</option>
              <option value="41">41 - Não Tributada</option>
              <option value="51">51 - Diferida</option>
              <option value="60">60 - Substituição Tributária</option>
              <option value="90">90 - Outros</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-medium text-ink-600 mb-1">Alíquota %</label>
              <input
                type="number"
                step="0.01"
                value={aliquotaICMS}
                onChange={(e) => setAliquotaICMS(parseFloat(e.target.value) || 0)}
                className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              />
            </div>
            <div>
              <label className="block font-medium text-ink-600 mb-1">Redução BC %</label>
              <input
                type="number"
                step="0.01"
                value={pRedBC}
                onChange={(e) => setPRedBC(parseFloat(e.target.value) || 0)}
                className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              />
            </div>
          </div>
          {cstICMS === '60' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-medium text-ink-600 mb-1">Alíq. ST %</label>
                <input
                  type="number"
                  step="0.01"
                  value={pICMSSTRet}
                  onChange={(e) => setPICMSSTRet(parseFloat(e.target.value) || 0)}
                  className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                />
              </div>
              <div>
                <label className="block font-medium text-ink-600 mb-1">Crédito Outorgado</label>
                <input
                  type="number"
                  step="0.01"
                  value={vCred}
                  onChange={(e) => setVCred(parseFloat(e.target.value) || 0)}
                  className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                />
              </div>
            </div>
          )}
          <div>
            <label className="flex items-center gap-2 text-ink-700 font-medium">
              <input
                type="checkbox"
                checked={!!indSN}
                onChange={(e) => setIndSN(e.target.checked ? '1' : '')}
                className={`rounded ${corFocus} cursor-pointer`}
              />
              <span>Simples Nacional (indSN=1)</span>
            </label>
          </div>
        </div>
      </SecaoEmissor>

      <SecaoEmissor id="entrega" numero={10} titulo="Previsão de entrega" icone={Calendar} descricao="Data e horário previstos">
        <div className="grid grid-cols-1 gap-x-4 gap-y-2.5 text-xs md:grid-cols-2">
          <div>
            <label className="block font-medium text-ink-600 mb-1">Tipo de Período</label>
            <select
              value={tpPer}
              onChange={(e) => setTpPer(e.target.value)}
              className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
            >
              <option value="0">Sem data definida</option>
              <option value="1">Na data</option>
              <option value="2">Até a data</option>
              <option value="3">A partir da data</option>
              <option value="4">No período</option>
            </select>
          </div>
          {tpPer === '1' || tpPer === '2' || tpPer === '3' ? (
            <div>
              <label className="block font-medium text-ink-600 mb-1">Data Programada</label>
              <input
                type="date"
                value={dProg}
                onChange={(e) => setDProg(e.target.value)}
                className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              />
            </div>
          ) : tpPer === '4' ? (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-medium text-ink-600 mb-1">Data Inicial</label>
                <input
                  type="date"
                  value={dIni}
                  onChange={(e) => setDIni(e.target.value)}
                  className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                />
              </div>
              <div>
                <label className="block font-medium text-ink-600 mb-1">Data Final</label>
                <input
                  type="date"
                  value={dFim}
                  onChange={(e) => setDFim(e.target.value)}
                  className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                />
              </div>
            </div>
          ) : null}
          {tpPer !== '0' && (
            <div>
              <label className="block font-medium text-ink-600 mb-1">Tipo de Hora</label>
              <select
                value={tpHor}
                onChange={(e) => setTpHor(e.target.value)}
                className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              >
                <option value="0">Sem hora definida</option>
                <option value="1">No horário</option>
                <option value="2">Até o horário</option>
                <option value="3">A partir do horário</option>
                <option value="4">No intervalo</option>
              </select>
            </div>
          )}
          {tpHor === '1' || tpHor === '2' || tpHor === '3' ? (
            <div>
              <label className="block font-medium text-ink-600 mb-1">Hora Programada</label>
              <input
                type="time"
                value={hProg}
                onChange={(e) => setHProg(e.target.value)}
                className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                step="1"
              />
            </div>
          ) : tpHor === '4' ? (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-medium text-ink-600 mb-1">Hora Inicial</label>
                <input
                  type="time"
                  value={hIni}
                  onChange={(e) => setHIni(e.target.value)}
                  className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                  step="1"
                />
              </div>
              <div>
                <label className="block font-medium text-ink-600 mb-1">Hora Final</label>
                <input
                  type="time"
                  value={hFim}
                  onChange={(e) => setHFim(e.target.value)}
                  className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                  step="1"
                />
              </div>
            </div>
          ) : null}
        </div>
      </SecaoEmissor>

      <SecaoEmissor id="observacoes" numero={11} titulo="Observações" icone={FileText} descricao="Informações complementares do documento">
        <div className="grid grid-cols-1 gap-x-4 gap-y-2.5 text-xs md:grid-cols-2">
          <div>
            <label className="block font-medium text-ink-600 mb-1">Observações Gerais</label>
            <textarea
              rows={3}
              value={xObs}
              onChange={(e) => setXObs(e.target.value)}
              className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus} resize-none`}
              placeholder="Observações complementares..."
            />
          </div>
          <div>
            <label className="block font-medium text-ink-600 mb-1">Informações Adicionais Fisco</label>
            <textarea
              rows={2}
              value={infAdFisco}
              onChange={(e) => setInfAdFisco(e.target.value)}
              className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus} resize-none`}
              placeholder="Informações de interesse do Fisco..."
            />
          </div>
          {tpCTe === 'SUBSTITUICAO' && (
            <div>
              <label className="block font-medium text-ink-600 mb-1">Alteração de Tomador</label>
              <select
                value={indAlteraToma}
                onChange={(e) => setIndAlteraToma(e.target.value)}
                className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              >
                <option value="">Não</option>
                <option value="1">Sim</option>
              </select>
            </div>
          )}
          {tpCTe === 'NORMAL' && (
            <div>
              <label className="block font-medium text-ink-600 mb-1">CT-e Globalizado</label>
              <textarea
                rows={2}
                value={xObsGlobalizado}
                onChange={(e) => setXObsGlobalizado(e.target.value)}
                className={`w-full border border-ink-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus} resize-none`}
                placeholder="Informações do CT-e Globalizado..."
              />
            </div>
          )}
        </div>
      </SecaoEmissor>

      <SecaoEmissor id="autorizados" numero={12} titulo="Autorizados para download" icone={Users} descricao="CPF/CNPJ com acesso ao XML"
        acao={
          <>
          <button
            type="button"
            onClick={adicionarAutXML}
            className={`text-xs ${corText} hover:text-brand-800 font-medium flex items-center gap-1 cursor-pointer`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar</span>
          </button>
          </>
        }
      >
        <div className="space-y-1.5">
          {autXML.map((a, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-5">
                <input
                  type="text"
                  value={a.CNPJ || ''}
                  onChange={(e) => atualizarAutXML(idx, 'CNPJ', e.target.value)}
                  className={`w-full border border-ink-300 rounded-lg p-1 focus:outline-none focus:ring-2 ${corFocus} text-xs font-mono`}
                  placeholder="CNPJ (14 dígitos)"
                  maxLength={14}
                />
              </div>
              <div className="col-span-5">
                <input
                  type="text"
                  value={a.CPF || ''}
                  onChange={(e) => atualizarAutXML(idx, 'CPF', e.target.value)}
                  className={`w-full border border-ink-300 rounded-lg p-1 focus:outline-none focus:ring-2 ${corFocus} text-xs font-mono`}
                  placeholder="CPF (11 dígitos)"
                  maxLength={11}
                />
              </div>
              <div className="col-span-2 text-right">
                <button
                  type="button"
                  onClick={() => removerAutXML(idx)}
                  className="text-ink-400 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          {autXML.length === 0 && (
            <div className="text-xs text-ink-400 text-center py-2">
              Nenhum autorizado. Clique em "Adicionar" para permitir download do XML.
            </div>
          )}
        </div>
      </SecaoEmissor>

      {/* ============================================================
          PREVIEW ANTES DE TRANSMITIR — nada é enviado pra SEFAZ até o
          usuário confirmar aqui dentro. Chancela "APENAS PARA VISUALIZAÇÃO"
          deixa claro que isso não é o CT-e autorizado ainda. Mesmo
          DacteLayout usado na visualização pós-emissão (DacteViewer) — é um
          espelho de verdade do DACTE real, não uma versão resumida à parte.
          ============================================================ */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-ink-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl max-w-4xl w-full shadow-2xl max-h-[95vh] overflow-hidden flex flex-col">

            <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden select-none">
              <span
                className="absolute text-rose-600/25 text-5xl sm:text-6xl font-black uppercase tracking-widest whitespace-nowrap border-4 border-rose-600/25 px-10 py-3"
                style={{ top: '48%', left: '48%', transform: 'translate(-50%, -50%) rotate(-30deg)' }}
              >
                Apenas para Visualização
              </span>
            </div>

            <div className="shrink-0 bg-brand-50 border-b border-brand-200 px-5 py-3 flex items-center justify-between z-20">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-brand-600" />
                <span className="text-xs font-bold text-brand-800 uppercase tracking-wide">
                  Espelho do DACTE — documento ainda NÃO emitido/transmitido
                </span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                tpAmb === '1'
                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                  : 'bg-brand-100 text-brand-800 border-brand-300'
              }`}>
                {tpAmb === '1' ? 'PRODUÇÃO' : 'HOMOLOGAÇÃO'}
              </span>
            </div>

            <div className="overflow-y-auto flex-1 p-4">
              <DacteLayout
                numero={0}
                serie={serie}
                cfop={CFOP}
                naturezaOperacao={natOp}
                municipioInicioNome={munInicioNome}
                municipioInicioUf={munInicioUf}
                municipioFimNome={munFimNome}
                municipioFimUf={munFimUf}
                tomadorServico={tomadorServico}
                emitente={{
                  razaoSocial: empresa.razaoSocial,
                  nomeFantasia: empresa.nomeFantasia,
                  cnpj: empresa.cnpj,
                  inscricaoEstadual: empresa.inscricaoEstadual,
                  endereco: {
                    logradouro: empresa.endereco?.logradouro || '',
                    numero: empresa.endereco?.numero || '',
                    bairro: empresa.endereco?.bairro || '',
                    nomeMunicipio: empresa.endereco?.nomeMunicipio || '',
                    uf: empresa.endereco?.uf || '',
                    cep: empresa.endereco?.cep || '',
                  },
                }}
                remetente={{
                  razaoSocial: remetenteNome,
                  documento: remetenteDoc,
                  inscricaoEstadual: remetenteIE,
                  endereco: {
                    logradouro: remetenteLogradouro,
                    numero: remetenteNumero,
                    bairro: remetenteBairro,
                    nomeMunicipio: remetenteMun,
                    uf: remetenteUf,
                    cep: remetenteCep,
                  },
                }}
                destinatario={{
                  razaoSocial: destinatarioNome,
                  documento: destinatarioDoc,
                  inscricaoEstadual: destinatarioIE,
                  endereco: {
                    logradouro: destinatarioLogradouro,
                    numero: destinatarioNumero,
                    bairro: destinatarioBairro,
                    nomeMunicipio: destinatarioMun,
                    uf: destinatarioUf,
                    cep: destinatarioCep,
                  },
                }}
                produtoPredominante={produtoPredominante}
                valorCargaAverbada={valorCargaAverbada}
                quantidades={quantidades}
                documentos={documentos}
                componentes={[
                  { xNome: 'FRETE PESO', vComp: fretePeso },
                  { xNome: 'FRETE VALOR', vComp: freteValor },
                  { xNome: 'PEDAGIO', vComp: pedagio },
                  { xNome: 'GRIS', vComp: taxaGris },
                  ...(outrasTaxas > 0 ? [{ xNome: 'OUTRAS TAXAS', vComp: outrasTaxas }] : []),
                ]}
                transportadora={(() => {
                  const t = transportadoras.find(tr => tr.id === selectedTransportadoraId);
                  return t ? { razaoSocial: t.razaoSocial, rntrc: t.rntrc } : undefined;
                })()}
                aliquotaICMS={aliquotaICMS}
                baseCalculoICMS={baseCalculoICMS}
                valorICMS={valorICMS}
                valorTotalFrete={totalFrete}
              />
            </div>

            <div className="shrink-0 bg-white border-t border-ink-100 px-6 py-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                disabled={isTransmitting}
                className="px-4 py-2 rounded-lg text-ink-600 hover:bg-ink-100 font-medium cursor-pointer transition-colors disabled:opacity-50"
              >
                Voltar e Revisar
              </button>
              <button
                type="button"
                onClick={handleTransmitirCte}
                disabled={isTransmitting}
                className={`px-4 py-2 rounded-lg ${corBgButton} text-white font-semibold shadow-sm cursor-pointer disabled:opacity-60 flex items-center gap-2 transition-colors`}
              >
                {isTransmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Transmitindo para SEFAZ...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Confirmar e Transmitir para SEFAZ</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </EmissorLayout>
  );
};

// "Limpar tudo": remonta o formulário (key nova) — todos os campos voltam
// exatamente aos valores iniciais definidos nos useState acima.
export const CteEmissor: React.FC<CteEmissorProps> = (props) => {
  const [versao, setVersao] = React.useState(0);
  return <CteEmissorConteudo key={versao} {...props} onLimparTudo={() => setVersao((v) => v + 1)} />;
};
