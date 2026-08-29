// C:\emissornfe\src\components\fiscal\NfeEmissor.tsx

import React, { useState } from 'react';
import { 
  Receipt, Plus, Trash2, Send, CheckCircle2, AlertTriangle, 
  Eye, Download, Truck, CreditCard, DollarSign, Package,
  RefreshCw, User, Building, MapPin, Calendar, Calculator,
  Barcode, XCircle, FileText, Hash, Globe, Phone, Mail,
  Home, MapPinned, Weight, Box, Edit2, Info
} from 'lucide-react';
import { NFeDocumento, ItemNfe, FaturaDuplicata } from '../../types/fiscal';
import { Produto, ClienteFornecedor, ConfiguracaoEmpresa, TransportadoraERP } from '../../types/erp';
import { StorageService } from '../../utils/storage';
import { validarCpfOuCnpj, formatarMoeda, limparDocumento } from '../../utils/cpfCnpjValidator';
import { gerarChaveAcessoNFe } from '../../utils/chaveAcesso';
import { calcularTotaisNfe } from '../../utils/tributosEngine';
import { gerarXmlNfe400 } from '../../utils/xmlNfeGenerator';

// ============================================================
// INTERFACE
// ============================================================

interface NfeEmissorProps {
  empresa: ConfiguracaoEmpresa;
  clientes: ClienteFornecedor[];
  produtos: Produto[];
  transportadoras: TransportadoraERP[];
  onNfeEmitida: (nfe: NFeDocumento) => void;
  onViewDanfe: (nfe: NFeDocumento) => void;
}

// ============================================================
// VALIDAÇÕES
// ============================================================

function validarTJust(texto: string): boolean {
  return texto.length >= 15 && texto.length <= 255;
}

function validarCodigoMunicipio(codigo: string): boolean {
  return /^[0-9]{7}$/.test(codigo);
}

