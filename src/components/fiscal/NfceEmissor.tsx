// src/components/fiscal/NfceEmissor.tsx
import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Trash2,
  Send,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Download,
  CreditCard,
  DollarSign,
  QrCode,
  User,
  UserCheck,
  Package,
  Search,
  Sparkles,
  Percent,
  Barcode,
  Receipt,
  RefreshCw,
  X,
  Edit2,
  Save,
  Info,
  Hash,
  MapPin,
  Building,
  Phone,
  Mail,
  Calendar,
  Clock,
  FileText,
  Home,
  Users,
  Printer,
  Ticket
} from 'lucide-react';
import { NFCeDocumento, ItemNfe } from '../../types/fiscal';
import { Produto, ClienteFornecedor, ConfiguracaoEmpresa } from '../../types/erp';
import { formatarMoeda, validarCpfOuCnpj } from '../../utils/cpfCnpjValidator';
import { calcularTotaisNfe } from '../../utils/tributosEngine';
import { useToast } from '../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/apiError';
import { nfceService, EmitirNfceItemParams } from '../../services/nfce.service';
import { DanfceLayout } from './DanfceLayout';

// CSOSN sem base própria (ICMSSN102/ICMSSN500 no XML) — não declaram vBC/vICMS;
// mandar um valor aqui infla o total do documento sem lastro em nenhum item,
// e a SEFAZ rejeita ("Total da BC ICMS difere do somatorio dos itens").
const CSOSN_SEM_BASE_PROPRIA = ['102', '103', '300', '400', '500'];

interface NfceEmissorProps {
  empresa: ConfiguracaoEmpresa;
  clientes: ClienteFornecedor[];
  produtos: Produto[];
  onNfceEmitida: (nfce: NFCeDocumento) => void;
  onViewDanfce: (nfceId: string) => void;
}

// 🔥 COR DO MÓDULO - ROXO
const cor = 'purple';
const corBg = 'bg-purple-50';
const corBorder = 'border-purple-200';
const corText = 'text-purple-700';
const corTextDark = 'text-purple-800';
const corBgButton = 'bg-purple-600 hover:bg-purple-700';
const corBgBadge = 'bg-purple-100';
const corFocus = 'focus:ring-purple-500';
const corIconBg = 'bg-purple-600';

