// src/components/fiscal/NfeEmissor.tsx
import React, { useState } from 'react';
import { 
  Receipt, Plus, Trash2, Send, CheckCircle2, AlertTriangle, 
  Eye, Download, Truck, CreditCard, DollarSign, Package,
  RefreshCw, User, Building, MapPin, Calendar, Calculator,
  Barcode, XCircle, FileText, Hash, Globe, Phone, Mail,
  Home, MapPinned, Weight, Box, Edit2, Info
} from 'lucide-react';
import { NFeDocumento, ItemNfe } from '../../types/fiscal';
import { Produto, ClienteFornecedor, ConfiguracaoEmpresa, TransportadoraERP } from '../../types/erp';
import { DanfeLayout } from './DanfeLayout';
import { formatarMoeda } from '../../utils/cpfCnpjValidator';
import { calcularTotaisNfe } from '../../utils/tributosEngine';
import { getApiErrorMessage } from '../../utils/apiError';
import { nfeService, NfeApiRecord } from '../../services/nfe.service';
import { useToast } from '../../hooks/useToast';

// ============================================================
// INTERFACE
// ============================================================

interface NfeEmissorProps {
  empresa: ConfiguracaoEmpresa;
  clientes: ClienteFornecedor[];
  produtos: Produto[];
  transportadoras: TransportadoraERP[];
  onNfeEmitida: (nfe: NFeDocumento) => void;
  onViewDanfe: (nfeId: string) => void;
}

// ============================================================
// COMPONENTE
// ============================================================