function validarCEP(cep: string): boolean {
  return /^[0-9]{8}$/.test(cep.replace(/\D/g, ''));
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
  const [erros, setErros] = useState<string[]>([]);
  const [sucessos, setSucessos] = useState<string[]>([]);
  const [nfeEmitidaSucesso, setNfeEmitidaSucesso] = useState<NFeDocumento | null>(null);

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

    const newItem: ItemNfe = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      codigoProduto: prod.codigo,
      descricao: prod.descricao,
      ncm: prod.ncm,
      cest: prod.cest || undefined,
      cfop: prod.cfopPadrao,
      unidadeMedida: prod.unidade,
      quantidade: 1,
      valorUnitario: prod.precoVenda,
      valorTotalBruto: prod.precoVenda,
      origemMercadoria: 0,
      cstICMS: '00',
      aliquotaICMS: prod.aliquotaICMS,
      baseCalculoICMS: prod.precoVenda,
      valorICMS: (prod.precoVenda * Number(prod.aliquotaICMS)) / 100,
      cstIPI: '50',
      aliquotaIPI: prod.aliquotaIPI || 0,
      valorIPI: (prod.precoVenda * Number(prod.aliquotaIPI || 0)) / 100,
      cstPIS: '01',
      aliquotaPIS: prod.aliquotaPIS,
      valorPIS: (prod.precoVenda * Number(prod.aliquotaPIS)) / 100,
      cstCOFINS: '01',
      aliquotaCOFINS: prod.aliquotaCOFINS,
      valorCOFINS: (prod.precoVenda * Number(prod.aliquotaCOFINS)) / 100,
      aliquotaIBSUF: 0.05,
      valorIBSUF: prod.precoVenda * 0.0005,
      aliquotaIBSMun: 0.05,
      valorIBSMun: prod.precoVenda * 0.0005,
      aliquotaCBS: 0.90,
      valorCBS: prod.precoVenda * 0.009,
      valorTributosAproximados: prod.precoVenda * 0.31,
      codigoEAN: prod.codigoBarrasEAN || undefined,
      codigoEANTrib: prod.codigoBarrasEAN || undefined,
    };

    setItens(prev => [...prev, newItem]);
    setProdutoSelecionado('');
    setSucessos(prev => [...prev, `Produto "${prod.descricao}" adicionado`]);
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
    limparCamposDestinatario();
    setErros([]);
    setSucessos([]);
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

    const valDoc = validarCpfOuCnpj(destinatarioDoc);
    if (!valDoc.valido) errs.push('CPF/CNPJ do destinatário inválido');

    if (!destinatarioNome.trim()) errs.push('Razão Social do destinatário é obrigatória');

    if (destinatarioIE && destinatarioIE !== 'ISENTO') {
      if (!/^[0-9]{0,14}$/.test(destinatarioIE.replace(/\D/g, ''))) {
        errs.push('Inscrição Estadual deve ter entre 0 e 14 dígitos (TIeDest)');
      }
    }

    if (destinatarioIEST && !/^[0-9]{2,14}$/.test(destinatarioIEST.replace(/\D/g, ''))) {
      errs.push('Inscrição Estadual ST deve ter entre 2 e 14 dígitos (TIeST)');
    }

    if (!validarCodigoMunicipio(destinatarioMunIbge)) {
      errs.push('Código do município deve ter 7 dígitos (TCodMunIBGE)');
    }

    if (!validarCEP(destinatarioCep)) errs.push('CEP inválido (8 dígitos)');

    if (itens.length === 0) errs.push('Adicione pelo menos 1 produto na NF-e');

    for (const item of itens) {
      if (!item.ncm || item.ncm.length !== 8) {
        errs.push(`Item "${item.descricao}": NCM deve ter 8 dígitos`);
      }
      if (!item.cfop || item.cfop.length !== 4) {
        errs.push(`Item "${item.descricao}": CFOP deve ter 4 dígitos`);
      }
    }

    return errs;
  };

  // ============================================================
  // TRANSMISSÃO
  // ============================================================

  const handleTransmitirNfe = () => {
    setErros([]);
    setSucessos([]);

    const errs = validarAntesDeTransmitir();
    if (errs.length > 0) {
      setErros(errs);
      return;
    }

    setIsTransmitting(true);

    setTimeout(() => {
      try {
        const numero = empresa.proximoNumeroNfe;
        const aamm = new Date().toISOString().slice(2, 4) + 
                     (new Date().getMonth() + 1).toString().padStart(2, '0');

        const { chaveCompleta } = gerarChaveAcessoNFe({
          codigoUf: empresa.endereco.codigoMunicipio.slice(0, 2),
          anoMes: aamm,
          cnpjEmitente: empresa.cnpj,
          modelo: '55',
          serie: empresa.serieNfe,
          numero,
          tipoEmissao: 1,
        });

        const docDestLimpo = limparDocumento(destinatarioDoc);
        const isCnpj = docDestLimpo.length === 14;

        const duplicatas: FaturaDuplicata[] = [
          {
            numero: `${numero}/01`,
            dataVencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            valor: totais.valorTotalNota,
            status: 'PENDENTE',
          },
        ];

        const novaNfe: NFeDocumento = {
          id: `nfe-${Date.now()}`,
          modelo: '55',
          serie: empresa.serieNfe,
          numero,
          chaveAcesso: chaveCompleta,
          dataHoraEmissao: new Date().toISOString(),
          dataHoraSaida: new Date().toISOString(),
          naturezaOperacao,
          ambiente: empresa.ambienteEmissao,
          tipoEmissao: 1,
          tipoDocumento,
          finalidade,
          consumidorFinal,
          presencaComprador,
          status: 'AUTORIZADA',
          idDest: empresa.endereco.uf === destinatarioUf ? 1 : 2,
          tpImp: 1,
          emitente: {
            cnpj: empresa.cnpj,
            inscricaoMunicipal: empresa.inscricaoMunicipal,
            inscricaoEstadual: empresa.inscricaoEstadual,
            razaoSocial: empresa.razaoSocial,
            nomeFantasia: empresa.nomeFantasia,
            regimeTributario: empresa.regimeTributario,
            optanteSimplesNacional: empresa.optanteSimplesNacional,
            optanteMEI: empresa.optanteMEI,
            endereco: empresa.endereco,
            aliquotaSimplesNacional: empresa.aliquotaSimplesNacional,
          },
          destinatario: {
            tipoPessoa: isCnpj ? 'PJ' : 'PF',
            documento: destinatarioDoc,
            nomeRazaoSocial: destinatarioNome,
            inscricaoEstadual: destinatarioIE || 'ISENTO',
            inscricaoEstadualST: destinatarioIEST || undefined,
            indicadorIEDestinatario: destinatarioIE ? '1' : '9',
            email: destinatarioEmail,
            telefone: destinatarioTelefone,
            endereco: {
              logradouro: destinatarioLogradouro,
              numero: destinatarioNumero,
              complemento: destinatarioComplemento,
              bairro: destinatarioBairro,
              codigoMunicipio: destinatarioMunIbge,
              nomeMunicipio: destinatarioMun,
              uf: destinatarioUf,
              cep: destinatarioCep,
              codigoPais: '1058',
              nomePais: 'BRASIL',
            },
          },
          itens: itens.map(item => ({
            ...item,
            valorTributosAproximados: item.valorTributosAproximados || 0,
          })),
          valorTotalProdutos: totais.valorTotalProdutos,
          valorTotalFrete: totais.valorTotalFrete,
          valorTotalSeguro: totais.valorTotalSeguro,
          valorTotalDesconto: totais.valorTotalDesconto,
          valorTotalOutrasDespesas: totais.valorTotalOutrasDespesas,
          baseCalculoICMS: totais.baseCalculoICMS,
          valorTotalICMS: totais.valorTotalICMS,
          baseCalculoICMSST: totais.baseCalculoICMSST,
          valorTotalICMSST: totais.valorTotalICMSST,
          valorTotalIPI: totais.valorTotalIPI,
          valorTotalPIS: totais.valorTotalPIS,
          valorTotalCOFINS: totais.valorTotalCOFINS,
          valorTotalIBS: totais.valorTotalIBS,
          valorTotalCBS: totais.valorTotalCBS,
          valorTotalTributosAproximados: totais.valorTotalTributosAproximados,
          valorTotalNota: totais.valorTotalNota,
          formaPagamento,
          duplicatas,
          transporte: {
            modalidadeFrete,
            transportadora: transportadoraNome ? {
              cnpjCpf: transportadoraCnpj,
              razaoSocial: transportadoraNome,
              municipio: empresa.endereco.nomeMunicipio,
              uf: empresa.endereco.uf,
            } : undefined,
            veiculo: veiculoPlaca ? {
              placa: veiculoPlaca,
              uf: veiculoUf,
              rntc: veiculoRNTC || undefined,
            } : undefined,
            volumes: volumesQuantidade > 0 ? {
              quantidade: volumesQuantidade,
              especie: volumesEspecie,
              pesoLiquidoKg: volumesPesoLiquido,
              pesoBrutoKg: volumesPesoBruto,
            } : undefined,
          },
          protocoloAutorizacao: `1352600${Math.floor(1000000 + Math.random() * 9000000)}`,
          dataHoraAutorizacao: new Date().toISOString(),
          informacoesAdicionais: 'Emitido por SUP TECNOLOGIA ERP. Integração automática com estoque (baixa automática efetuada) e contas a receber.',
          xmlAssinado: '',
        };

        novaNfe.xmlAssinado = gerarXmlNfe400(novaNfe);
        StorageService.addNfe(novaNfe);
        onNfeEmitida(novaNfe);
        setNfeEmitidaSucesso(novaNfe);
        setSucessos(['NF-e emitida e autorizada com sucesso!']);

      } catch (error: any) {
        setErros([`Erro ao transmitir NF-e: ${error.message || 'Erro desconhecido'}`]);
      } finally {
        setIsTransmitting(false);
      }
    }, 1200);
  };

  // ============================================================
  // RENDER - LAYOUT VERTICAL (EMPILHADO)
  // ============================================================

  const cor = 'emerald';
  const isFormReady = itens.length > 0 && destinatarioNome && destinatarioDoc;

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      
      {/* HEADER */}
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
        <div className="text-right">
          <div className="text-xs font-semibold text-slate-700">Série {empresa.serieNfe}</div>
          <div className="text-[10px] font-medium text-emerald-700">Próxima NF-e: Nº {empresa.proximoNumeroNfe}</div>
        </div>
      </div>

      {/* SUCESSO / ERRO */}
      {nfeEmitidaSucesso && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-emerald-800">NF-e Nº {nfeEmitidaSucesso.numero} Autorizada!</h3>
                <p className="text-xs text-emerald-800 font-mono mt-0.5">Chave: {nfeEmitidaSucesso.chaveAcesso}</p>
                <div className="text-[11px] text-emerald-700 mt-1">
                  Destinatário: {nfeEmitidaSucesso.destinatario.nomeRazaoSocial} • Total: {formatarMoeda(nfeEmitidaSucesso.valorTotalNota)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => onViewDanfe(nfeEmitidaSucesso)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm">
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

      {/* ============================================================
          BLOCO 1: DESTINATÁRIO
      ============================================================ */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">1. Destinatário</h3>
          </div>
          <select
            value={selectedClienteId}
            onChange={(e) => handleSelectCliente(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700 min-w-[200px]"
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
            <input type="text" value={destinatarioDoc} onChange={(e) => setDestinatarioDoc(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="00.000.000/0000-00" />
          </div>
          <div className="sm:col-span-2 md:col-span-3">
            <label className="block font-medium text-slate-600 mb-1">Razão Social / Nome *</label>
            <input type="text" value={destinatarioNome} onChange={(e) => setDestinatarioNome(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Razão Social do destinatário" />
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
            <input type="text" value={destinatarioLogradouro} onChange={(e) => setDestinatarioLogradouro(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Rua, Avenida..." />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Número *</label>
            <input type="text" value={destinatarioNumero} onChange={(e) => setDestinatarioNumero(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="123" />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Complemento</label>
            <input type="text" value={destinatarioComplemento} onChange={(e) => setDestinatarioComplemento(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Sala, Bloco..." />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Bairro *</label>
            <input type="text" value={destinatarioBairro} onChange={(e) => setDestinatarioBairro(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Bairro" />
          </div>

          <div>
            <label className="block font-medium text-slate-600 mb-1">Município *</label>
            <input type="text" value={destinatarioMun} onChange={(e) => setDestinatarioMun(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="São Paulo" />
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
            <input type="text" value={destinatarioCep} onChange={(e) => setDestinatarioCep(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="01000-000" />
          </div>
        </div>
      </div>

      {/* ============================================================
          BLOCO 2: DADOS GERAIS
      ============================================================ */}
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
            <select value={tipoDocumento} onChange={(e) => setTipoDocumento(Number(e.target.value) as any)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value={0}>0 - Entrada</option>
              <option value={1}>1 - Saída</option>
            </select>
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Finalidade</label>
            <select value={finalidade} onChange={(e) => setFinalidade(Number(e.target.value) as any)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
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

      {/* ============================================================
          BLOCO 3: ITENS
      ============================================================ */}
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
          <div className="p-8 border-2 border-dashed border-slate-200 rounded-lg text-center bg-slate-50/70">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Nenhum produto adicionado</p>
            <p className="text-xs text-slate-500">Selecione um produto no botão acima</p>
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
                    <input type="number" min="0.001" step="0.001" value={item.quantidade} onChange={(e) => handleUpdateItemQtd(idx, parseFloat(e.target.value) || 0.001)} className="w-full bg-white border border-slate-300 rounded p-1.5 font-bold text-slate-900 text-xs" />
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

      {/* ============================================================
          BLOCO 4: TRANSPORTE
      ============================================================ */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
          <Truck className="w-4 h-4 text-slate-500" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">4. Transporte</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-medium text-slate-600 mb-1">Modalidade Frete</label>
            <select value={modalidadeFrete} onChange={(e) => setModalidadeFrete(parseInt(e.target.value) as any)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
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

      {/* ============================================================
          BLOCO 5: PAGAMENTO
      ============================================================ */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
          <CreditCard className="w-4 h-4 text-slate-500" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">5. Pagamento</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-medium text-slate-600 mb-1">Forma de Pagamento</label>
            <select value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value as any)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
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
            <label className="block font-medium text-slate-600 mb-1">Presença Comprador</label>
            <select value={presencaComprador} onChange={(e) => setPresencaComprador(parseInt(e.target.value) as any)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value={0}>0 - Não se aplica</option>
              <option value={1}>1 - Presencial</option>
              <option value={2}>2 - Não presencial (Internet)</option>
              <option value={3}>3 - Não presencial (Internet)</option>
              <option value={4}>4 - Teleatendimento</option>
              <option value={5}>5 - NFC-e entrega</option>
              <option value={9}>9 - Presencial fora</option>
            </select>
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Finalidade</label>
            <select value={finalidade} onChange={(e) => setFinalidade(parseInt(e.target.value) as any)} className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value={1}>1 - Normal</option>
              <option value={2}>2 - Complementar</option>
              <option value={3}>3 - Ajuste</option>
              <option value={4}>4 - Devolução</option>
            </select>
          </div>
        </div>
      </div>

      {/* ============================================================
          BLOCO 6: TOTAIS DA NF-e
      ============================================================ */}
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

      {/* ============================================================
          BLOCO 7: AÇÕES (ÚLTIMO)
      ============================================================ */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
          <Send className="w-4 h-4 text-emerald-600" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">7. Ações</h3>
        </div>
        
        <div className="space-y-3">
          <button 
            onClick={handleTransmitirNfe} 
            disabled={isTransmitting || !isFormReady} 
            className={`w-full font-semibold text-sm py-3 px-4 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer ${
              isTransmitting || !isFormReady 
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
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
                <span>{!isFormReady ? 'PREENCHA OS DADOS PRIMEIRO' : 'EMITIR & AUTORIZAR NF-e'}</span>
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
              onClick={() => {
                if (isFormReady) {
                  alert('Pré-visualização do DANFE (simulação)');
                } else {
                  alert('Preencha os dados da NF-e primeiro');
                }
              }} 
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

    </div>
  );
};