export const NfceEmissor: React.FC<NfceEmissorProps> = ({
  empresa,
  clientes,
  produtos,
  onNfceEmitida,
  onViewDanfce,
}) => {
  const toast = useToast();

  // ============================================================
  // STATE - CONSUMIDOR
  // ============================================================
  const [identificarConsumidor, setIdentificarConsumidor] = useState<boolean>(false);
  const [selectedClienteId, setSelectedClienteId] = useState<string>('');
  
  const [consumidorDoc, setConsumidorDoc] = useState<string>('');
  const [consumidorNome, setConsumidorNome] = useState<string>('');
  const [consumidorEmail, setConsumidorEmail] = useState<string>('');
  const [consumidorTelefone, setConsumidorTelefone] = useState<string>('');
  const [consumidorLogradouro, setConsumidorLogradouro] = useState<string>('');
  const [consumidorNumero, setConsumidorNumero] = useState<string>('');
  const [consumidorComplemento, setConsumidorComplemento] = useState<string>('');
  const [consumidorBairro, setConsumidorBairro] = useState<string>('');
  const [consumidorCodigoMunicipio, setConsumidorCodigoMunicipio] = useState<string>('');
  const [consumidorNomeMunicipio, setConsumidorNomeMunicipio] = useState<string>('');
  const [consumidorUf, setConsumidorUf] = useState<string>('SP');
  const [consumidorCep, setConsumidorCep] = useState<string>('');

  // ============================================================
  // STATE - IDENTIFICAÇÃO
  // ============================================================
  const [naturezaOperacao, setNaturezaOperacao] = useState<string>('Venda a Consumidor Final');
  const [tpNF, setTpNF] = useState<0 | 1>(1);
  const [idDest, setIdDest] = useState<1 | 2 | 3>(1);
  const [finNFe, setFinNFe] = useState<1 | 2 | 3 | 4>(1);
  const [indFinal, setIndFinal] = useState<0 | 1>(1);
  // ⚠️ Default era 2 (não presencial) — a SEFAZ rejeita NFC-e "não presencial"
  // (cStat 717, "NFC-e em operacao nao presencial"): o modelo 65 é, por
  // definição, o cupom fiscal do balcão/PDV. Achado emitindo de verdade contra
  // a SEFAZ real durante esta revisão.
  const [indPres, setIndPres] = useState<0 | 1 | 2 | 3 | 4 | 5 | 9>(1);
  const [procEmi, setProcEmi] = useState<string>('0');
  const [verProc, setVerProc] = useState<string>('SUP-TECNOLOGIA-4.00');
  const [tpEmis, setTpEmis] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7 | 9>(1);

  // ============================================================
  // STATE - ITENS
  // ============================================================
  const [itens, setItens] = useState<ItemNfe[]>([]);
  const [buscaProduto, setBuscaProduto] = useState<string>('');

  // ============================================================
  // STATE - PAGAMENTO
  // ============================================================
  const [formaPagamento, setFormaPagamento] = useState<'01' | '02' | '03' | '04' | '15' | '17' | '90' | '99'>('17');
  const [tPag, setTPag] = useState<string>('17');
  const [xPag, setXPag] = useState<string>('PIX');
  const [vPag, setVPag] = useState<number>(0);
  const [dPag, setDPag] = useState<string>('');
  const [tpIntegra, setTpIntegra] = useState<'0' | '1'>('1');
  const [CNPJInstPag, setCNPJInstPag] = useState<string>('');
  const [tBand, setTBand] = useState<string>('');
  const [cAut, setCAut] = useState<string>('');
  const [CNPJReceb, setCNPJReceb] = useState<string>('');
  const [idTermPag, setIdTermPag] = useState<string>('');

  // ============================================================
  // STATE - VALORES
  // ============================================================
  const [valorDesconto, setValorDesconto] = useState<number>(0);
  const [valorAcrescimo, setValorAcrescimo] = useState<number>(0);
  const [valorRecebido, setValorRecebido] = useState<number>(0);

  // ============================================================
  // STATE - INFORMAÇÕES ADICIONAIS
  // ============================================================
  const [infAdFisco, setInfAdFisco] = useState<string>('');
  const [infCpl, setInfCpl] = useState<string>('');

  // ============================================================
  // STATE - UI
  // ============================================================
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);
  const [isCarregandoUltima, setIsCarregandoUltima] = useState<boolean>(false);
  const [erros, setErros] = useState<string[]>([]);
  const [sucessoNfce, setSucessoNfce] = useState<NFCeDocumento | null>(null);
  // 🔥 Mesmo padrão do NfeEmissor: campo obrigatório vazio só fica vermelho
  // depois da primeira tentativa de emitir, e preview antes de transmitir de
  // verdade pra SEFAZ (homolog ou produção).
  const [tentouEnviar, setTentouEnviar] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);

  // ============================================================
  // CÁLCULOS
  // ============================================================
  const totais = calcularTotaisNfe(itens, 0, 0, 0, valorDesconto);
  const valorTotalFinal = Math.max(0, totais.valorTotalNota + valorAcrescimo);
  const troco = Math.max(0, valorRecebido - valorTotalFinal);

  // ============================================================
  // HANDLERS - CONSUMIDOR
  // ============================================================

  const handleSelectCliente = (clienteId: string) => {
    setSelectedClienteId(clienteId);
    if (!clienteId) {
      setConsumidorDoc('');
      setConsumidorNome('');
      setConsumidorEmail('');
      setConsumidorTelefone('');
      setConsumidorLogradouro('');
      setConsumidorNumero('');
      setConsumidorComplemento('');
      setConsumidorBairro('');
      setConsumidorCodigoMunicipio('');
      setConsumidorNomeMunicipio('');
      setConsumidorUf('SP');
      setConsumidorCep('');
      return;
    }
    const cli = clientes.find(c => c.id === clienteId);
    if (cli) {
      setConsumidorDoc(cli.documento);
      setConsumidorNome(cli.razaoSocial);
      setConsumidorEmail(cli.email || '');
      setConsumidorTelefone(cli.telefone || '');
      setConsumidorLogradouro(cli.endereco.logradouro);
      setConsumidorNumero(cli.endereco.numero);
      setConsumidorComplemento(cli.endereco.complemento || '');
      setConsumidorBairro(cli.endereco.bairro);
      setConsumidorCodigoMunicipio(cli.endereco.codigoMunicipio);
      setConsumidorNomeMunicipio(cli.endereco.nomeMunicipio);
      setConsumidorUf(cli.endereco.uf);
      setConsumidorCep(cli.endereco.cep);
    }
  };

  // ============================================================
  // HANDLERS - ITENS
  // ============================================================

  const handleAddItem = (prodId: string) => {
    const prod = produtos.find(p => p.id === prodId);
    if (!prod) {
      toast.showWarning('⚠️ Produto não encontrado.');
      return;
    }

    if (prod.estoqueAtual <= 0) {
      toast.showWarning(`⚠️ Produto "${prod.descricao}" sem estoque disponível.`);
      return;
    }

    const existenteIndex = itens.findIndex(it => it.codigoProduto === prod.codigo);
    if (existenteIndex >= 0) {
      const novos = [...itens];
      const it = novos[existenteIndex];
      const novaQtd = it.quantidade + 1;

      if (novaQtd > prod.estoqueAtual) {
        toast.showWarning(`⚠️ Estoque insuficiente para "${prod.descricao}". Disponível: ${prod.estoqueAtual}`);
        return;
      }

      const semBasePropria = !!it.csosnICMS && CSOSN_SEM_BASE_PROPRIA.includes(it.csosnICMS);
      const novoTotal = novaQtd * it.valorUnitario;
      novos[existenteIndex] = {
        ...it,
        quantidade: novaQtd,
        valorTotalBruto: novoTotal,
        baseCalculoICMS: semBasePropria ? 0 : novoTotal,
        valorICMS: semBasePropria ? 0 : (novoTotal * it.aliquotaICMS) / 100,
        valorPIS: (novoTotal * it.aliquotaPIS) / 100,
        valorCOFINS: (novoTotal * it.aliquotaCOFINS) / 100,
        valorTributosAproximados: novoTotal * 0.314,
      };
      setItens(novos);
      toast.showSuccess(`✅ Quantidade aumentada para "${prod.descricao}"`);
      return;
    }

    // CST (regime normal) e CSOSN (Simples Nacional) são mutuamente exclusivos
    // no leiaute — a empresa aqui é Simples Nacional (CRT=1), então o csosnICMS
    // do produto (quando cadastrado) prevalece sobre o CST.
    const semBasePropria = !!prod.csosnICMS && CSOSN_SEM_BASE_PROPRIA.includes(prod.csosnICMS);

    // 🔥 Decimal do Prisma (precoVenda/aliquota*) chega como string no JSON —
    // atribuição direta (sem Number()) contamina o item e quebra calcularTotaisNfe
    // (mesmo bug já corrigido no NfeEmissor: TypeError x.toFixed is not a function).
    const precoVenda = Number(prod.precoVenda);
    const aliquotaICMS = Number(prod.aliquotaICMS);
    const aliquotaPIS = Number(prod.aliquotaPIS);
    const aliquotaCOFINS = Number(prod.aliquotaCOFINS);

    const novoItem: ItemNfe = {
      id: `item-nfce-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      codigoProduto: prod.codigo,
      descricao: prod.descricao,
      ncm: prod.ncm,
      cest: prod.cest || undefined,
      cfop: '5102',
      unidadeMedida: prod.unidade,
      quantidade: 1,
      valorUnitario: precoVenda,
      valorTotalBruto: precoVenda,
      origemMercadoria: prod.origem || 0,
      cstICMS: (prod.cstICMS || '00') as ItemNfe['cstICMS'],
      csosnICMS: prod.csosnICMS as ItemNfe['csosnICMS'],
      aliquotaICMS,
      baseCalculoICMS: semBasePropria ? 0 : precoVenda,
      valorICMS: semBasePropria ? 0 : (precoVenda * aliquotaICMS) / 100,
      cstPIS: '01',
      aliquotaPIS,
      valorPIS: (precoVenda * aliquotaPIS) / 100,
      cstCOFINS: '01',
      aliquotaCOFINS,
      valorCOFINS: (precoVenda * aliquotaCOFINS) / 100,
      codigoEAN: prod.codigoBarrasEAN || undefined,
      codigoEANTrib: prod.codigoBarrasEAN || undefined,
      valorTributosAproximados: precoVenda * 0.314,
    };

    setItens([...itens, novoItem]);
    setBuscaProduto('');
    toast.showSuccess(`✅ "${prod.descricao}" adicionado ao cupom.`);
  };

  const handleUpdateItemQtd = (itemId: string, novaQtd: number) => {
    if (novaQtd <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    
    const item = itens.find(i => i.id === itemId);
    if (!item) return;
    
    const produto = produtos.find(p => p.codigo === item.codigoProduto);
    if (produto && novaQtd > produto.estoqueAtual) {
      toast.showWarning(`⚠️ Estoque insuficiente. Disponível: ${produto.estoqueAtual}`);
      return;
    }

    setItens(itens.map(it => {
      if (it.id === itemId) {
        const total = novaQtd * it.valorUnitario;
        return {
          ...it,
          quantidade: novaQtd,
          valorTotalBruto: total,
          baseCalculoICMS: total,
          valorICMS: (total * it.aliquotaICMS) / 100,
          valorPIS: (total * it.aliquotaPIS) / 100,
          valorCOFINS: (total * it.aliquotaCOFINS) / 100,
          valorIPI: (total * (it.aliquotaIPI || 0)) / 100,
          valorTributosAproximados: total * 0.314,
        };
      }
      return it;
    }));
  };

  const handleRemoveItem = (itemId: string) => {
    const item = itens.find(i => i.id === itemId);
    setItens(itens.filter(i => i.id !== itemId));
    if (item) {
      toast.showInfo(`ℹ️ "${item.descricao}" removido do cupom.`);
    }
  };

  const handleLimparItens = () => {
    if (itens.length === 0) return;
    setItens([]);
    toast.showInfo('ℹ️ Todos os itens foram removidos.');
  };

  // ============================================================
  // HANDLERS - PAGAMENTO
  // ============================================================

  const handleFormaPagamentoChange = (codigo: string) => {
    setFormaPagamento(codigo as '01' | '02' | '03' | '04' | '15' | '17' | '90' | '99');
    setTPag(codigo);
    const descricoes: Record<string, string> = {
      '01': 'Dinheiro',
      '02': 'Cheque',
      '03': 'Cartão de Crédito',
      '04': 'Cartão de Débito',
      '05': 'Crédito Loja',
      '10': 'Vale Alimentação',
      '11': 'Vale Refeição',
      '12': 'Vale Presente',
      '13': 'Vale Combustível',
      '15': 'Boleto Bancário',
      '17': 'PIX',
      '90': 'Sem Pagamento',
      '99': 'Outros',
    };
    setXPag(descricoes[codigo] || 'Outros');
  };

  // ============================================================
  // VALIDAÇÃO
  // ============================================================

  const validarNfce = (): boolean => {
    const errs: string[] = [];

    if (itens.length === 0) {
      errs.push('Adicione pelo menos 1 produto no cupom para emitir a NFC-e.');
    }

    if (identificarConsumidor) {
      // 🔥 Antes só validava o formato do CPF/CNPJ QUANDO já preenchido — se o
      // usuário marcasse "Identificar CPF/CNPJ" e deixasse os campos vazios,
      // passava direto sem avisar nada.
      if (!consumidorDoc.trim()) {
        errs.push('CPF/CNPJ do consumidor é obrigatório quando "Identificar CPF/CNPJ" está marcado.');
      } else {
        const val = validarCpfOuCnpj(consumidorDoc);
        if (!val.valido) {
          errs.push('CPF/CNPJ do consumidor informado é inválido.');
        }
      }
      if (!consumidorNome.trim()) {
        errs.push('Nome do consumidor é obrigatório quando identificado.');
      }
    }

    if (formaPagamento === '01' && valorRecebido > 0 && valorRecebido < valorTotalFinal) {
      errs.push(`Valor recebido em dinheiro (R$ ${valorRecebido.toFixed(2)}) é inferior ao total (R$ ${valorTotalFinal.toFixed(2)}).`);
    }

    if (vPag <= 0 && formaPagamento !== '90') {
      errs.push('Valor do pagamento deve ser maior que zero.');
    }

    if (['03', '04'].includes(formaPagamento) && !tBand) {
      errs.push('Informe a bandeira do cartão (Visa, Mastercard, etc).');
    }

    setErros(errs);
    return errs.length === 0;
  };

  // 🔥 Classe do input: borda vermelha só depois de tentar emitir (tentouEnviar)
  // E o campo estar vazio — mesmo padrão do NfeEmissor.
  const classeCampo = (valor: string, base = `w-full border rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`) =>
    tentouEnviar && !valor.trim()
      ? `${base.replace(corFocus, 'focus:ring-rose-500')} border-rose-400 bg-rose-50`
      : `${base} border-slate-300`;

  const handleClickEmitir = () => {
    setTentouEnviar(true);
    if (!validarNfce()) {
      toast.showError('Preencha os campos obrigatórios destacados em vermelho antes de emitir.');
      return;
    }
    setShowPreview(true);
  };

  // ============================================================
  // CARREGAR ÚLTIMA NOTA
  // ============================================================

  const handleCarregarUltima = async () => {
    setIsCarregandoUltima(true);
    setErros([]);
    try {
      const resposta = await nfceService.listar({ page: 1, limit: 1, status: 'AUTORIZADA' });
      const ultima = resposta.data?.[0];
      if (!ultima) {
        toast.showError('Nenhuma NFC-e autorizada anterior encontrada.');
        return;
      }

      setNaturezaOperacao(ultima.naturezaOperacao || naturezaOperacao);
      setFormaPagamento((ultima.formaPagamento as typeof formaPagamento) || formaPagamento);

      // A resposta real da API é o registro cru do Prisma (consumidorCpfCnpj/
      // consumidorNome soltos), não o shape { destinatario: {...} } do tipo
      // NFCeDocumento do protótipo antigo — lido aqui com um cast local.
      const raw = ultima as unknown as { consumidorCpfCnpj?: string; consumidorNome?: string };
      if (raw.consumidorCpfCnpj) {
        const clienteAnterior = clientes.find(c => c.documento === raw.consumidorCpfCnpj);
        setIdentificarConsumidor(true);
        if (clienteAnterior) {
          handleSelectCliente(clienteAnterior.id);
        } else {
          setConsumidorDoc(raw.consumidorCpfCnpj);
          setConsumidorNome(raw.consumidorNome || '');
        }
      } else {
        setIdentificarConsumidor(false);
      }

      // O shape do item devolvido pela API já bate quase 1:1 com ItemNfe — só
      // precisa de um id novo (React key) e o nome do campo de tributos
      // aproximados diverge (valorTributosAprox na API x valorTributosAproximados aqui).
      // 🔥 Decimal do Prisma (quantidade/valorUnitario/valorTotalBruto/aliquota*/
      // baseCalculoICMS/valorICMS/valorPIS/valorCOFINS) chega como string no JSON
      // — o `...item` espalhava esses campos sem Number(), e o preview quebrava
      // em item.valorUnitario.toFixed() (TypeError: not a function) assim que o
      // usuário usava "Carregar última nota" e depois abria o preview.
      const itensRecarregados: ItemNfe[] = (ultima.itens || []).map((item, idx) => ({
        ...item,
        id: `item-nfce-ultima-${Date.now()}-${idx}`,
        quantidade: Number(item.quantidade) || 1,
        valorUnitario: Number(item.valorUnitario) || 0,
        valorTotalBruto: Number(item.valorTotalBruto) || 0,
        aliquotaICMS: Number(item.aliquotaICMS) || 0,
        baseCalculoICMS: Number(item.baseCalculoICMS) || 0,
        valorICMS: Number(item.valorICMS) || 0,
        aliquotaPIS: Number(item.aliquotaPIS) || 0,
        valorPIS: Number(item.valorPIS) || 0,
        aliquotaCOFINS: Number(item.aliquotaCOFINS) || 0,
        valorCOFINS: Number(item.valorCOFINS) || 0,
        valorTributosAproximados: Number(
          (item as unknown as { valorTributosAprox?: number }).valorTributosAprox
            ?? item.valorTributosAproximados
        ) || 0,
      }));
      setItens(itensRecarregados);

      toast.showSuccess('Dados da última NFC-e carregados. Revise antes de emitir.');
    } catch (error: unknown) {
      toast.showError(getApiErrorMessage(error, 'Erro ao carregar a última NFC-e'));
    } finally {
      setIsCarregandoUltima(false);
    }
  };

  // ============================================================
  // TRANSMISSÃO
  // ============================================================

  const handleTransmitirNfce = async () => {
    if (!validarNfce()) return;

    setIsTransmitting(true);
    setErros([]);

    try {
      const itensParaEnvio: EmitirNfceItemParams[] = itens.map(item => ({
        codigoProduto: item.codigoProduto,
        descricao: item.descricao,
        ncm: item.ncm,
        cest: item.cest,
        cfop: item.cfop,
        unidadeMedida: item.unidadeMedida,
        quantidade: item.quantidade,
        valorUnitario: item.valorUnitario,
        cstICMS: item.csosnICMS ? undefined : item.cstICMS,
        csosnICMS: item.csosnICMS,
        aliquotaICMS: item.aliquotaICMS,
        baseCalculoICMS: item.baseCalculoICMS,
        valorICMS: item.valorICMS,
        cstPIS: item.cstPIS,
        aliquotaPIS: item.aliquotaPIS,
        valorPIS: item.valorPIS,
        cstCOFINS: item.cstCOFINS,
        aliquotaCOFINS: item.aliquotaCOFINS,
        valorCOFINS: item.valorCOFINS,
        valorTributosAproximados: item.valorTributosAproximados,
      }));

      const nfceEmitida = await nfceService.emitir({
        itens: itensParaEnvio,
        consumidorIdentificado: identificarConsumidor,
        consumidorDoc: identificarConsumidor ? consumidorDoc : undefined,
        consumidorNome: identificarConsumidor ? consumidorNome : undefined,
        naturezaOperacao,
        valorDesconto,
        valorAcrescimo,
        formaPagamento,
        valorPago: vPag,
        valorRecebido: formaPagamento === '01' ? valorRecebido : undefined,
        tokenCscId: undefined,
        infAdFisco: infAdFisco || undefined,
        infCpl: infCpl || undefined,
        tpNF,
        idDest,
        finNFe,
        indFinal,
        indPres,
        procEmi,
        verProc,
        tpEmis,
      });

      if (nfceEmitida) {
        onNfceEmitida(nfceEmitida);
        setSucessoNfce(nfceEmitida);
        setTentouEnviar(false);
        toast.showSuccess(`✅ NFC-e Nº ${nfceEmitida.numero} emitida com sucesso!`);
      }
    } catch (error: unknown) {
      console.error('❌ Erro na transmissão:', error);
      const mensagemErro = getApiErrorMessage(error, 'Erro ao emitir NFC-e. Tente novamente.');
      setErros([mensagemErro]);
      toast.showError(`❌ ${mensagemErro}`);
    } finally {
      setIsTransmitting(false);
      setShowPreview(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  const produtosFiltrados = produtos.filter(p => 
    p.descricao.toLowerCase().includes(buscaProduto.toLowerCase()) ||
    p.codigo.toLowerCase().includes(buscaProduto.toLowerCase()) ||
    (p.codigoBarrasEAN && p.codigoBarrasEAN.includes(buscaProduto))
  );

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      
      <div className={`${corBg} rounded-xl border ${corBorder} p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}>
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-8 h-8 ${corIconBg} rounded-lg flex items-center justify-center text-white shadow-sm`}>
              <ShoppingBag className="w-4 h-4" />
            </span>
            <h1 className="text-base font-bold text-slate-900">Emissão de NFC-e (Modelo 65)</h1>
            <span className={`${corBgBadge} ${corTextDark} text-[10px] font-bold px-2 py-0.5 rounded-full border ${corBorder}`}>
              Cupom Fiscal
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Emissão de cupom fiscal eletrônico para consumidor final com QR Code.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCarregarUltima}
            disabled={isCarregandoUltima}
            title="Preenche o formulário com os dados da última NFC-e autorizada"
            className={`bg-white hover:${corBgBadge} disabled:opacity-60 ${corText} font-medium text-xs px-3 py-2 rounded-lg border ${corBorder} transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCarregandoUltima ? 'animate-spin' : ''}`} />
            <span>{isCarregandoUltima ? 'Carregando...' : 'Carregar última nota'}</span>
          </button>
          <div className="text-right">
            <div className="text-xs font-semibold text-slate-700">Série {empresa.serieNfce || 1}</div>
            <div className={`text-[10px] font-medium ${corText}`}>Próxima NFC-e: Nº {empresa.proximoNumeroNfce || 1}</div>
          </div>
        </div>
      </div>

      {sucessoNfce && (
        <div className={`${corBg} border ${corBorder} rounded-xl p-4 shadow-sm animate-fadeIn`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className={`w-5 h-5 ${corText} shrink-0 mt-0.5`} />
              <div>
                <h3 className={`text-sm font-bold ${corTextDark}`}>
                  NFC-e Nº {sucessoNfce.numero} Emitida com Sucesso!
                </h3>
                <p className="text-xs text-purple-800 font-mono mt-0.5">
                  Chave: {sucessoNfce.chaveAcesso}
                </p>
                <div className="text-[11px] text-purple-700 mt-1">
                  Valor Total: {formatarMoeda(sucessoNfce.valorTotalNota)} • Protocolo: {sucessoNfce.protocoloAutorizacao}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onViewDanfce(sucessoNfce.id)}
                className={`${corBgButton} text-white font-medium text-xs px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Visualizar Cupom</span>
              </button>

              <button
                onClick={() => {
                  const blob = new Blob([sucessoNfce.xmlAssinado], { type: 'application/xml' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `NFCe_${sucessoNfce.numero}_SUP.xml`;
                  a.click();
                }}
                className="bg-white hover:bg-slate-100 text-slate-700 font-medium text-xs px-3 py-2 rounded-lg border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>XML</span>
              </button>

              <button
                onClick={() => {
                  setSucessoNfce(null);
                  setItens([]);
                  setValorDesconto(0);
                  setValorAcrescimo(0);
                  setValorRecebido(0);
                  setVPag(0);
                }}
                className="text-xs text-slate-600 hover:text-slate-900 underline ml-2 cursor-pointer"
              >
                Nova Venda
              </button>
            </div>
          </div>
        </div>
      )}

      {erros.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-rose-900">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Pendências na NFC-e ({erros.length}):</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 pl-2">
            {erros.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <User className={`w-4 h-4 ${corText}`} />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">1. Consumidor</h3>
          </div>
          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={identificarConsumidor}
              onChange={(e) => setIdentificarConsumidor(e.target.checked)}
              className={`rounded ${corFocus} cursor-pointer w-4 h-4`}
            />
            <span>Identificar CPF/CNPJ</span>
          </label>
        </div>

        {!identificarConsumidor ? (
          <div className="bg-slate-50 border border-dashed border-slate-300 rounded-lg p-4 text-center text-xs text-slate-600">
            <span>👤 <strong>Consumidor Não Identificado</strong> (Padrão Varejo)</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Cliente cadastrado:</span>
              <select
                value={selectedClienteId}
                onChange={(e) => handleSelectCliente(e.target.value)}
                className={`text-xs bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 ${corFocus} font-medium text-slate-700 max-w-[350px]`}
              >
                <option value="">-- Escolher Cliente --</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.razaoSocial} ({c.documento})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-medium text-slate-600 mb-1">CPF ou CNPJ *</label>
                <input
                  type="text"
                  value={consumidorDoc}
                  onChange={(e) => setConsumidorDoc(e.target.value)}
                  className={classeCampo(consumidorDoc)}
                  placeholder="000.000.000-00"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">Nome / Razão Social *</label>
                <input
                  type="text"
                  value={consumidorNome}
                  onChange={(e) => setConsumidorNome(e.target.value)}
                  className={classeCampo(consumidorNome)}
                  placeholder="Nome do consumidor"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">E-mail</label>
                <input
                  type="email"
                  value={consumidorEmail}
                  onChange={(e) => setConsumidorEmail(e.target.value)}
                  className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                  placeholder="email@consumidor.com"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">Telefone</label>
                <input
                  type="text"
                  value={consumidorTelefone}
                  onChange={(e) => setConsumidorTelefone(e.target.value)}
                  className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div className="border-t border-slate-200 pt-3">
              <div className="text-xs font-medium text-slate-700 mb-2">Endereço do Consumidor</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-medium text-slate-600 mb-1">Logradouro</label>
                  <input
                    type="text"
                    value={consumidorLogradouro}
                    onChange={(e) => setConsumidorLogradouro(e.target.value)}
                    className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                    placeholder="Rua, Avenida..."
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Número</label>
                  <input
                    type="text"
                    value={consumidorNumero}
                    onChange={(e) => setConsumidorNumero(e.target.value)}
                    className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                    placeholder="123"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Complemento</label>
                  <input
                    type="text"
                    value={consumidorComplemento}
                    onChange={(e) => setConsumidorComplemento(e.target.value)}
                    className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                    placeholder="Sala, Bloco..."
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Bairro</label>
                  <input
                    type="text"
                    value={consumidorBairro}
                    onChange={(e) => setConsumidorBairro(e.target.value)}
                    className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                    placeholder="Bairro"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Município</label>
                  <input
                    type="text"
                    value={consumidorNomeMunicipio}
                    onChange={(e) => setConsumidorNomeMunicipio(e.target.value)}
                    className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                    placeholder="São Paulo"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Cód. IBGE</label>
                  <input
                    type="text"
                    value={consumidorCodigoMunicipio}
                    onChange={(e) => setConsumidorCodigoMunicipio(e.target.value)}
                    className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                    placeholder="3550308"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">UF</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={consumidorUf}
                    onChange={(e) => setConsumidorUf(e.target.value.toUpperCase())}
                    className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus} uppercase`}
                    placeholder="SP"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">CEP</label>
                  <input
                    type="text"
                    value={consumidorCep}
                    onChange={(e) => setConsumidorCep(e.target.value)}
                    className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                    placeholder="01000-000"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
          <FileText className={`w-4 h-4 ${corText}`} />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">2. Identificação da NFC-e</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="sm:col-span-2">
            <label className="block font-medium text-slate-600 mb-1">Natureza da Operação *</label>
            <input
              type="text"
              value={naturezaOperacao}
              onChange={(e) => setNaturezaOperacao(e.target.value)}
              className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
              placeholder="Venda a Consumidor Final"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Tipo NF (TpNF)</label>
            <select
              value={tpNF}
              onChange={(e) => setTpNF(parseInt(e.target.value) as 0 | 1)}
              className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus} bg-white`}
            >
              <option value={0}>0 - Entrada</option>
              <option value={1}>1 - Saída</option>
            </select>
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Finalidade (FinNFe)</label>
            <select
              value={finNFe}
              onChange={(e) => setFinNFe(parseInt(e.target.value) as 1 | 2 | 3 | 4)}
              className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus} bg-white`}
            >
              <option value={1}>1 - Normal</option>
              <option value={2}>2 - Complementar</option>
              <option value={3}>3 - Ajuste</option>
              <option value={4}>4 - Devolução</option>
            </select>
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Consumidor Final (IndFinal)</label>
            <select
              value={indFinal}
              onChange={(e) => setIndFinal(parseInt(e.target.value) as 0 | 1)}
              className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus} bg-white`}
            >
              <option value={0}>0 - Não</option>
              <option value={1}>1 - Sim</option>
            </select>
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Presença (IndPres)</label>
            <select
              value={indPres}
              onChange={(e) => setIndPres(parseInt(e.target.value) as 0 | 1 | 2 | 3 | 4 | 5 | 9)}
              className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus} bg-white`}
            >
              <option value={0}>0 - Não se aplica</option>
              <option value={1}>1 - Presencial</option>
              <option value={2}>2 - Não presencial (Internet)</option>
              <option value={3}>3 - Não presencial</option>
              <option value={4}>4 - Teleatendimento</option>
              <option value={5}>5 - NFC-e entrega</option>
              <option value={9}>9 - Presencial fora</option>
            </select>
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">ID Destino</label>
            <select
              value={idDest}
              onChange={(e) => setIdDest(parseInt(e.target.value) as 1 | 2 | 3)}
              className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus} bg-white`}
            >
              <option value={1}>1 - Operação Interna</option>
              <option value={2}>2 - Interestadual</option>
              <option value={3}>3 - Exterior</option>
            </select>
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Processo de Emissão</label>
            <select
              value={procEmi}
              onChange={(e) => setProcEmi(e.target.value)}
              className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus} bg-white`}
            >
              <option value="0">0 - Aplicativo do contribuinte</option>
              <option value="1">1 - Avulsa</option>
              <option value="2">2 - Avulsa Fisco</option>
              <option value="4">4 - PAA</option>
            </select>
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Versão do Processo</label>
            <input
              type="text"
              value={verProc}
              onChange={(e) => setVerProc(e.target.value)}
              className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
            />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Tipo Emissão</label>
            <select
              value={tpEmis}
              onChange={(e) => setTpEmis(parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 9)}
              className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus} bg-white`}
            >
              <option value={1}>1 - Normal</option>
              <option value={2}>2 - Contingência</option>
              <option value={3}>3 - Regime Especial</option>
              <option value={4}>4 - SCAN</option>
              <option value={5}>5 - SVC</option>
              <option value={9}>9 - Off-line</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Package className={`w-4 h-4 ${corText}`} />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              3. Produtos ({itens.length})
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={buscaProduto}
                onChange={(e) => setBuscaProduto(e.target.value)}
                placeholder="Buscar produto..."
                className={`text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 ${corFocus} w-56`}
              />
            </div>
            <button
              onClick={handleLimparItens}
              className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors cursor-pointer"
            >
              Limpar
            </button>
          </div>
        </div>

        {buscaProduto.trim() && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 max-h-48 overflow-y-auto space-y-1 mb-3">
            {produtosFiltrados.length === 0 ? (
              <div className="text-xs text-slate-500 p-2 text-center">Nenhum produto encontrado.</div>
            ) : (
              produtosFiltrados.map(p => (
                <div
                  key={p.id}
                  onClick={() => handleAddItem(p.id)}
                  className="flex items-center justify-between p-2 bg-white hover:bg-purple-50 rounded-lg border border-slate-200 hover:border-purple-300 cursor-pointer transition-colors text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-900">{p.descricao}</div>
                    <div className="text-[10px] text-slate-500">Cód: {p.codigo} • Estoque: {p.estoqueAtual} {p.unidade}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-purple-700">{formatarMoeda(p.precoVenda)}</div>
                    <span className="text-[10px] text-purple-600 hover:underline">+ Incluir</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {itens.length === 0 ? (
          <div className={`p-6 border-2 border-dashed rounded-lg text-center ${
            tentouEnviar ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-slate-50/70'
          }`}>
            <ShoppingBag className={`w-8 h-8 mx-auto mb-2 ${tentouEnviar ? 'text-rose-300' : 'text-slate-300'}`} />
            <p className={`text-xs font-semibold ${tentouEnviar ? 'text-rose-700' : 'text-slate-700'}`}>Cupom Fiscal em Branco</p>
            <p className={`text-[11px] ${tentouEnviar ? 'text-rose-500' : 'text-slate-500'}`}>Pesquise um produto acima para adicionar</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
            {itens.map((item, idx) => (
              <div key={item.id} className="p-3 bg-white hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-semibold">
                      #{idx + 1}
                    </span>
                    <span className="font-bold text-slate-900 truncate">{item.descricao}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    NCM {item.ncm} • ICMS {item.aliquotaICMS}% • Unit: {formatarMoeda(item.valorUnitario)}
                    {item.cest && ` • CEST: ${item.cest}`}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden">
                    <button
                      type="button"
                      onClick={() => handleUpdateItemQtd(item.id, item.quantidade - 1)}
                      className="px-2 py-1 text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-2 py-1 font-semibold text-slate-900 min-w-[24px] text-center">
                      {item.quantidade}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUpdateItemQtd(item.id, item.quantidade + 1)}
                      className="px-2 py-1 text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right min-w-[70px]">
                    <div className="font-bold text-slate-900">{formatarMoeda(item.valorTotalBruto)}</div>
                    <div className="text-[10px] text-slate-400">Total</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {itens.length > 0 && (
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs mt-3">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              <div>
                <span className="text-slate-500">Itens:</span>
                <span className="font-bold ml-1">{itens.length}</span>
              </div>
              <div>
                <span className="text-slate-500">Qtd:</span>
                <span className="font-bold ml-1">{itens.reduce((acc, i) => acc + i.quantidade, 0)}</span>
              </div>
              <div>
                <span className="text-slate-500">Subtotal:</span>
                <span className="font-bold ml-1">{formatarMoeda(totais.valorTotalProdutos)}</span>
              </div>
              <div>
                <span className="text-slate-500">ICMS:</span>
                <span className="font-bold ml-1">{formatarMoeda(totais.valorTotalICMS)}</span>
              </div>
              <div>
                <span className="text-slate-500">Tributos:</span>
                <span className="font-bold ml-1">{formatarMoeda(totais.valorTotalTributosAproximados)}</span>
              </div>
              <div>
                <span className="text-slate-500">Desconto:</span>
                <span className="font-bold text-rose-600 ml-1">-{formatarMoeda(valorDesconto)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
          <CreditCard className={`w-4 h-4 ${corText}`} />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">4. Pagamento</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block font-medium text-slate-600 mb-1">Forma de Pagamento *</label>
            <select
              value={formaPagamento}
              onChange={(e) => handleFormaPagamentoChange(e.target.value)}
              className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus} bg-white`}
            >
              <option value="01">Dinheiro</option>
              <option value="02">Cheque</option>
              <option value="03">Cartão de Crédito</option>
              <option value="04">Cartão de Débito</option>
              <option value="05">Crédito Loja</option>
              <option value="10">Vale Alimentação</option>
              <option value="11">Vale Refeição</option>
              <option value="12">Vale Presente</option>
              <option value="13">Vale Combustível</option>
              <option value="15">Boleto Bancário</option>
              <option value="17">PIX</option>
              <option value="90">Sem Pagamento</option>
              <option value="99">Outros</option>
            </select>
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Valor do Pagamento (R$) *</label>
            {/* 🔥 Faltava o destaque em vermelho aqui — validarNfce já exigia
                vPag > 0 (exceto formaPagamento "90" Sem Pagamento) mas o campo
                nunca refletia isso visualmente. */}
            <input
              type="number"
              step="0.01"
              min="0"
              value={vPag || ''}
              onChange={(e) => setVPag(parseFloat(e.target.value) || 0)}
              className={`${classeCampo(tentouEnviar && vPag <= 0 && formaPagamento !== '90' ? '' : 'x')} text-sm font-bold`}
              placeholder="0,00"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Data do Pagamento</label>
            <input
              type="date"
              value={dPag}
              onChange={(e) => setDPag(e.target.value)}
              className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
            />
          </div>
        </div>

        {['03', '04'].includes(formaPagamento) && (
          <div className={`${corBg} border ${corBorder} rounded-lg p-4 space-y-3 mt-3`}>
            <div className="text-xs font-medium text-slate-700">Detalhes do Cartão</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-medium text-slate-600 mb-1">Bandeira {['03', '04'].includes(formaPagamento) ? '*' : ''}</label>
                <select
                  value={tBand}
                  onChange={(e) => setTBand(e.target.value)}
                  className={`${classeCampo(['03', '04'].includes(formaPagamento) ? tBand : 'x')} bg-white`}
                >
                  <option value="">Selecione...</option>
                  <option value="01">Visa</option>
                  <option value="02">Mastercard</option>
                  <option value="03">American Express</option>
                  <option value="04">Elo</option>
                  <option value="05">Hipercard</option>
                  <option value="99">Outros</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">CNPJ da Instituição</label>
                <input
                  type="text"
                  value={CNPJInstPag}
                  onChange={(e) => setCNPJInstPag(e.target.value)}
                  className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                  placeholder="00.000.000/0000-00"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">Código de Autorização</label>
                <input
                  type="text"
                  value={cAut}
                  onChange={(e) => setCAut(e.target.value)}
                  className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                  placeholder="Código da transação"
                />
              </div>
            </div>
          </div>
        )}

        {formaPagamento === '17' && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mt-3">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-800">
              <QrCode className="w-4 h-4" />
              <span>Pagamento via PIX</span>
            </div>
            <p className="text-[10px] text-emerald-600 mt-1">O QR Code será gerado no cupom fiscal após a emissão.</p>
          </div>
        )}

        {formaPagamento === '01' && (
          <div className={`${corBg} border ${corBorder} rounded-lg p-4 space-y-3 mt-3`}>
            <div className="text-xs font-medium text-slate-700">Pagamento em Dinheiro</div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-medium text-slate-600 mb-1">Valor Recebido (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={valorRecebido || ''}
                  onChange={(e) => setValorRecebido(parseFloat(e.target.value) || 0)}
                  className={`w-full border border-slate-300 rounded-lg p-2 text-sm font-bold focus:outline-none focus:ring-2 ${corFocus}`}
                  placeholder="0,00"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">Troco</label>
                <div className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm font-bold text-emerald-700">
                  {formatarMoeda(troco)}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-200 text-xs">
          <div>
            <label className="block font-medium text-slate-600 mb-1">Desconto (R$)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={valorDesconto || ''}
              onChange={(e) => setValorDesconto(parseFloat(e.target.value) || 0)}
              className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
              placeholder="0,00"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Acréscimo (R$)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={valorAcrescimo || ''}
              onChange={(e) => setValorAcrescimo(parseFloat(e.target.value) || 0)}
              className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
              placeholder="0,00"
            />
          </div>
        </div>

        <div className={`mt-3 p-3 ${corBg} rounded-lg border ${corBorder} text-xs`}>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            <div>
              <span className="text-slate-500">Subtotal:</span>
              <span className="font-bold ml-1">{formatarMoeda(totais.valorTotalProdutos)}</span>
            </div>
            <div>
              <span className="text-slate-500">Desconto:</span>
              <span className="font-bold text-rose-600 ml-1">-{formatarMoeda(valorDesconto)}</span>
            </div>
            <div>
              <span className="text-slate-500">Acréscimo:</span>
              <span className="font-bold text-emerald-600 ml-1">+{formatarMoeda(valorAcrescimo)}</span>
            </div>
            <div>
              <span className="text-slate-500">Tributos Aprox.:</span>
              <span className="font-bold ml-1">{formatarMoeda(totais.valorTotalTributosAproximados)}</span>
            </div>
            <div className="bg-purple-100 p-2 rounded-lg text-center">
              <span className="text-slate-700 font-bold">Total:</span>
              <span className="font-bold text-purple-800 ml-1">{formatarMoeda(valorTotalFinal)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
          <Info className={`w-4 h-4 ${corText}`} />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">5. Informações Adicionais</h3>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-medium text-slate-600 mb-1">Informações de Interesse do Fisco</label>
            <textarea
              rows={2}
              value={infAdFisco}
              onChange={(e) => setInfAdFisco(e.target.value)}
              className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus} resize-none`}
              placeholder="Normas referenciadas, informações complementares..."
              maxLength={2000}
            />
            <span className="text-[10px] text-slate-400">{infAdFisco.length}/2000</span>
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Informações Complementares do Contribuinte</label>
            <textarea
              rows={2}
              value={infCpl}
              onChange={(e) => setInfCpl(e.target.value)}
              className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus} resize-none`}
              placeholder="Informações adicionais..."
              maxLength={5000}
            />
            <span className="text-[10px] text-slate-400">{infCpl.length}/5000</span>
          </div>
        </div>
      </div>

      {/* 🔥 Clicável mesmo com dados incompletos — dispara a validação que pinta
          os campos obrigatórios vazios de vermelho (handleClickEmitir), e só
          abre o preview (não transmite ainda) quando tudo estiver ok. */}
      <button
        type="button"
        onClick={handleClickEmitir}
        disabled={isTransmitting}
        className={`w-full ${corBgButton} disabled:bg-slate-300 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50`}
      >
        {isTransmitting ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Transmitindo NFC-e para SEFAZ...</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>REVISAR & EMITIR NFC-e (MODELO 65)</span>
          </>
        )}
      </button>

      {/* ============================================================
          PREVIEW ANTES DE TRANSMITIR — mesmo componente DanfceLayout usado na
          visualização pós-emissão (DanfceViewer), com chancela "APENAS PARA
          VISUALIZAÇÃO". Nada é enviado pra SEFAZ até confirmar aqui dentro.
          ============================================================ */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl max-w-md w-full shadow-2xl max-h-[95vh] overflow-hidden flex flex-col">

            <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden select-none">
              <span
                className="absolute text-rose-600/25 text-3xl font-black uppercase tracking-widest whitespace-nowrap border-4 border-rose-600/25 px-6 py-2"
                style={{ top: '45%', left: '48%', transform: 'translate(-50%, -50%) rotate(-30deg)' }}
              >
                Apenas p/ Visualização
              </span>
            </div>

            <div className="shrink-0 bg-amber-50 border-b border-amber-200 px-4 py-3 flex items-center justify-between z-20">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">
                  Espelho do cupom — não emitido
                </span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                (empresa.ambienteEmissao as unknown as string) === 'PRODUCAO'
                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                  : 'bg-blue-100 text-blue-800 border-blue-300'
              }`}>
                {(empresa.ambienteEmissao as unknown as string) === 'PRODUCAO' ? 'PRODUÇÃO' : 'HOMOLOGAÇÃO'}
              </span>
            </div>

            <div className="overflow-y-auto flex-1 p-4">
              <DanfceLayout
                numero={empresa.proximoNumeroNfce || 1}
                serie={empresa.serieNfce || 1}
                emitente={{
                  razaoSocial: empresa.razaoSocial,
                  nomeFantasia: empresa.nomeFantasia,
                  cnpj: empresa.cnpj,
                  inscricaoEstadual: empresa.inscricaoEstadual,
                  endereco: empresa.endereco,
                }}
                consumidor={identificarConsumidor && consumidorDoc ? {
                  cpfCnpj: consumidorDoc,
                  nomeRazaoSocial: consumidorNome,
                } : null}
                itens={itens.map((item) => ({
                  id: item.id,
                  descricao: item.descricao,
                  quantidade: item.quantidade,
                  valorUnitario: item.valorUnitario,
                  valorTotalBruto: item.valorTotalBruto,
                }))}
                valorTotalProdutos={totais.valorTotalProdutos}
                valorTotalDesconto={totais.valorTotalDesconto}
                valorTotalNota={valorTotalFinal}
                valorPago={vPag}
                valorTroco={troco}
                valorTotalTributosAprox={totais.valorTotalTributosAproximados}
                formaPagamento={formaPagamento}
              />
            </div>

            <div className="shrink-0 bg-white border-t border-slate-100 px-4 py-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                disabled={isTransmitting}
                className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium text-sm cursor-pointer transition-colors disabled:opacity-50"
              >
                Voltar e Revisar
              </button>
              <button
                type="button"
                onClick={handleTransmitirNfce}
                disabled={isTransmitting}
                className={`px-4 py-2 rounded-lg ${corBgButton} text-white font-semibold text-sm shadow-sm cursor-pointer disabled:opacity-60 flex items-center gap-2 transition-colors`}
              >
                {isTransmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Transmitindo...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Confirmar e Transmitir</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};