export const NfeEmissor: React.FC<NfeEmissorProps> = ({
  empresa,
  clientes,
  produtos,
  transportadoras,
  onNfeEmitida,
  onViewDanfe,
}) => {
  const toast = useToast();

  // ============================================================
  // STATE - DESTINATÁRIO
  // ============================================================
  const [selectedClienteId, setSelectedClienteId] = useState<string>('');
  
  const [destinatarioDoc, setDestinatarioDoc] = useState('');
  const [destinatarioNome, setDestinatarioNome] = useState('');
  const [destinatarioIE, setDestinatarioIE] = useState('');
  const [destinatarioIEST, setDestinatarioIEST] = useState('');
  const [destinatarioEmail, setDestinatarioEmail] = useState('');
  const [destinatarioTelefone, setDestinatarioTelefone] = useState('');
  
  const [destinatarioLogradouro, setDestinatarioLogradouro] = useState('');
  const [destinatarioNumero, setDestinatarioNumero] = useState('');
  const [destinatarioComplemento, setDestinatarioComplemento] = useState('');
  const [destinatarioBairro, setDestinatarioBairro] = useState('');
  const [destinatarioMun, setDestinatarioMun] = useState('');
  const [destinatarioMunIbge, setDestinatarioMunIbge] = useState('');
  const [destinatarioUf, setDestinatarioUf] = useState('SP');
  const [destinatarioCep, setDestinatarioCep] = useState('');

  // ============================================================
  // STATE - DADOS GERAIS
  // ============================================================
  const [naturezaOperacao, setNaturezaOperacao] = useState('Venda de Mercadoria Adquirida de Terceiros');
  const [tipoDocumento, setTipoDocumento] = useState<0 | 1>(1);
  const [finalidade, setFinalidade] = useState<1 | 2 | 3 | 4>(1);
  const [consumidorFinal, setConsumidorFinal] = useState<boolean>(true);
  const [presencaComprador, setPresencaComprador] = useState<0 | 1 | 2 | 3 | 4 | 5 | 9>(2);
  const [formaPagamento, setFormaPagamento] = useState<'01' | '02' | '03' | '04' | '15' | '17' | '90' | '99'>('17');

  // ============================================================
  // STATE - ITENS
  // ============================================================
  const [itens, setItens] = useState<ItemNfe[]>([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState<string>('');

  // ============================================================
  // STATE - TRANSPORTE
  // ============================================================
  const [modalidadeFrete, setModalidadeFrete] = useState<0 | 1 | 2 | 3 | 4 | 9>(0);
  
  const [selectedTransportadoraId, setSelectedTransportadoraId] = useState<string>('');
  const [transportadoraNome, setTransportadoraNome] = useState('');
  const [transportadoraCnpj, setTransportadoraCnpj] = useState('');
  
  const [veiculoPlaca, setVeiculoPlaca] = useState('');
  const [veiculoUf, setVeiculoUf] = useState('SP');
  const [veiculoRNTC, setVeiculoRNTC] = useState('');
  const [volumesQuantidade, setVolumesQuantidade] = useState<number>(0);
  const [volumesEspecie, setVolumesEspecie] = useState('VOLUMES');
  const [volumesPesoLiquido, setVolumesPesoLiquido] = useState<number>(0);
  const [volumesPesoBruto, setVolumesPesoBruto] = useState<number>(0);

  // ============================================================
  // STATE - VALORES
  // ============================================================
  const [valorFrete, setValorFrete] = useState<number>(0);
  const [valorSeguro, setValorSeguro] = useState<number>(0);
  const [valorDescontoGeral, setValorDescontoGeral] = useState<number>(0);

  // ============================================================
  // STATE - UI
  // ============================================================
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);
  const [isCarregandoUltima, setIsCarregandoUltima] = useState<boolean>(false);
  const [erros, setErros] = useState<string[]>([]);
  const [nfeEmitidaSucesso, setNfeEmitidaSucesso] = useState<NfeApiRecord | null>(null);
  // 🔥 Só passa a destacar campo obrigatório vazio em vermelho DEPOIS da primeira
  // tentativa de emitir — não faz sentido mostrar tudo vermelho num formulário
  // ainda vazio que o usuário nem começou a preencher.
  const [tentouEnviar, setTentouEnviar] = useState<boolean>(false);
  // 🔥 Preview antes de transmitir de verdade pra SEFAZ (homolog ou produção) —
  // só chama nfeService.emitir() depois que o usuário confirmar no preview.
  const [showPreview, setShowPreview] = useState<boolean>(false);

  // ============================================================
  // CÁLCULOS
  // ============================================================
  const totais = calcularTotaisNfe(itens, valorFrete, valorSeguro, 0, valorDescontoGeral);

  // ============================================================
  // HANDLERS - DESTINATÁRIO
  // ============================================================

  const handleSelectCliente = (clienteId: string) => {
    setSelectedClienteId(clienteId);
    if (!clienteId) {
      limparCamposDestinatario();
      return;
    }
    const cli = clientes.find(c => c.id === clienteId);
    if (cli) {
      setDestinatarioDoc(cli.documento);
      setDestinatarioNome(cli.razaoSocial);
      setDestinatarioIE(cli.inscricaoEstadual || '');
      setDestinatarioIEST(cli.inscricaoEstadualST || '');
      setDestinatarioEmail(cli.email || '');
      setDestinatarioTelefone(cli.telefone || '');
      setDestinatarioLogradouro(cli.endereco.logradouro);
      setDestinatarioNumero(cli.endereco.numero);
      setDestinatarioComplemento(cli.endereco.complemento || '');
      setDestinatarioBairro(cli.endereco.bairro);
      setDestinatarioMun(cli.endereco.nomeMunicipio);
      setDestinatarioMunIbge(cli.endereco.codigoMunicipio);
      setDestinatarioUf(cli.endereco.uf);
      setDestinatarioCep(cli.endereco.cep);
    }
  };

  const limparCamposDestinatario = () => {
    setDestinatarioDoc('');
    setDestinatarioNome('');
    setDestinatarioIE('');
    setDestinatarioIEST('');
    setDestinatarioEmail('');
    setDestinatarioTelefone('');
    setDestinatarioLogradouro('');
    setDestinatarioNumero('');
    setDestinatarioComplemento('');
    setDestinatarioBairro('');
    setDestinatarioMun('');
    setDestinatarioMunIbge('');
    setDestinatarioUf('SP');
    setDestinatarioCep('');
  };

  // ============================================================
  // HANDLERS - TRANSPORTADORA
  // ============================================================

  const handleSelectTransportadora = (id: string) => {
    setSelectedTransportadoraId(id);
    if (!id) {
      setTransportadoraNome('');
      setTransportadoraCnpj('');
      return;
    }
    const t = transportadoras.find(t => t.id === id);
    if (t) {
      setTransportadoraNome(t.razaoSocial);
      setTransportadoraCnpj(t.cnpj);
    }
  };

  // ============================================================
  // HANDLERS - ITENS
  // ============================================================

  const handleAddItem = () => {
    if (!produtoSelecionado) return;
    
    const prod = produtos.find(p => p.id === produtoSelecionado);
    if (!prod) return;

    // ✅ id = produto.id (não um id aleatório): é o que permite montar o
    // payload de emissão ({ produtoId, quantidade }) que o backend espera —
    // ver handleTransmitirNfe. Se o mesmo produto for adicionado 2x, os itens
    // dividem o mesmo id/key; não é uma regressão (a lista nunca impediu duplicidade).
    // 🔥 Decimal do Prisma (precoVenda/precoCusto/aliquota*) chega como string no
    // JSON, apesar do tipo Produto dizer `number` — atribuição direta (sem Number())
    // deixa o campo como string; somado depois em calcularTotaisNfe com `+=`, vira
    // concatenação de texto e quebra o `.toFixed()` (TypeError: x.toFixed is not
    // a function) assim que outro item numérico é somado na mesma totalização.
    const precoVenda = Number(prod.precoVenda);
    const aliquotaICMS = Number(prod.aliquotaICMS);
    const aliquotaIPI = Number(prod.aliquotaIPI || 0);
    const aliquotaPIS = Number(prod.aliquotaPIS);
    const aliquotaCOFINS = Number(prod.aliquotaCOFINS);

    const newItem: ItemNfe = {
      id: prod.id,
      codigoProduto: prod.codigo,
      descricao: prod.descricao,
      ncm: prod.ncm,
      cest: prod.cest || undefined,
      cfop: prod.cfopPadrao,
      unidadeMedida: prod.unidade,
      quantidade: 1,
      valorUnitario: precoVenda,
      valorTotalBruto: precoVenda,
      origemMercadoria: 0,
      cstICMS: '00',
      aliquotaICMS,
      baseCalculoICMS: precoVenda,
      valorICMS: (precoVenda * aliquotaICMS) / 100,
      cstIPI: '50',
      aliquotaIPI,
      valorIPI: (precoVenda * aliquotaIPI) / 100,
      cstPIS: '01',
      aliquotaPIS,
      valorPIS: (precoVenda * aliquotaPIS) / 100,
      cstCOFINS: '01',
      aliquotaCOFINS,
      valorCOFINS: (precoVenda * aliquotaCOFINS) / 100,
      aliquotaIBSUF: 0.05,
      valorIBSUF: precoVenda * 0.0005,
      aliquotaIBSMun: 0.05,
      valorIBSMun: precoVenda * 0.0005,
      aliquotaCBS: 0.90,
      valorCBS: precoVenda * 0.009,
      valorTributosAproximados: precoVenda * 0.31,
      codigoEAN: prod.codigoBarrasEAN || undefined,
      codigoEANTrib: prod.codigoBarrasEAN || undefined,
    };

    setItens(prev => [...prev, newItem]);
    setProdutoSelecionado('');
  };

  const handleUpdateItemQtd = (index: number, qtd: number) => {
    const newItens = [...itens];
    const item = newItens[index];
    const q = Math.max(0.001, qtd);
    item.quantidade = q;
    item.valorTotalBruto = q * item.valorUnitario;
    item.baseCalculoICMS = item.valorTotalBruto;
    item.valorICMS = (item.baseCalculoICMS * Number(item.aliquotaICMS)) / 100;
    item.valorPIS = (item.valorTotalBruto * Number(item.aliquotaPIS)) / 100;
    item.valorCOFINS = (item.valorTotalBruto * Number(item.aliquotaCOFINS)) / 100;
    item.valorIPI = (item.valorTotalBruto * Number(item.aliquotaIPI || 0)) / 100;
    // 🔥 IBS/CBS/tributos aproximados ficavam travados no valor calculado na
    // hora de adicionar o item (com quantidade=1) — mudar a quantidade nunca
    // recalculava esses 4 campos, só ICMS/PIS/COFINS/IPI.
    item.valorIBSUF = item.valorTotalBruto * 0.0005;
    item.valorIBSMun = item.valorTotalBruto * 0.0005;
    item.valorCBS = item.valorTotalBruto * 0.009;
    item.valorTributosAproximados = item.valorTotalBruto * 0.31;
    setItens(newItens);
  };

  const handleUpdateItemValor = (index: number, valor: number) => {
    const newItens = [...itens];
    const item = newItens[index];
    const v = Math.max(0.01, valor);
    item.valorUnitario = v;
    item.valorTotalBruto = item.quantidade * v;
    item.baseCalculoICMS = item.valorTotalBruto;
    item.valorICMS = (item.baseCalculoICMS * Number(item.aliquotaICMS)) / 100;
    item.valorPIS = (item.valorTotalBruto * Number(item.aliquotaPIS)) / 100;
    item.valorCOFINS = (item.valorTotalBruto * Number(item.aliquotaCOFINS)) / 100;
    item.valorIPI = (item.valorTotalBruto * Number(item.aliquotaIPI || 0)) / 100;
    // 🔥 Mesmo problema de handleUpdateItemQtd, agora pra edição de valor unitário.
    item.valorIBSUF = item.valorTotalBruto * 0.0005;
    item.valorIBSMun = item.valorTotalBruto * 0.0005;
    item.valorCBS = item.valorTotalBruto * 0.009;
    item.valorTributosAproximados = item.valorTotalBruto * 0.31;
    setItens(newItens);
  };

  const handleRemoveItem = (index: number) => {
    setItens(prev => prev.filter((_, i) => i !== index));
  };

  // ============================================================
  // HANDLER - LIMPAR TUDO
  // ============================================================

  const handleLimparTudo = () => {
    setItens([]);
    setSelectedClienteId('');
    limparCamposDestinatario();
    setErros([]);
    setSelectedTransportadoraId('');
    setTransportadoraNome('');
    setTransportadoraCnpj('');
    setValorFrete(0);
    setValorSeguro(0);
    setValorDescontoGeral(0);
    setVeiculoPlaca('');
    setVeiculoUf('SP');
    setVeiculoRNTC('');
    setVolumesQuantidade(0);
    setVolumesEspecie('VOLUMES');
    setVolumesPesoLiquido(0);
    setVolumesPesoBruto(0);
    setNaturezaOperacao('Venda de Mercadoria Adquirida de Terceiros');
    setTipoDocumento(1);
    setFinalidade(1);
    setConsumidorFinal(true);
    setPresencaComprador(2);
    setFormaPagamento('17');
  };

  // ============================================================
  // VALIDAÇÃO
  // ============================================================

  const validarAntesDeTransmitir = (): string[] => {
    const errs: string[] = [];

    if (!selectedClienteId) errs.push('Selecione um cliente cadastrado na lista acima');
    // ⚠️ doc/nome/endereço abaixo são preenchidos automaticamente ao escolher o
    // cliente — mas se o cadastro do cliente tiver algum desses campos faltando,
    // eles chegam vazios aqui também, e a SEFAZ exige todos no XML do destinatário.
    if (!destinatarioDoc.trim()) errs.push('CPF/CNPJ do destinatário está vazio');
    if (!destinatarioNome.trim()) errs.push('Razão Social/Nome do destinatário está vazio');
    if (!destinatarioLogradouro.trim()) errs.push('Logradouro do destinatário está vazio');
    if (!destinatarioNumero.trim()) errs.push('Número do destinatário está vazio');
    if (!destinatarioBairro.trim()) errs.push('Bairro do destinatário está vazio');
    if (!destinatarioMun.trim()) errs.push('Município do destinatário está vazio');
    if (!destinatarioCep.trim()) errs.push('CEP do destinatário está vazio');

    if (itens.length === 0) errs.push('Adicione pelo menos 1 produto na NF-e');

    return errs;
  };

  // 🔥 Classe do input: borda vermelha só depois de tentar emitir (tentouEnviar)
  // E o campo estar vazio — assim que o usuário preenche, volta ao normal sozinho.
  const classeCampo = (valor: string, base = 'w-full border rounded-lg p-2 focus:outline-none focus:ring-2') =>
    tentouEnviar && !valor.trim()
      ? `${base} border-rose-400 bg-rose-50 focus:ring-rose-500`
      : `${base} border-slate-300 focus:ring-emerald-500`;

  const handleClickEmitir = () => {
    setTentouEnviar(true);
    const errs = validarAntesDeTransmitir();
    if (errs.length > 0) {
      setErros(errs);
      toast.showError('Preencha os campos obrigatórios destacados em vermelho antes de emitir.');
      return;
    }
    setErros([]);
    setShowPreview(true);
  };

  // ============================================================
  // CARREGAR ÚLTIMA NOTA
  // ============================================================

  const handleCarregarUltima = async () => {
    setIsCarregandoUltima(true);
    setErros([]);
    try {
      const resposta = await nfeService.listar({ page: 1, limit: 1, status: 'AUTORIZADA' });
      const ultima = resposta.data?.[0];
      if (!ultima) {
        toast.showError('Nenhuma NF-e autorizada anterior encontrada.');
        return;
      }

      if (ultima.destinatario?.id) {
        handleSelectCliente(ultima.destinatario.id);
      }
      // ⚠️ forma de pagamento e "consumidor final" não são persistidos hoje
      // pelo backend (POST /nfe/emitir ignora esses 2 campos na gravação —
      // achado durante esta revisão, fora do escopo deste checkpoint) —
      // então não há valor real pra restaurar; só a natureza da operação volta.
      if (ultima.natOp) setNaturezaOperacao(ultima.natOp);

      // Os itens salvos são um retrato (snapshot) da NF-e — não guardam o
      // produtoId original. Reencontra pelo código do produto no catálogo
      // atual (mais confiável reaproveitar o cadastro vigente do que os
      // valores/tributos históricos, que podem ter mudado desde então).
      const itensRecarregados: ItemNfe[] = [];
      let itensNaoEncontrados = 0;
      for (const itemAntigo of ultima.itens || []) {
        const prod = produtos.find(p => p.codigo === itemAntigo.codigoProduto);
        if (!prod) {
          itensNaoEncontrados++;
          continue;
        }
        const quantidade = Number(itemAntigo.quantidade) || 1;
        itensRecarregados.push({
          id: prod.id,
          codigoProduto: prod.codigo,
          descricao: prod.descricao,
          ncm: prod.ncm,
          cest: prod.cest || undefined,
          cfop: prod.cfopPadrao,
          unidadeMedida: prod.unidade,
          quantidade,
          valorUnitario: prod.precoVenda,
          valorTotalBruto: quantidade * prod.precoVenda,
          origemMercadoria: 0,
          cstICMS: '00',
          aliquotaICMS: prod.aliquotaICMS,
          baseCalculoICMS: quantidade * prod.precoVenda,
          valorICMS: (quantidade * prod.precoVenda * Number(prod.aliquotaICMS)) / 100,
          cstIPI: '50',
          aliquotaIPI: prod.aliquotaIPI || 0,
          valorIPI: (quantidade * prod.precoVenda * Number(prod.aliquotaIPI || 0)) / 100,
          cstPIS: '01',
          aliquotaPIS: prod.aliquotaPIS,
          valorPIS: (quantidade * prod.precoVenda * Number(prod.aliquotaPIS)) / 100,
          cstCOFINS: '01',
          aliquotaCOFINS: prod.aliquotaCOFINS,
          valorCOFINS: (quantidade * prod.precoVenda * Number(prod.aliquotaCOFINS)) / 100,
          aliquotaIBSUF: 0.05,
          valorIBSUF: quantidade * prod.precoVenda * 0.0005,
          aliquotaIBSMun: 0.05,
          valorIBSMun: quantidade * prod.precoVenda * 0.0005,
          aliquotaCBS: 0.90,
          valorCBS: quantidade * prod.precoVenda * 0.009,
          valorTributosAproximados: quantidade * prod.precoVenda * 0.31,
          codigoEAN: prod.codigoBarrasEAN || undefined,
          codigoEANTrib: prod.codigoBarrasEAN || undefined,
        });
      }
      setItens(itensRecarregados);

      const msg = itensNaoEncontrados > 0
        ? `Dados da última NF-e carregados (${itensNaoEncontrados} item(ns) não encontrados no catálogo atual e foram ignorados).`
        : 'Dados da última NF-e carregados. Revise antes de emitir.';
      toast.showSuccess(msg);
    } catch (error: unknown) {
      toast.showError(getApiErrorMessage(error, 'Erro ao carregar a última NF-e'));
    } finally {
      setIsCarregandoUltima(false);
    }
  };

  // ============================================================
  // TRANSMISSÃO
  // ============================================================

  const handleTransmitirNfe = async () => {
    setErros([]);

    const errs = validarAntesDeTransmitir();
    if (errs.length > 0) {
      setErros(errs);
      return;
    }

    setIsTransmitting(true);
    try {
      const nfeEmitida = await nfeService.emitir({
        destinatarioId: selectedClienteId,
        itens: itens.map(item => ({
          produtoId: item.id,
          quantidade: item.quantidade,
          valorUnitario: item.valorUnitario,
        })),
        naturezaOperacao,
        formaPagamento,
        consumidorFinal,
      });

      if (nfeEmitida) {
        // ⚠️ nfeEmitida vem no formato cru do Prisma (não no formato NFeDocumento
        // do protótipo antigo) — o cast é necessário porque a listagem/DANFE
        // ainda esperam o tipo antigo; ver nota em NfeApiRecord (nfe.service.ts).
        onNfeEmitida(nfeEmitida as unknown as NFeDocumento);
        setNfeEmitidaSucesso(nfeEmitida);
        setTentouEnviar(false);
        toast.showSuccess(`✅ NF-e Nº ${nfeEmitida.numero} emitida e autorizada com sucesso!`);
      }
    } catch (error: unknown) {
      const mensagemErro = getApiErrorMessage(error, 'Erro ao transmitir NF-e');
      setErros([mensagemErro]);
      toast.showError(`❌ ${mensagemErro}`);
    } finally {
      setIsTransmitting(false);
      setShowPreview(false);
    }
  };

  // ============================================================
  // RENDER - LAYOUT VERTICAL (EMPILHADO)
  // ============================================================

  const cor = 'emerald';
  const isFormReady = itens.length > 0 && !!selectedClienteId;

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      
      <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-sm">
              <Receipt className="w-4 h-4" />
            </span>
            <h1 className="text-base font-bold text-slate-900">Emissão de NF-e (Modelo 55)</h1>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
              Produtos
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Emissão de nota de mercadorias com baixa automática em estoque e contas a receber.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCarregarUltima}
            disabled={isCarregandoUltima}
            title="Preenche o formulário com os dados da última NF-e autorizada (cliente, itens, forma de pagamento)"
            className="bg-white hover:bg-emerald-100 disabled:opacity-60 text-emerald-700 font-medium text-xs px-3 py-2 rounded-lg border border-emerald-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCarregandoUltima ? 'animate-spin' : ''}`} />
            <span>{isCarregandoUltima ? 'Carregando...' : 'Carregar última nota'}</span>
          </button>
          <div className="text-right">
            <div className="text-xs font-semibold text-slate-700">Série {empresa.serieNfe}</div>
            <div className="text-[10px] font-medium text-emerald-700">Próxima NF-e: Nº {empresa.proximoNumeroNfe}</div>
          </div>
        </div>
      </div>

      {nfeEmitidaSucesso && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-emerald-800">NF-e Nº {nfeEmitidaSucesso.numero} Autorizada!</h3>
                <p className="text-xs text-emerald-800 font-mono mt-0.5">Chave: {nfeEmitidaSucesso.chaveAcesso}</p>
                <p className="text-xs text-emerald-800 font-mono mt-0.5">Protocolo: {nfeEmitidaSucesso.protocoloAutorizacao}</p>
                <div className="text-[11px] text-emerald-700 mt-1">
                  Destinatário: {nfeEmitidaSucesso.destinatario?.razaoSocial} • Total: {formatarMoeda(Number(nfeEmitidaSucesso.vNF) || 0)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => onViewDanfe(nfeEmitidaSucesso.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm">
                <Eye className="w-3.5 h-3.5" /> <span>Visualizar DANFE</span>
              </button>
              <button onClick={() => setNfeEmitidaSucesso(null)} className="text-xs text-slate-600 hover:text-slate-900 underline ml-2 cursor-pointer">
                Nova NF-e
              </button>
            </div>
          </div>
        </div>
      )}

      {erros.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-rose-900">
            <XCircle className="w-4 h-4 text-rose-600" />
            <span>Pendências ({erros.length}):</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 pl-2">
            {erros.map((err, idx) => <li key={idx}>{err}</li>)}
          </ul>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">1. Destinatário</h3>
          </div>
          <select
            value={selectedClienteId}
            onChange={(e) => handleSelectCliente(e.target.value)}
            className={`text-xs bg-slate-50 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 font-medium text-slate-700 min-w-[200px] border ${
              tentouEnviar && !selectedClienteId
                ? 'border-rose-400 bg-rose-50 focus:ring-rose-500'
                : 'border-slate-300 focus:ring-emerald-500'
            }`}
          >
            <option value="">-- Escolher Cliente --</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>{c.razaoSocial} ({c.documento})</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-medium text-slate-600 mb-1">CPF / CNPJ *</label>
            <input type="text" value={destinatarioDoc} onChange={(e) => setDestinatarioDoc(e.target.value)} className={classeCampo(destinatarioDoc)} placeholder="00.000.000/0000-00" />
          </div>
          <div className="sm:col-span-2 md:col-span-3">
            <label className="block font-medium text-slate-600 mb-1">Razão Social / Nome *</label>
            <input type="text" value={destinatarioNome} onChange={(e) => setDestinatarioNome(e.target.value)} className={classeCampo(destinatarioNome)} placeholder="Razão Social do destinatário" />
          </div>

          <div>
            <label className="block font-medium text-slate-600 mb-1">Inscrição Estadual</label>
            <input type="text" value={destinatarioIE} onChange={(e) => setDestinatarioIE(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="ISENTO ou número" />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">IE ST <span className="text-[10px] text-slate-400">(TIeST)</span></label>
            <input type="text" value={destinatarioIEST} onChange={(e) => setDestinatarioIEST(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="2-14 dígitos" />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Email</label>
            <input type="email" value={destinatarioEmail} onChange={(e) => setDestinatarioEmail(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="email@cliente.com" />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Telefone</label>
            <input type="text" value={destinatarioTelefone} onChange={(e) => setDestinatarioTelefone(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="(11) 99999-9999" />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-medium text-slate-600 mb-1">Logradouro *</label>
            <input type="text" value={destinatarioLogradouro} onChange={(e) => setDestinatarioLogradouro(e.target.value)} className={classeCampo(destinatarioLogradouro)} placeholder="Rua, Avenida..." />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Número *</label>
            <input type="text" value={destinatarioNumero} onChange={(e) => setDestinatarioNumero(e.target.value)} className={classeCampo(destinatarioNumero)} placeholder="123" />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Complemento</label>
            <input type="text" value={destinatarioComplemento} onChange={(e) => setDestinatarioComplemento(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Sala, Bloco..." />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Bairro *</label>
            <input type="text" value={destinatarioBairro} onChange={(e) => setDestinatarioBairro(e.target.value)} className={classeCampo(destinatarioBairro)} placeholder="Bairro" />
          </div>

          <div>
            <label className="block font-medium text-slate-600 mb-1">Município *</label>
            <input type="text" value={destinatarioMun} onChange={(e) => setDestinatarioMun(e.target.value)} className={classeCampo(destinatarioMun)} placeholder="São Paulo" />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Cód. Mun. IBGE <span className="text-[10px] text-slate-400">(TCodMunIBGE)</span></label>
            <input type="text" value={destinatarioMunIbge} onChange={(e) => setDestinatarioMunIbge(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="3550308" />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">UF *</label>
            <select value={destinatarioUf} onChange={(e) => setDestinatarioUf(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
              {['SP','RJ','MG','ES','PR','SC','RS','BA','PE','CE','GO','DF','MT','MS','PA','AM','RO','AC','RR','AP','TO','MA','PI','PB','RN','AL','SE'].map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">CEP *</label>
            <input type="text" value={destinatarioCep} onChange={(e) => setDestinatarioCep(e.target.value)} className={classeCampo(destinatarioCep)} placeholder="01000-000" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
          <FileText className="w-4 h-4 text-emerald-600" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">2. Dados Gerais</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-medium text-slate-600 mb-1">Natureza da Operação</label>
            <input type="text" value={naturezaOperacao} onChange={(e) => setNaturezaOperacao(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Tipo Documento <span className="text-[10px] text-slate-400">(TpNF)</span></label>
            <select value={tipoDocumento} onChange={(e) => setTipoDocumento(Number(e.target.value) as 0 | 1)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value={0}>0 - Entrada</option>
              <option value={1}>1 - Saída</option>
            </select>
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Finalidade</label>
            <select value={finalidade} onChange={(e) => setFinalidade(Number(e.target.value) as 1 | 2 | 3 | 4)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value={1}>1 - Normal</option>
              <option value={2}>2 - Complementar</option>
              <option value={3}>3 - Ajuste</option>
              <option value={4}>4 - Devolução</option>
            </select>
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Consumidor Final</label>
            <select value={consumidorFinal ? '1' : '0'} onChange={(e) => setConsumidorFinal(e.target.value === '1')} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="1">Sim</option>
              <option value="0">Não</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">3. Produtos ({itens.length})</h3>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={produtoSelecionado}
              onChange={(e) => setProdutoSelecionado(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-[200px]"
            >
              <option value="">Selecione um produto...</option>
              {produtos.map(p => (
                <option key={p.id} value={p.id}>{p.codigo} - {p.descricao.slice(0, 40)} ({formatarMoeda(p.precoVenda)})</option>
              ))}
            </select>
            <button onClick={handleAddItem} disabled={!produtoSelecionado} className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50">
              <Plus className="w-3.5 h-3.5" /> Adicionar
            </button>
          </div>
        </div>

        {itens.length === 0 ? (
          <div className={`p-8 border-2 border-dashed rounded-lg text-center ${
            tentouEnviar ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-slate-50/70'
          }`}>
            <Package className={`w-10 h-10 mx-auto mb-2 ${tentouEnviar ? 'text-rose-300' : 'text-slate-300'}`} />
            <p className={`text-sm font-semibold ${tentouEnviar ? 'text-rose-700' : 'text-slate-700'}`}>Nenhum produto adicionado</p>
            <p className={`text-xs ${tentouEnviar ? 'text-rose-500' : 'text-slate-500'}`}>Selecione um produto no botão acima</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {itens.map((item, idx) => (
              <div key={item.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 text-sm">{item.descricao}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Cód: {item.codigoProduto} | NCM: {item.ncm} | CFOP: {item.cfop} | CST: {item.cstICMS}
                    </div>
                  </div>
                  <button onClick={() => handleRemoveItem(idx)} className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded transition-colors cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2 border-t border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Qtd:</span>
                    {/* 🔥 step="1": a maioria dos produtos é vendida por unidade inteira —
                        step="0.001" fazia as setinhas do input incrementar de milésimo em
                        milésimo (imperceptível). min="0.001" continua permitindo digitar
                        valor fracionário direto (produtos por peso/volume, ex. KG/L). */}
                    <input type="number" min="0.001" step="1" value={item.quantidade} onChange={(e) => handleUpdateItemQtd(idx, parseFloat(e.target.value) || 0.001)} className="w-full bg-white border border-slate-300 rounded p-1.5 font-bold text-slate-900 text-xs" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">V. Unitário:</span>
                    <input type="number" min="0.01" step="0.01" value={item.valorUnitario} onChange={(e) => handleUpdateItemValor(idx, parseFloat(e.target.value) || 0.01)} className="w-full bg-white border border-slate-300 rounded p-1.5 font-bold text-slate-900 text-xs" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">ICMS:</span>
                    <span className="font-medium text-emerald-700 block mt-1.5">{formatarMoeda(item.valorICMS)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Total:</span>
                    <span className="font-bold text-slate-900 block mt-1.5">{formatarMoeda(item.valorTotalBruto)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">IBS/CBS:</span>
                    <span className="font-medium text-blue-700 block mt-1.5">{formatarMoeda((item.valorIBSUF || 0) + (item.valorIBSMun || 0) + (item.valorCBS || 0))}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Tributos Aprox:</span>
                    <span className="font-medium text-slate-700 block mt-1.5">{formatarMoeda(item.valorTributosAproximados)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
          <Truck className="w-4 h-4 text-slate-500" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">4. Transporte</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-medium text-slate-600 mb-1">Modalidade Frete</label>
            <select value={modalidadeFrete} onChange={(e) => setModalidadeFrete(parseInt(e.target.value) as 0 | 1 | 2 | 3 | 4 | 9)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value={0}>0 - CIF (Emitente)</option>
              <option value={1}>1 - FOB (Destinatário)</option>
              <option value={2}>2 - Terceiros</option>
              <option value={9}>9 - Sem Frete</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-600 mb-1">Transportadora</label>
            <select
              value={selectedTransportadoraId}
              onChange={(e) => handleSelectTransportadora(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">-- Selecionar --</option>
              {(transportadoras || []).map(t => (
                <option key={t.id} value={t.id}>
                  {t.razaoSocial}
                </option>
              ))}
            </select>
          </div>

          {selectedTransportadoraId && (
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 space-y-1 text-[10px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">CNPJ:</span>
                <span className="font-medium text-slate-700">{transportadoraCnpj}</span>
              </div>
              {(transportadoras || []).find(t => t.id === selectedTransportadoraId)?.rntrc && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">RNTRC:</span>
                  <span className="font-medium text-slate-700">
                    {(transportadoras || []).find(t => t.id === selectedTransportadoraId)?.rntrc}
                  </span>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block font-medium text-slate-600 mb-1">Placa</label>
            <input type="text" value={veiculoPlaca} onChange={(e) => setVeiculoPlaca(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="BRA1234" />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">UF</label>
            <select value={veiculoUf} onChange={(e) => setVeiculoUf(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
              {['SP','RJ','MG','ES','PR','SC','RS','BA','PE','CE','GO','DF','MT','MS','PA','AM','RO','AC','RR','AP','TO','MA','PI','PB','RN','AL','SE'].map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">RNTC</label>
            <input type="text" value={veiculoRNTC} onChange={(e) => setVeiculoRNTC(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="1234567" />
          </div>

          <div>
            <label className="block font-medium text-slate-600 mb-1">Frete (R$)</label>
            <input type="number" min="0" step="0.01" value={valorFrete} onChange={(e) => setValorFrete(parseFloat(e.target.value) || 0)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Seguro (R$)</label>
            <input type="number" min="0" step="0.01" value={valorSeguro} onChange={(e) => setValorSeguro(parseFloat(e.target.value) || 0)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
        </div>

        <div className="mt-4 border-t border-slate-200 pt-4">
          <label className="block font-medium text-slate-600 mb-2 text-xs">Volumes</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block">Qtd:</span>
              <input type="number" min="0" value={volumesQuantidade} onChange={(e) => setVolumesQuantidade(parseFloat(e.target.value) || 0)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Espécie:</span>
              <input type="text" value={volumesEspecie} onChange={(e) => setVolumesEspecie(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Caixas, Fardos..." />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Peso Líquido:</span>
              <input type="number" min="0" step="0.001" value={volumesPesoLiquido} onChange={(e) => setVolumesPesoLiquido(parseFloat(e.target.value) || 0)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Peso Bruto:</span>
              <input type="number" min="0" step="0.001" value={volumesPesoBruto} onChange={(e) => setVolumesPesoBruto(parseFloat(e.target.value) || 0)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
          <CreditCard className="w-4 h-4 text-slate-500" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">5. Pagamento</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-medium text-slate-600 mb-1">Forma de Pagamento</label>
            <select value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value as '01' | '02' | '03' | '04' | '15' | '17' | '90' | '99')} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="01">01 - Dinheiro</option>
              <option value="02">02 - Cheque</option>
              <option value="03">03 - Cartão Crédito</option>
              <option value="04">04 - Cartão Débito</option>
              <option value="15">15 - Boleto</option>
              <option value="17">17 - PIX</option>
              <option value="90">90 - Sem Pagamento</option>
              <option value="99">99 - Outros</option>
            </select>
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Desconto Geral (R$)</label>
            <input type="number" min="0" step="0.01" value={valorDescontoGeral} onChange={(e) => setValorDescontoGeral(parseFloat(e.target.value) || 0)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Presença Comprador <span className="text-[10px] text-slate-400">(indPres)</span></label>
            {/* 🔥 Rótulos de 3/4/5/9 estavam deslocados em relação à tabela oficial
                do indPres (Manual da NF-e) — o código enviado já estava certo, mas
                o texto mostrado ao usuário descrevia o código errado, podendo levar
                a escolher a opção pensando que significava outra coisa. */}
            <select value={presencaComprador} onChange={(e) => setPresencaComprador(parseInt(e.target.value) as 0 | 1 | 2 | 3 | 4 | 5 | 9)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value={0}>0 - Não se aplica</option>
              <option value={1}>1 - Presencial</option>
              <option value={2}>2 - Não presencial (Internet)</option>
              <option value={3}>3 - Não presencial (Teleatendimento)</option>
              <option value={4}>4 - NFC-e com entrega a domicílio</option>
              <option value={5}>5 - Presencial, fora do estabelecimento</option>
              <option value={9}>9 - Não presencial (Outros)</option>
            </select>
          </div>
          {/* 🔥 "Finalidade" removido daqui — campo duplicado, já existe na seção
              2 (Dados Gerais) ligado ao mesmo estado `finalidade`. */}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 mb-4">6. Totais da NF-e</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
            <span className="text-slate-600">Produtos:</span>
            <span className="font-semibold text-slate-900">{formatarMoeda(totais.valorTotalProdutos)}</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
            <span className="text-slate-600">ICMS:</span>
            <span className="font-semibold text-emerald-700">{formatarMoeda(totais.valorTotalICMS)}</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
            <span className="text-slate-600">PIS:</span>
            <span className="font-semibold">{formatarMoeda(totais.valorTotalPIS)}</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
            <span className="text-slate-600">COFINS:</span>
            <span className="font-semibold">{formatarMoeda(totais.valorTotalCOFINS)}</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
            <span className="text-slate-600">IPI:</span>
            <span className="font-semibold">{formatarMoeda(totais.valorTotalIPI)}</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
            <span className="text-slate-600">Frete:</span>
            <span className="font-semibold">{formatarMoeda(totais.valorTotalFrete)}</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
            <span className="text-slate-600">Seguro:</span>
            <span className="font-semibold">{formatarMoeda(totais.valorTotalSeguro)}</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
            <span className="text-slate-600">Desconto:</span>
            <span className="font-semibold text-rose-600">{formatarMoeda(totais.valorTotalDesconto)}</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
            <span className="text-slate-600">IBS (UF+Mun):</span>
            <span className="font-semibold text-blue-700">{formatarMoeda(totais.valorTotalIBS)}</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
            <span className="text-slate-600">CBS (Federal):</span>
            <span className="font-semibold text-purple-700">{formatarMoeda(totais.valorTotalCBS)}</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 col-span-2">
            <span className="text-slate-600">Tributos Aproximados (Lei 12.741):</span>
            <span className="font-semibold text-slate-700">{formatarMoeda(totais.valorTotalTributosAproximados)}</span>
          </div>
        </div>

        <div className="mt-4 p-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg">
          <span className="text-[10px] text-emerald-100 uppercase block font-medium">Total da Nota</span>
          <span className="text-2xl font-bold text-white">{formatarMoeda(totais.valorTotalNota)}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
          <Send className="w-4 h-4 text-emerald-600" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">7. Ações</h3>
        </div>
        
        <div className="space-y-3">
          {/* 🔥 Clicável mesmo com dados incompletos — é o que dispara a validação
              que pinta os campos obrigatórios vazios de vermelho (handleClickEmitir).
              Só fica de fato desabilitado durante a transmissão em si. */}
          <button
            onClick={handleClickEmitir}
            disabled={isTransmitting}
            className={`w-full font-semibold text-sm py-3 px-4 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer ${
              isTransmitting
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : isFormReady
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-slate-700 hover:bg-slate-800 text-white'
            }`}
          >
            {isTransmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Transmitindo para SEFAZ...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>{!isFormReady ? 'VER PENDÊNCIAS E CONTINUAR' : 'REVISAR & EMITIR NF-e'}</span>
              </>
            )}
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={handleLimparTudo} 
              className="bg-white hover:bg-slate-50 text-slate-600 font-medium text-xs py-2 px-3 rounded-lg border border-slate-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Limpar Tudo
            </button>
            <button
              onClick={handleClickEmitir}
              className="bg-white hover:bg-slate-50 text-slate-600 font-medium text-xs py-2 px-3 rounded-lg border border-slate-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              Pré-visualizar
            </button>
          </div>

          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <div className="flex items-center justify-between">
              <span>Status:</span>
              <span className={`font-semibold ${isFormReady ? 'text-emerald-600' : 'text-amber-600'}`}>
                {isFormReady ? '✅ Pronto para emitir' : '⏳ Dados incompletos'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Itens:</span>
              <span className="font-semibold">{itens.length} produto(s)</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Total:</span>
              <span className="font-semibold">{formatarMoeda(totais.valorTotalNota)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          PREVIEW ANTES DE TRANSMITIR — nada é enviado pra SEFAZ até o
          usuário confirmar aqui dentro. Chancela "APENAS PARA VISUALIZAÇÃO"
          deixa claro que isso não é a nota autorizada ainda.
          ============================================================ */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          {/* 🔥 flex-col + overflow-hidden no card (não mais overflow-y-auto direto
              nele) — a chancela agora é um overlay absolute que cobre o CARD
              inteiro (cabeçalho+conteúdo+rodapé) e fica presa ali por cima,
              recortada pelas bordas do card, em vez de "sticky" dentro da área
              que rola (o que a prendia colada no topo, fora do centro). Só o
              miolo (o DANFE em si) tem overflow-y-auto agora. */}
          <div className="relative bg-white rounded-xl max-w-4xl w-full shadow-2xl max-h-[95vh] overflow-hidden flex flex-col">

            {/* Chancela diagonal — cobre o card inteiro, deslocada pra baixo e pra
                esquerda do centro de propósito, pra "cortar" tanto na borda
                esquerda quanto na borda de cima do card (efeito de carimbo). */}
            <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden select-none">
              <span
                className="absolute text-rose-600/25 text-5xl sm:text-6xl font-black uppercase tracking-widest whitespace-nowrap border-4 border-rose-600/25 px-10 py-3"
                style={{ top: '28%', left: '48%', transform: 'translate(-50%, -50%) rotate(-30deg)' }}
              >
                Apenas para Visualização
              </span>
            </div>

            <div className="shrink-0 bg-amber-50 border-b border-amber-200 px-5 py-3 flex items-center justify-between z-20">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">
                  Espelho do DANFE — documento ainda NÃO emitido/transmitido
                </span>
              </div>
              {/* 🔥 ConfiguracaoEmpresa tipa ambienteEmissao como TAmb (1|2), mas em
                  runtime o backend manda a string 'PRODUCAO'/'HOMOLOGACAO' (schema
                  do Empresa é String, não enum numérico) — cast necessário aqui. */}
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                (empresa.ambienteEmissao as unknown as string) === 'PRODUCAO'
                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                  : 'bg-blue-100 text-blue-800 border-blue-300'
              }`}>
                {(empresa.ambienteEmissao as unknown as string) === 'PRODUCAO' ? 'PRODUÇÃO' : 'HOMOLOGAÇÃO'}
              </span>
            </div>

            {/* 🔥 Mesmo componente DanfeLayout usado na visualização pós-emissão
                (DanfeViewer) — é um espelho de verdade do DANFE real, não uma
                versão resumida à parte que poderia ficar desatualizada. Chave de
                acesso/protocolo/data de autorização ainda não existem nesse
                momento (só são gerados na autorização pela SEFAZ), então ficam
                como placeholder dentro do próprio DanfeLayout. */}
            <div className="overflow-y-auto flex-1">
            <DanfeLayout
              numero={empresa.proximoNumeroNfe}
              serie={empresa.serieNfe}
              tipoDocumento={tipoDocumento}
              naturezaOperacao={naturezaOperacao}
              emitente={{
                razaoSocial: empresa.razaoSocial,
                cnpj: empresa.cnpj,
                inscricaoEstadual: empresa.inscricaoEstadual,
                endereco: empresa.endereco,
              }}
              destinatario={{
                nomeRazaoSocial: destinatarioNome,
                documento: destinatarioDoc,
                telefone: destinatarioTelefone,
                inscricaoEstadual: destinatarioIE,
                endereco: {
                  logradouro: destinatarioLogradouro,
                  numero: destinatarioNumero,
                  complemento: destinatarioComplemento,
                  bairro: destinatarioBairro,
                  nomeMunicipio: destinatarioMun,
                  uf: destinatarioUf,
                  cep: destinatarioCep,
                },
              }}
              duplicatas={[]}
              itens={itens}
              totais={{
                baseCalculoICMS: totais.baseCalculoICMS,
                valorTotalICMS: totais.valorTotalICMS,
                baseCalculoICMSST: totais.baseCalculoICMSST,
                valorTotalICMSST: totais.valorTotalICMSST,
                valorTotalProdutos: totais.valorTotalProdutos,
                valorTotalNota: totais.valorTotalNota,
                valorTotalFrete: totais.valorTotalFrete,
                valorTotalSeguro: totais.valorTotalSeguro,
                valorTotalDesconto: totais.valorTotalDesconto,
                valorTotalIPI: totais.valorTotalIPI,
                valorTotalPIS: totais.valorTotalPIS,
                valorTotalCOFINS: totais.valorTotalCOFINS,
              }}
            />
            </div>

            <div className="shrink-0 bg-white border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                disabled={isTransmitting}
                className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium cursor-pointer transition-colors disabled:opacity-50"
              >
                Voltar e Revisar
              </button>
              <button
                type="button"
                onClick={handleTransmitirNfe}
                disabled={isTransmitting}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm cursor-pointer disabled:opacity-60 flex items-center gap-2 transition-colors"
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

    </div>
  );
};