// C:\emissornfe\src\components\fiscal\CteEmissor.tsx

import React, { useState } from 'react';
import { 
  Truck, Send, CheckCircle2, AlertTriangle, Eye, Download,
  MapPin, Package, FileText, UserCheck, CreditCard,
  Plus, Trash2, Navigation, Route, Weight, Box,
  User, Building, Calculator, Receipt, Barcode,
  Calendar, Clock, Info, Shield, DollarSign, Layers,
  Hash, Mail, Phone, Home, MapPinned, Users, FileBadge2
} from 'lucide-react';
import { CTeDocumento, CTeComponenteValor, CTeQuantidade, CTeDocumentoTransportado } from '../../types/fiscal';
import { ClienteFornecedor, ConfiguracaoEmpresa, TransportadoraERP } from '../../types/erp';
import { StorageService } from '../../utils/storage';
import { formatarMoeda, formatarCpfCnpj, validarCpfOuCnpj, limparDocumento } from '../../utils/cpfCnpjValidator';
import { gerarChaveAcessoNFe, calcularDVMod11NFe } from '../../utils/chaveAcesso';
import { cteService } from '../../services/cte.service';
import { useToast } from '../../hooks/useToast';

// ============================================================
// INTERFACES
// ============================================================

interface CteEmissorProps {
  empresa: ConfiguracaoEmpresa;
  clientes: ClienteFornecedor[];
  transportadoras: TransportadoraERP[];
  onCteEmitido: (cte: CTeDocumento) => void;
  onViewDacte: (cte: CTeDocumento) => void;
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

export const CteEmissor: React.FC<CteEmissorProps> = ({
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
  const [cUF, setCUF] = useState<string>(empresa.endereco?.codigoMunicipio?.slice(0, 2) || '35');
  const [cCT, setCCT] = useState<string>('');
  const [CFOP, setCFOP] = useState<string>('6353');
  const [natOp, setNatOp] = useState<string>('Prestação de Serviço de Transporte de Cargas Intermunicipal / Interestadual');
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
  const [vCarga, setVCarga] = useState<number>(85000);
  
  const [quantidades, setQuantidades] = useState<CTeQuantidade[]>([
    { cUnid: '01', tpMed: 'PESO BRUTO', qCarga: 280 },
    { cUnid: '03', tpMed: 'VOLUMES', qCarga: 6 },
  ]);

  // ============================================================
  // STATE - DOCUMENTOS TRANSPORTADOS (infDoc)
  // ============================================================
  const [documentos, setDocumentos] = useState<CTeDocumentoTransportado[]>([]);
  const [chavesNfeTexto, setChavesNfeTexto] = useState<string>('35260818236447000190550010000010411123456784');

  // ============================================================
  // STATE - VEÍCULO E MOTORISTA
  // ============================================================
  const [rntrc, setRntrc] = useState<string>('09847123');
  const [placaVeiculo, setPlacaVeiculo] = useState<string>('BRA2E26');
  const [ufVeiculo, setUfVeiculo] = useState<string>('SP');
  const [rntrcProprietario, setRntrcProprietario] = useState<string>('09847123');
  const [motoristaNome, setMotoristaNome] = useState<string>('Marcos Vinicius de Castro');
  const [motoristaCpf, setMotoristaCpf] = useState<string>('34298144891');

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
  const [erros, setErros] = useState<string[]>([]);
  const [sucessoCte, setSucessoCte] = useState<CTeDocumento | null>(null);

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
      .map(s => s.trim().replace(/\D/g, ''))
      .filter(s => s.length === 44);

    const novosDocs = chaves.map(chave => ({
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

  const atualizarQuantidade = (index: number, campo: string, valor: any) => {
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
  // VALIDAÇÃO
  // ============================================================
  const validarCte = (): boolean => {
    const errs: string[] = [];

    if (!remetenteDoc || !remetenteNome) {
      errs.push('Informe os dados completos do Remetente (embarcador da carga).');
    }

    if (!destinatarioDoc || !destinatarioNome) {
      errs.push('Informe os dados completos do Destinatário da carga.');
    }

    if (!produtoPredominante.trim()) {
      errs.push('Informe o Produto Predominante da carga transportada.');
    }
    if (valorCargaAverbada <= 0) {
      errs.push('Informe o Valor da Carga para fins de averbação securitária.');
    }

    if (!placaVeiculo.trim()) {
      errs.push('Informe a Placa do Veículo.');
    }
    if (!rntrc.trim()) {
      errs.push('Informe o RNTRC (Registro Nacional de Transportadores).');
    }

    if (!motoristaNome.trim()) {
      errs.push('Informe o Nome do Motorista.');
    }
    if (!motoristaCpf.trim()) {
      errs.push('Informe o CPF do Motorista.');
    }

    if (totalFrete <= 0) {
      errs.push('O valor total da prestação do frete deve ser maior que zero.');
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
      
      const chaveData = gerarChaveAcessoNFe({
        codigoUf: remetenteMunIbge.slice(0, 2) || '35',
        anoMes: aamm,
        cnpjEmitente: empresa.cnpj,
        modelo: '57',
        serie,
        numero,
        tipoEmissao: 1,
      });

      const chavesList = documentos.map(d => d.chave);

      const novoCte: any = {
        // IDENTIFICAÇÃO
        versao: '4.00',
        Id: `CTe${chaveData.chaveCompleta}`,
        cUF: remetenteMunIbge.slice(0, 2) || '35',
        cCT: chaveData.codigoNumerico,
        CFOP,
        natOp,
        mod: '57',
        serie,
        nCT: numero,
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

        // TOMADOR
        toma: tomadorServico,
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

        // INFORMAÇÕES DA CARGA
        vCarga,
        proPred: produtoPredominante,
        xOutCat,
        vCargaAverb: valorCargaAverbada,

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

        // STATUS
        status: 'AUTORIZADA',
        chaveAcesso: chaveData.chaveCompleta,
        protocoloAutorizacao: `1352600${Math.floor(1000000 + Math.random() * 9000000)}`,
        dataHoraAutorizacao: new Date().toISOString(),
        xmlAssinado: `<cteProc versao="4.00" xmlns="http://www.portalfiscal.inf.br/cte"><CTe><infCte Id="CTe${chaveData.chaveCompleta}" versao="4.00"><ide><cUF>${remetenteMunIbge.slice(0, 2)}</cUF><mod>57</mod><nCT>${numero}</nCT></ide></infCte></CTe></cteProc>`,

        // RELACIONAMENTOS
        empresaId: empresa.id,
        emitenteId: empresa.id,
        remetenteId: selectedRemetenteId,
        destinatarioId: selectedDestinatarioId,
        transportadoraId: undefined,

        // SUB-ESTRUTURAS
        componentes: [
          { xNome: 'FRETE PESO', vComp: fretePeso },
          { xNome: 'FRETE VALOR', vComp: freteValor },
          { xNome: 'PEDAGIO', vComp: pedagio },
          { xNome: 'GRIS', vComp: taxaGris },
          ...(outrasTaxas > 0 ? [{ xNome: 'OUTRAS TAXAS', vComp: outrasTaxas }] : []),
        ],
        quantidades,
        duplicatas: [{ nDup: `${numero}/01`, dVenc: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), vDup: totalFrete }],
        observacoes: xObs ? [{ xCampo: 'obsGeral', xTexto: xObs }] : [],
        autorizadosDownload: autXML.filter(a => a.CNPJ || a.CPF),
      };

      const response = await cteService.emitir(novoCte);

      if (response) {
        StorageService.addCte(response);
        onCteEmitido(response);
        setSucessoCte(response);
        toast.showSuccess(`✅ CT-e Nº ${numero} emitido com sucesso!`);
      }

    } catch (error: any) {
      console.error('❌ Erro ao emitir CT-e:', error);
      setErros([error.message || 'Falha ao emitir CT-e junto à SEFAZ.']);
      toast.showError(`❌ ${error.message || 'Falha ao emitir CT-e'}`);
    } finally {
      setIsTransmitting(false);
    }
  };

  // ============================================================
  // CORES - CYAN (ORIGINAL)
  // ============================================================
  const cor = 'cyan';
  const corBg = 'bg-cyan-50';
  const corBorder = 'border-cyan-200';
  const corText = 'text-cyan-700';
  const corTextDark = 'text-cyan-800';
  const corBgButton = 'bg-cyan-600 hover:bg-cyan-700';
  const corBgBadge = 'bg-cyan-100';
  const corFocus = 'focus:ring-cyan-500';
  const corIconBg = 'bg-cyan-600';

  // ============================================================
  // RENDER - LAYOUT ORIGINAL (SEM CÍRCULOS, SEM FUNDO COLORIDO)
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
            <h1 className="text-base font-bold text-slate-900">Emissão de CT-e (Modelo 57)</h1>
            <span className={`${corBgBadge} ${corTextDark} text-[10px] font-bold px-2 py-0.5 rounded-full border ${corBorder}`}>
              v4.00
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Documento fiscal oficial para prestação de serviços de transporte de cargas rodoviário intermunicipal e interestadual.
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs font-semibold text-slate-700">Série {serie}</div>
          <div className={`text-[10px] font-medium ${corText}`}>Próximo CT-e: Nº {Math.floor(Math.random() * 900) + 100}</div>
        </div>
      </div>

      {/* BANNER SUCESSO */}
      {sucessoCte && (
        <div className={`${corBg} border ${corBorder} rounded-xl p-4 shadow-sm animate-fadeIn`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className={`w-5 h-5 ${corText} shrink-0 mt-0.5`} />
              <div>
                <h3 className={`text-sm font-bold ${corTextDark}`}>
                  CT-e Nº {sucessoCte.nCT} Autorizado com Sucesso!
                </h3>
                <p className="text-xs text-cyan-800 font-mono mt-0.5">
                  Chave: {sucessoCte.chaveAcesso}
                </p>
                <div className="text-[11px] text-cyan-700 mt-1">
                  Origem: {sucessoCte.xMunIni}/{sucessoCte.UFIni} ➔ Destino: {sucessoCte.xMunFim}/{sucessoCte.UFFim} • Total: {formatarMoeda(sucessoCte.vTPrest)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onViewDacte(sucessoCte as any)}
                className={`${corBgButton} text-white font-medium text-xs px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Visualizar DACTE</span>
              </button>
              <button
                onClick={() => {
                  const blob = new Blob([sucessoCte.xmlAssinado], { type: 'application/xml' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `CTe_${sucessoCte.nCT}_SUP.xml`;
                  a.click();
                }}
                className="bg-white hover:bg-slate-100 text-slate-700 font-medium text-xs px-3 py-2 rounded-lg border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>XML</span>
              </button>
              <button
                onClick={() => setSucessoCte(null)}
                className="text-xs text-slate-600 hover:text-slate-900 underline ml-2 cursor-pointer"
              >
                Novo CT-e
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
            <span>Erros no Conhecimento de Transporte:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 pl-2">
            {erros.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ============================================================
          BLOCO 1: REMETENTE
          ============================================================ */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <User className={`w-4 h-4 ${corText}`} />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">1. Remetente</h3>
          </div>
          <select
            value={selectedRemetenteId}
            onChange={(e) => handleSelectRemetente(e.target.value)}
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
            <label className="block font-medium text-slate-600 mb-1">CNPJ / CPF *</label>
            <input
              type="text"
              value={remetenteDoc}
              onChange={(e) => setRemetenteDoc(e.target.value)}
              className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              placeholder="00.000.000/0000-00"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Razão Social *</label>
            <input
              type="text"
              value={remetenteNome}
              onChange={(e) => setRemetenteNome(e.target.value)}
              className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              placeholder="Nome ou Razão Social"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Inscrição Estadual</label>
            <input
              type="text"
              value={remetenteIE}
              onChange={(e) => setRemetenteIE(e.target.value)}
              className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              placeholder="ISENTO ou número"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">IE ST</label>
            <input
              type="text"
              value={remetenteIEST}
              onChange={(e) => setRemetenteIEST(e.target.value)}
              className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              placeholder="2-14 dígitos"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-medium text-slate-600 mb-1">Município</label>
              <input
                type="text"
                value={remetenteMun}
                onChange={(e) => {
                  setRemetenteMun(e.target.value);
                  setMunInicioNome(e.target.value);
                }}
                className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                placeholder="Cidade"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">UF</label>
              <input
                type="text"
                value={remetenteUf}
                onChange={(e) => {
                  setRemetenteUf(e.target.value);
                  setMunInicioUf(e.target.value);
                }}
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
              value={remetenteLogradouro}
              onChange={(e) => setRemetenteLogradouro(e.target.value)}
              className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              placeholder="Rua, Avenida..."
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-medium text-slate-600 mb-1">Número</label>
              <input
                type="text"
                value={remetenteNumero}
                onChange={(e) => setRemetenteNumero(e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                placeholder="123"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">Complemento</label>
              <input
                type="text"
                value={remetenteComplemento}
                onChange={(e) => setRemetenteComplemento(e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                placeholder="Complemento"
              />
            </div>
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Bairro</label>
            <input
              type="text"
              value={remetenteBairro}
              onChange={(e) => setRemetenteBairro(e.target.value)}
              className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              placeholder="Bairro"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">CEP</label>
            <input
              type="text"
              value={remetenteCep}
              onChange={(e) => setRemetenteCep(e.target.value)}
              className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              placeholder="00000-000"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-medium text-slate-600 mb-1">Telefone</label>
              <input
                type="text"
                value={remetenteFone}
                onChange={(e) => setRemetenteFone(e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                placeholder="(00) 0000-0000"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">E-mail</label>
              <input
                type="email"
                value={remetenteEmail}
                onChange={(e) => setRemetenteEmail(e.target.value)}
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
            <label className="block font-medium text-slate-600 mb-1">CNPJ / CPF *</label>
            <input
              type="text"
              value={destinatarioDoc}
              onChange={(e) => setDestinatarioDoc(e.target.value)}
              className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              placeholder="00.000.000/0000-00"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Razão Social *</label>
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
          <div>
            <label className="block font-medium text-slate-600 mb-1">IE ST</label>
            <input
              type="text"
              value={destinatarioIEST}
              onChange={(e) => setDestinatarioIEST(e.target.value)}
              className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              placeholder="2-14 dígitos"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-medium text-slate-600 mb-1">Município Destino</label>
              <input
                type="text"
                value={destinatarioMun}
                onChange={(e) => {
                  setDestinatarioMun(e.target.value);
                  setMunFimNome(e.target.value);
                }}
                className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                placeholder="Cidade"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">UF Destino</label>
              <input
                type="text"
                value={destinatarioUf}
                onChange={(e) => {
                  setDestinatarioUf(e.target.value);
                  setMunFimUf(e.target.value);
                }}
                className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus} uppercase`}
                maxLength={2}
                placeholder="RJ"
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
                value={destinatarioFone}
                onChange={(e) => setDestinatarioFone(e.target.value)}
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
              <label className="block font-medium text-slate-600 mb-1">Tipo de CT-e</label>
              <select
                value={tpCTe}
                onChange={(e) => setTpCTe(e.target.value as TipoCTe)}
                className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              >
                <option value="NORMAL">Normal</option>
                <option value="COMPLEMENTO_VALORES">Complemento</option>
                <option value="SUBSTITUICAO">Substituição</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">Modal</label>
              <select
                value={modal}
                onChange={(e) => setModal(e.target.value as ModalCTe)}
                className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
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
              <label className="block font-medium text-slate-600 mb-1">CFOP</label>
              <input
                type="text"
                value={CFOP}
                onChange={(e) => setCFOP(e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus} font-mono`}
                placeholder="6353"
                maxLength={3}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-medium text-slate-600 mb-1">Série</label>
              <input
                type="number"
                value={serie}
                onChange={(e) => setSerie(parseInt(e.target.value) || 1)}
                className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                min={0}
                max={999}
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">Natureza da Operação</label>
              <input
                type="text"
                value={natOp}
                onChange={(e) => setNatOp(e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                placeholder="Descrição da natureza"
              />
            </div>
          </div>
          {tpCTe === 'SUBSTITUICAO' && (
            <div>
              <label className="block font-medium text-slate-600 mb-1">Chave CT-e Substituído</label>
              <input
                type="text"
                value={chCteSub}
                onChange={(e) => setChCteSub(e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus} font-mono`}
                placeholder="44 dígitos"
                maxLength={44}
              />
            </div>
          )}
          {tpCTe === 'COMPLEMENTO_VALORES' && (
            <div>
              <label className="block font-medium text-slate-600 mb-1">Chave CT-e Complementado</label>
              <input
                type="text"
                value={chCTeComplementado}
                onChange={(e) => setChCTeComplementado(e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus} font-mono`}
                placeholder="44 dígitos"
                maxLength={44}
              />
            </div>
          )}
        </div>
      </div>

      {/* ============================================================
          BLOCO 4: TOMADOR
          ============================================================ */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
          <UserCheck className={`w-4 h-4 ${corText}`} />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">4. Tomador do Serviço</h3>
        </div>
        <div className="space-y-2.5 text-xs">
          <div>
            <label className="block font-medium text-slate-600 mb-1">Tomador do Serviço</label>
            <select
              value={tomadorServico}
              onChange={(e) => setTomadorServico(parseInt(e.target.value) as TomadorServicoCTe)}
              className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
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
                  <label className="block font-medium text-slate-600 mb-1">CNPJ</label>
                  <input
                    type="text"
                    value={tomadorCNPJ}
                    onChange={(e) => setTomadorCNPJ(e.target.value)}
                    className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                    placeholder="00.000.000/0000-00"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Nome</label>
                  <input
                    type="text"
                    value={tomadorxNome}
                    onChange={(e) => setTomadorxNome(e.target.value)}
                    className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                    placeholder="Nome"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">IE</label>
                  <input
                    type="text"
                    value={tomadorIE}
                    onChange={(e) => setTomadorIE(e.target.value)}
                    className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                    placeholder="Inscrição Estadual"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">UF</label>
                  <input
                    type="text"
                    value={tomadorUF}
                    onChange={(e) => setTomadorUF(e.target.value.toUpperCase())}
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
                  value={tomadorxLgr}
                  onChange={(e) => setTomadorxLgr(e.target.value)}
                  className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                  placeholder="Rua, Avenida..."
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Número</label>
                  <input
                    type="text"
                    value={tomadorNro}
                    onChange={(e) => setTomadorNro(e.target.value)}
                    className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                    placeholder="123"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Complemento</label>
                  <input
                    type="text"
                    value={tomadorxCpl}
                    onChange={(e) => setTomadorxCpl(e.target.value)}
                    className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                    placeholder="Complemento"
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">Bairro</label>
                <input
                  type="text"
                  value={tomadorxBairro}
                  onChange={(e) => setTomadorxBairro(e.target.value)}
                  className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                  placeholder="Bairro"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">CEP</label>
                <input
                  type="text"
                  value={tomadorCEP}
                  onChange={(e) => setTomadorCEP(e.target.value)}
                  className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                  placeholder="00000-000"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Telefone</label>
                  <input
                    type="text"
                    value={tomadorFone}
                    onChange={(e) => setTomadorFone(e.target.value)}
                    className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                    placeholder="(00) 0000-0000"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={tomadorEmail}
                    onChange={(e) => setTomadorEmail(e.target.value)}
                    className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                    placeholder="email@empresa.com"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ============================================================
          BLOCO 5: PERCURSO
          ============================================================ */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
          <Route className={`w-4 h-4 ${corText}`} />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">5. Percurso</h3>
        </div>
        <div className="space-y-2.5 text-xs">
          <div>
            <label className="block font-medium text-slate-600 mb-1">Início da Prestação</label>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <input
                  type="text"
                  value={munInicioNome}
                  onChange={(e) => {
                    setMunInicioNome(e.target.value);
                    setRemetenteMun(e.target.value);
                  }}
                  className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
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
                  className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus} uppercase`}
                  maxLength={2}
                  placeholder="UF"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Código IBGE Início</label>
            <input
              type="text"
              value={munInicioIbge}
              onChange={(e) => {
                setMunInicioIbge(e.target.value);
                setRemetenteMunIbge(e.target.value);
              }}
              className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus} font-mono`}
              placeholder="7 dígitos"
              maxLength={7}
            />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Término da Prestação</label>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <input
                  type="text"
                  value={munFimNome}
                  onChange={(e) => {
                    setMunFimNome(e.target.value);
                    setDestinatarioMun(e.target.value);
                  }}
                  className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
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
                  className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus} uppercase`}
                  maxLength={2}
                  placeholder="UF"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Código IBGE Fim</label>
            <input
              type="text"
              value={munFimIbge}
              onChange={(e) => {
                setMunFimIbge(e.target.value);
                setDestinatarioMunIbge(e.target.value);
              }}
              className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus} font-mono`}
              placeholder="7 dígitos"
              maxLength={7}
            />
          </div>
        </div>
      </div>

      {/* ============================================================
          BLOCO 6: CARGA
          ============================================================ */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <Package className={`w-4 h-4 ${corText}`} />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">6. Carga Transportada</h3>
          </div>
          <span className="text-[10px] text-slate-400">{quantidades.length} quantidades</span>
        </div>

        <div className="space-y-2.5 text-xs">
          <div>
            <label className="block font-medium text-slate-600 mb-1">Produto Predominante *</label>
            <input
              type="text"
              value={produtoPredominante}
              onChange={(e) => setProdutoPredominante(e.target.value)}
              className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
            />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Valor Carga (R$) *</label>
            <input
              type="number"
              value={valorCargaAverbada}
              onChange={(e) => setValorCargaAverbada(parseFloat(e.target.value) || 0)}
              className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus} font-bold`}
            />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Outras Características</label>
            <input
              type="text"
              value={xOutCat}
              onChange={(e) => setXOutCat(e.target.value)}
              className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              placeholder="FRIA, GRANEL, etc"
            />
          </div>

          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-600">Quantidades da Carga</span>
              <button
                type="button"
                onClick={adicionarQuantidade}
                className={`text-xs ${corText} hover:text-cyan-800 font-medium flex items-center gap-1 cursor-pointer`}
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
                      className={`w-full border border-slate-300 rounded-lg p-1 focus:outline-none focus:ring-2 ${corFocus} text-xs`}
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
                      className={`w-full border border-slate-300 rounded-lg p-1 focus:outline-none focus:ring-2 ${corFocus} text-xs`}
                      placeholder="Tipo (ex: PESO BRUTO)"
                    />
                  </div>
                  <div className="col-span-4">
                    <input
                      type="number"
                      step="0.0001"
                      value={q.qCarga}
                      onChange={(e) => atualizarQuantidade(idx, 'qCarga', parseFloat(e.target.value) || 0)}
                      className={`w-full border border-slate-300 rounded-lg p-1 focus:outline-none focus:ring-2 ${corFocus} text-xs font-bold`}
                    />
                  </div>
                  <div className="col-span-2 text-right">
                    <button
                      type="button"
                      onClick={() => removerQuantidade(idx)}
                      className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {quantidades.length === 0 && (
                <div className="text-xs text-slate-400 text-center py-2">
                  Nenhuma quantidade cadastrada. Clique em "Adicionar".
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-600">Documentos Transportados (NF-e)</span>
              <span className="text-[10px] text-slate-400">{documentos.length} documento(s)</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={chavesNfeTexto}
                onChange={(e) => setChavesNfeTexto(e.target.value)}
                className={`flex-1 border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus} text-xs font-mono`}
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
            {documentos.length > 0 && (
              <div className="mt-2 space-y-1">
                {documentos.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-50 rounded-lg px-2 py-1 text-xs">
                    <span className="font-mono text-slate-700 truncate max-w-md">{doc.chave}</span>
                    <button
                      type="button"
                      onClick={() => removerDocumento(idx)}
                      className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================
          BLOCO 7: VEÍCULO E MOTORISTA
          ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
            <Truck className={`w-4 h-4 ${corText}`} />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">7. Veículo</h3>
          </div>
          <div className="space-y-2.5 text-xs">
            <div>
              <label className="block font-medium text-slate-600 mb-1">RNTRC *</label>
              <input
                type="text"
                value={rntrc}
                onChange={(e) => setRntrc(e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus} font-mono`}
                placeholder="Registro Nacional de Transportadores"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="block font-medium text-slate-600 mb-1">Placa *</label>
                <input
                  type="text"
                  value={placaVeiculo}
                  onChange={(e) => setPlacaVeiculo(e.target.value.toUpperCase())}
                  className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus} uppercase`}
                  placeholder="BRA2E26"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">UF</label>
                <input
                  type="text"
                  value={ufVeiculo}
                  onChange={(e) => setUfVeiculo(e.target.value.toUpperCase())}
                  className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus} uppercase`}
                  maxLength={2}
                  placeholder="SP"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
            <User className={`w-4 h-4 ${corText}`} />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">8. Motorista</h3>
          </div>
          <div className="space-y-2.5 text-xs">
            <div>
              <label className="block font-medium text-slate-600 mb-1">Nome *</label>
              <input
                type="text"
                value={motoristaNome}
                onChange={(e) => setMotoristaNome(e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                placeholder="Nome completo do motorista"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">CPF *</label>
              <input
                type="text"
                value={motoristaCpf}
                onChange={(e) => setMotoristaCpf(e.target.value.replace(/\D/g, ''))}
                className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus} font-mono`}
                placeholder="000.000.000-00"
                maxLength={11}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          BLOCO 8: FRETE
          ============================================================ */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
          <Calculator className={`w-4 h-4 ${corText}`} />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">9. Componentes do Frete</h3>
        </div>

        <div className="space-y-2.5 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <div>
              <label className="block font-medium text-slate-600 mb-1">Frete Peso</label>
              <input
                type="number"
                value={fretePeso}
                onChange={(e) => setFretePeso(parseFloat(e.target.value) || 0)}
                className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus} font-semibold`}
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">Frete Valor</label>
              <input
                type="number"
                value={freteValor}
                onChange={(e) => setFreteValor(parseFloat(e.target.value) || 0)}
                className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">Pedágio</label>
              <input
                type="number"
                value={pedagio}
                onChange={(e) => setPedagio(parseFloat(e.target.value) || 0)}
                className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">Taxa GRIS</label>
              <input
                type="number"
                value={taxaGris}
                onChange={(e) => setTaxaGris(parseFloat(e.target.value) || 0)}
                className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">Outras Taxas</label>
              <input
                type="number"
                value={outrasTaxas}
                onChange={(e) => setOutrasTaxas(parseFloat(e.target.value) || 0)}
                className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              />
            </div>
          </div>

          <div className={`mt-3 p-3 ${corBg} rounded-lg border ${corBorder} text-xs`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex flex-wrap gap-3">
                <span className="text-slate-600">Base ICMS: <strong>{formatarMoeda(baseCalculoICMS)}</strong></span>
                <span className="text-slate-600">ICMS: <strong className={corText}>{formatarMoeda(valorICMS)}</strong></span>
                <span className="text-slate-600 text-[11px]">PIS/COFINS: {formatarMoeda(valorPIS + valorCOFINS)}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block">Total do Frete</span>
                <span className={`text-lg font-extrabold ${corText}`}>{formatarMoeda(totalFrete)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          BLOCO 9: TRIBUTAÇÃO
          ============================================================ */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
          <Shield className={`w-4 h-4 ${corText}`} />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">10. Tributação ICMS</h3>
        </div>
        <div className="space-y-2.5 text-xs">
          <div>
            <label className="block font-medium text-slate-600 mb-1">CST ICMS</label>
            <select
              value={cstICMS}
              onChange={(e) => setCstICMS(e.target.value)}
              className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
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
              <label className="block font-medium text-slate-600 mb-1">Alíquota %</label>
              <input
                type="number"
                step="0.01"
                value={aliquotaICMS}
                onChange={(e) => setAliquotaICMS(parseFloat(e.target.value) || 0)}
                className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">Redução BC %</label>
              <input
                type="number"
                step="0.01"
                value={pRedBC}
                onChange={(e) => setPRedBC(parseFloat(e.target.value) || 0)}
                className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              />
            </div>
          </div>
          {cstICMS === '60' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-medium text-slate-600 mb-1">Alíq. ST %</label>
                <input
                  type="number"
                  step="0.01"
                  value={pICMSSTRet}
                  onChange={(e) => setPICMSSTRet(parseFloat(e.target.value) || 0)}
                  className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">Crédito Outorgado</label>
                <input
                  type="number"
                  step="0.01"
                  value={vCred}
                  onChange={(e) => setVCred(parseFloat(e.target.value) || 0)}
                  className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                />
              </div>
            </div>
          )}
          <div>
            <label className="flex items-center gap-2 text-slate-700 font-medium">
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
      </div>

      {/* ============================================================
          BLOCO 10: PREVISÃO DE ENTREGA
          ============================================================ */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
          <Calendar className={`w-4 h-4 ${corText}`} />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">11. Previsão de Entrega</h3>
        </div>
        <div className="space-y-2.5 text-xs">
          <div>
            <label className="block font-medium text-slate-600 mb-1">Tipo de Período</label>
            <select
              value={tpPer}
              onChange={(e) => setTpPer(e.target.value)}
              className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
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
              <label className="block font-medium text-slate-600 mb-1">Data Programada</label>
              <input
                type="date"
                value={dProg}
                onChange={(e) => setDProg(e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              />
            </div>
          ) : tpPer === '4' ? (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-medium text-slate-600 mb-1">Data Inicial</label>
                <input
                  type="date"
                  value={dIni}
                  onChange={(e) => setDIni(e.target.value)}
                  className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">Data Final</label>
                <input
                  type="date"
                  value={dFim}
                  onChange={(e) => setDFim(e.target.value)}
                  className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                />
              </div>
            </div>
          ) : null}
          {tpPer !== '0' && (
            <div>
              <label className="block font-medium text-slate-600 mb-1">Tipo de Hora</label>
              <select
                value={tpHor}
                onChange={(e) => setTpHor(e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
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
              <label className="block font-medium text-slate-600 mb-1">Hora Programada</label>
              <input
                type="time"
                value={hProg}
                onChange={(e) => setHProg(e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                step="1"
              />
            </div>
          ) : tpHor === '4' ? (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-medium text-slate-600 mb-1">Hora Inicial</label>
                <input
                  type="time"
                  value={hIni}
                  onChange={(e) => setHIni(e.target.value)}
                  className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                  step="1"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">Hora Final</label>
                <input
                  type="time"
                  value={hFim}
                  onChange={(e) => setHFim(e.target.value)}
                  className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                  step="1"
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* ============================================================
          BLOCO 11: OBSERVAÇÕES
          ============================================================ */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
          <FileText className={`w-4 h-4 ${corText}`} />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">12. Observações</h3>
        </div>
        <div className="space-y-2.5 text-xs">
          <div>
            <label className="block font-medium text-slate-600 mb-1">Observações Gerais</label>
            <textarea
              rows={3}
              value={xObs}
              onChange={(e) => setXObs(e.target.value)}
              className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus} resize-none`}
              placeholder="Observações complementares..."
            />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Informações Adicionais Fisco</label>
            <textarea
              rows={2}
              value={infAdFisco}
              onChange={(e) => setInfAdFisco(e.target.value)}
              className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus} resize-none`}
              placeholder="Informações de interesse do Fisco..."
            />
          </div>
          {tpCTe === 'SUBSTITUICAO' && (
            <div>
              <label className="block font-medium text-slate-600 mb-1">Alteração de Tomador</label>
              <select
                value={indAlteraToma}
                onChange={(e) => setIndAlteraToma(e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              >
                <option value="">Não</option>
                <option value="1">Sim</option>
              </select>
            </div>
          )}
          {tpCTe === 'NORMAL' && (
            <div>
              <label className="block font-medium text-slate-600 mb-1">CT-e Globalizado</label>
              <textarea
                rows={2}
                value={xObsGlobalizado}
                onChange={(e) => setXObsGlobalizado(e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus} resize-none`}
                placeholder="Informações do CT-e Globalizado..."
              />
            </div>
          )}
        </div>
      </div>

      {/* ============================================================
          BLOCO 12: AUTORIZADOS DOWNLOAD
          ============================================================ */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <Users className={`w-4 h-4 ${corText}`} />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">13. Autorizados para Download</h3>
          </div>
          <button
            type="button"
            onClick={adicionarAutXML}
            className={`text-xs ${corText} hover:text-cyan-800 font-medium flex items-center gap-1 cursor-pointer`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar</span>
          </button>
        </div>
        <div className="space-y-1.5">
          {autXML.map((a, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-5">
                <input
                  type="text"
                  value={a.CNPJ || ''}
                  onChange={(e) => atualizarAutXML(idx, 'CNPJ', e.target.value)}
                  className={`w-full border border-slate-300 rounded-lg p-1 focus:outline-none focus:ring-2 ${corFocus} text-xs font-mono`}
                  placeholder="CNPJ (14 dígitos)"
                  maxLength={14}
                />
              </div>
              <div className="col-span-5">
                <input
                  type="text"
                  value={a.CPF || ''}
                  onChange={(e) => atualizarAutXML(idx, 'CPF', e.target.value)}
                  className={`w-full border border-slate-300 rounded-lg p-1 focus:outline-none focus:ring-2 ${corFocus} text-xs font-mono`}
                  placeholder="CPF (11 dígitos)"
                  maxLength={11}
                />
              </div>
              <div className="col-span-2 text-right">
                <button
                  type="button"
                  onClick={() => removerAutXML(idx)}
                  className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          {autXML.length === 0 && (
            <div className="text-xs text-slate-400 text-center py-2">
              Nenhum autorizado. Clique em "Adicionar" para permitir download do XML.
            </div>
          )}
        </div>
      </div>

      {/* ============================================================
          BOTÃO TRANSMITIR
          ============================================================ */}
      <button
        type="button"
        onClick={handleTransmitirCte}
        disabled={isTransmitting}
        id="btn-emitir-cte"
        className={`w-full ${corBgButton} disabled:bg-slate-300 text-white text-xs font-bold py-3 px-4 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50`}
      >
        {isTransmitting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Assinando e transmitindo CT-e...</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>EMITIR & AUTORIZAR CT-e (MODELO 57)</span>
          </>
        )}
      </button>

    </div>
  );
};