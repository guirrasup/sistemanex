// C:\emissornfe\src\components\fiscal\NfeEmissor.tsx

import React, { useState } from 'react';
import { 
  Receipt, 
  Plus, 
  Trash2, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  Download, 
  Truck, 
  CreditCard, 
  DollarSign, 
  Package,
  RefreshCw,
  Sparkles,
  User,
  Building,
  FileText,
  MapPin,
  Calendar,
  ClipboardList,
  Calculator,
  Barcode
} from 'lucide-react';
import { NFeDocumento, ItemNfe, FaturaDuplicata } from '../../types/fiscal';
import { Produto, ClienteFornecedor, ConfiguracaoEmpresa } from '../../types/erp';
import { StorageService } from '../../utils/storage';
import { validarCpfOuCnpj, formatarMoeda, limparDocumento } from '../../utils/cpfCnpjValidator';
import { gerarChaveAcessoNFe } from '../../utils/chaveAcesso';
import { calcularTotaisNfe } from '../../utils/tributosEngine';
import { gerarXmlNfe400 } from '../../utils/xmlNfeGenerator';

interface NfeEmissorProps {
  empresa: ConfiguracaoEmpresa;
  clientes: ClienteFornecedor[];
  produtos: Produto[];
  onNfeEmitida: (nfe: NFeDocumento) => void;
  onViewDanfe: (nfe: NFeDocumento) => void;
}

export const NfeEmissor: React.FC<NfeEmissorProps> = ({
  empresa,
  clientes,
  produtos,
  onNfeEmitida,
  onViewDanfe,
}) => {
  // Destinatário
  const [selectedClienteId, setSelectedClienteId] = useState<string>('');
  const [destinatarioDoc, setDestinatarioDoc] = useState('');
  const [destinatarioNome, setDestinatarioNome] = useState('');
  const [destinatarioIE, setDestinatarioIE] = useState('');
  const [destinatarioEmail, setDestinatarioEmail] = useState('');
  const [destinatarioLogradouro, setDestinatarioLogradouro] = useState('');
  const [destinatarioNumero, setDestinatarioNumero] = useState('');
  const [destinatarioBairro, setDestinatarioBairro] = useState('');
  const [destinatarioMun, setDestinatarioMun] = useState('');
  const [destinatarioMunIbge, setDestinatarioMunIbge] = useState('');
  const [destinatarioUf, setDestinatarioUf] = useState('SP');
  const [destinatarioCep, setDestinatarioCep] = useState('');

  // Dados Gerais
  const [naturezaOperacao, setNaturezaOperacao] = useState('Venda de Mercadoria Adquirida de Terceiros');
  const [tipoOperacao, setTipoOperacao] = useState<0 | 1>(1);
  const [finalidade, setFinalidade] = useState<1 | 2 | 3 | 4>(1);
  const [consumidorFinal, setConsumidorFinal] = useState<boolean>(true);
  const [formaPagamento, setFormaPagamento] = useState<'01' | '02' | '03' | '04' | '15' | '17' | '90' | '99'>('17');

  // Grade de Itens
  const [itens, setItens] = useState<ItemNfe[]>([]);

  // Frete e Transporte
  const [modalidadeFrete, setModalidadeFrete] = useState<0 | 1 | 2 | 3 | 4 | 9>(0);
  const [valorFrete, setValorFrete] = useState<number>(0);
  const [valorSeguro, setValorSeguro] = useState<number>(0);
  const [valorDescontoGeral, setValorDescontoGeral] = useState<number>(0);
  const [transportadoraNome, setTransportadoraNome] = useState('BRASPRESS TRANSPORTES URGENTES LTDA');
  const [transportadoraCnpj, setTransportadoraCnpj] = useState('01.234.567/0001-89');

  // Estados
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);
  const [erros, setErros] = useState<string[]>([]);
  const [nfeEmitidaSucesso, setNfeEmitidaSucesso] = useState<NFeDocumento | null>(null);

  const totais = calcularTotaisNfe(itens, valorFrete, valorSeguro, 0, valorDescontoGeral);

  const handleSelectCliente = (clienteId: string) => {
    setSelectedClienteId(clienteId);
    if (!clienteId) {
      setDestinatarioDoc('');
      setDestinatarioNome('');
      setDestinatarioIE('');
      setDestinatarioEmail('');
      setDestinatarioLogradouro('');
      setDestinatarioNumero('');
      setDestinatarioBairro('');
      setDestinatarioMun('');
      setDestinatarioMunIbge('');
      setDestinatarioUf('SP');
      setDestinatarioCep('');
      return;
    }
    const cli = clientes.find(c => c.id === clienteId);
    if (cli) {
      setDestinatarioDoc(cli.documento);
      setDestinatarioNome(cli.razaoSocial);
      setDestinatarioIE(cli.inscricaoEstadual || '');
      setDestinatarioEmail(cli.email || '');
      setDestinatarioLogradouro(cli.endereco.logradouro);
      setDestinatarioNumero(cli.endereco.numero);
      setDestinatarioBairro(cli.endereco.bairro);
      setDestinatarioMun(cli.endereco.nomeMunicipio);
      setDestinatarioMunIbge(cli.endereco.codigoMunicipio);
      setDestinatarioUf(cli.endereco.uf);
      setDestinatarioCep(cli.endereco.cep);
    }
  };

  const handleAddItem = (prodId: string) => {
    const prod = produtos.find(p => p.id === prodId) || produtos[0];
    if (!prod) return;

    const newItem: ItemNfe = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      codigoProduto: prod.codigo,
      descricao: prod.descricao,
      ncm: prod.ncm,
      cfop: prod.cfopPadrao,
      unidadeMedida: prod.unidade,
      quantidade: 1,
      valorUnitario: prod.precoVenda,
      valorTotalBruto: prod.precoVenda,
      origemMercadoria: 0,
      cstICMS: '00',
      aliquotaICMS: prod.aliquotaICMS,
      baseCalculoICMS: prod.precoVenda,
      valorICMS: (prod.precoVenda * prod.aliquotaICMS) / 100,
      cstIPI: '50',
      aliquotaIPI: prod.aliquotaIPI || 0,
      valorIPI: ((prod.precoVenda * (prod.aliquotaIPI || 0)) / 100),
      cstPIS: '01',
      aliquotaPIS: prod.aliquotaPIS,
      valorPIS: (prod.precoVenda * prod.aliquotaPIS) / 100,
      cstCOFINS: '01',
      aliquotaCOFINS: prod.aliquotaCOFINS,
      valorCOFINS: (prod.precoVenda * prod.aliquotaCOFINS) / 100,
      aliquotaIBSUF: 0.05,
      valorIBSUF: prod.precoVenda * 0.0005,
      aliquotaIBSMun: 0.05,
      valorIBSMun: prod.precoVenda * 0.0005,
      aliquotaCBS: 0.90,
      valorCBS: prod.precoVenda * 0.009,
      valorTributosAproximados: prod.precoVenda * 0.31,
    };

    setItens(prev => [...prev, newItem]);
  };

  const handleUpdateItemQtd = (index: number, qtd: number) => {
    const newItens = [...itens];
    const item = newItens[index];
    const q = Math.max(1, qtd);
    item.quantidade = q;
    item.valorTotalBruto = q * item.valorUnitario;
    item.baseCalculoICMS = item.valorTotalBruto;
    item.valorICMS = (item.baseCalculoICMS * item.aliquotaICMS) / 100;
    item.valorPIS = (item.valorTotalBruto * item.aliquotaPIS) / 100;
    item.valorCOFINS = (item.valorTotalBruto * item.aliquotaCOFINS) / 100;
    item.valorIPI = (item.valorTotalBruto * (item.aliquotaIPI || 0)) / 100;
    setItens(newItens);
  };

  const handleRemoveItem = (index: number) => {
    setItens(prev => prev.filter((_, i) => i !== index));
  };

  const handleTransmitirNfe = () => {
    const errs: string[] = [];
    const valDoc = validarCpfOuCnpj(destinatarioDoc);
    if (!valDoc.valido) errs.push('CPF / CNPJ do destinatário inválido.');
    if (!destinatarioNome.trim()) errs.push('Razão Social do destinatário é obrigatória.');
    if (itens.length === 0) errs.push('Adicione pelo menos 1 produto na NF-e.');

    if (errs.length > 0) {
      setErros(errs);
      return;
    }

    setIsTransmitting(true);
    setErros([]);

    setTimeout(() => {
      try {
        const numero = empresa.proximoNumeroNfe;
        const aamm = new Date().toISOString().slice(2, 4) + (new Date().getMonth() + 1).toString().padStart(2, '0');

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
          tipoDocumento: 1,
          finalidade,
          consumidorFinal,
          presencaComprador: 2,
          status: 'AUTORIZADA',
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
          },
          destinatario: {
            tipoPessoa: isCnpj ? 'PJ' : 'PF',
            documento: destinatarioDoc,
            nomeRazaoSocial: destinatarioNome,
            inscricaoEstadual: destinatarioIE || 'ISENTO',
            indicadorIEDestinatario: destinatarioIE ? '1' : '9',
            email: destinatarioEmail,
            endereco: {
              logradouro: destinatarioLogradouro,
              numero: destinatarioNumero,
              bairro: destinatarioBairro,
              codigoMunicipio: destinatarioMunIbge,
              nomeMunicipio: destinatarioMun,
              uf: destinatarioUf,
              cep: destinatarioCep,
            },
          },
          itens,
          ...totais,
          formaPagamento,
          duplicatas,
          transporte: {
            modalidadeFrete,
            transportadora: {
              cnpjCpf: transportadoraCnpj,
              razaoSocial: transportadoraNome,
              municipio: empresa.endereco.nomeMunicipio,
              uf: empresa.endereco.uf,
            },
            volumes: {
              quantidade: itens.reduce((acc, curr) => acc + curr.quantidade, 0),
              especie: 'VOLUMES',
              pesoLiquidoKg: 25.0,
              pesoBrutoKg: 28.5,
            },
          },
          protocoloAutorizacao: `13526000${Math.floor(1000000 + Math.random() * 9000000)}`,
          dataHoraAutorizacao: new Date().toISOString(),
          informacoesAdicionais: 'Emitido por SUP TECNOLOGIA ERP. Integração automática com estoque (baixa automática efetuada) e contas a receber.',
          xmlAssinado: '',
        };

        novaNfe.xmlAssinado = gerarXmlNfe400(novaNfe);
        StorageService.addNfe(novaNfe);
        onNfeEmitida(novaNfe);
        setNfeEmitidaSucesso(novaNfe);
      } catch (e) {
        setErros(['Erro ao assinar e transmitir NF-e para a SEFAZ.']);
      } finally {
        setIsTransmitting(false);
      }
    }, 1200);
  };

  // 🔥 COR DO MÓDULO (ESMERALDA)
  const cor = 'emerald';
  const corBg = 'bg-emerald-50';
  const corBorder = 'border-emerald-200';
  const corText = 'text-emerald-700';
  const corTextDark = 'text-emerald-800';
  const corBgButton = 'bg-emerald-600 hover:bg-emerald-700';
  const corBgBadge = 'bg-emerald-100';
  const corFocus = 'focus:ring-emerald-500';
  const corIconBg = 'bg-emerald-600';

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      
      {/* 🔥 HEADER - MESMO DESIGN DO NFA-E */}
      <div className={`${corBg} rounded-xl border ${corBorder} p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}>
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-8 h-8 ${corIconBg} rounded-lg flex items-center justify-center text-white shadow-sm`}>
              <Receipt className="w-4 h-4" />
            </span>
            <h1 className="text-base font-bold text-slate-900">
              Emissão de NF-e (Modelo 55)
            </h1>
            <span className={`${corBgBadge} ${corTextDark} text-[10px] font-bold px-2 py-0.5 rounded-full border ${corBorder}`}>
              Produtos
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Emissão de nota de mercadorias com baixa automática em estoque e contas a receber.
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs font-semibold text-slate-700">Série {empresa.serieNfe}</div>
          <div className={`text-[10px] font-medium ${corText}`}>Próxima NF-e: Nº {empresa.proximoNumeroNfe}</div>
        </div>
      </div>

      {/* 🔥 BANNER SUCESSO */}
      {nfeEmitidaSucesso && (
        <div className={`${corBg} border ${corBorder} rounded-xl p-4 shadow-sm animate-fadeIn`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className={`w-5 h-5 ${corText} shrink-0 mt-0.5`} />
              <div>
                <h3 className={`text-sm font-bold ${corTextDark}`}>
                  NF-e Nº {nfeEmitidaSucesso.numero} Autorizada!
                </h3>
                <p className="text-xs text-emerald-800 font-mono mt-0.5">
                  Chave: {nfeEmitidaSucesso.chaveAcesso}
                </p>
                <div className="text-[11px] text-emerald-700 mt-1">
                  Destinatário: {nfeEmitidaSucesso.destinatario.nomeRazaoSocial} • Total: {formatarMoeda(nfeEmitidaSucesso.valorTotalNota)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onViewDanfe(nfeEmitidaSucesso)}
                className={`${corBgButton} text-white font-medium text-xs px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Visualizar DANFE</span>
              </button>

              <button
                onClick={() => {
                  const blob = new Blob([nfeEmitidaSucesso.xmlAssinado], { type: 'application/xml' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `NFe_${nfeEmitidaSucesso.numero}_SUP.xml`;
                  a.click();
                }}
                className="bg-white hover:bg-slate-100 text-slate-700 font-medium text-xs px-3 py-2 rounded-lg border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>XML</span>
              </button>

              <button
                onClick={() => setNfeEmitidaSucesso(null)}
                className="text-xs text-slate-600 hover:text-slate-900 underline ml-2 cursor-pointer"
              >
                Nova NF-e
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔥 ERROS */}
      {erros.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-rose-900">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Pendências na NF-e:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 pl-2">
            {erros.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 🔥 FORMULÁRIO - MESMA ESTRUTURA DO NFA-E */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* COLUNA ESQUERDA (2/3) */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* BLOCO 1: Destinatário */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <User className={`w-4 h-4 ${corText}`} />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">1. Destinatário</h3>
              </div>
              <select
                value={selectedClienteId}
                onChange={(e) => handleSelectCliente(e.target.value)}
                className={`text-xs bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 ${corFocus} font-medium text-slate-700 max-w-[280px]`}
              >
                <option value="">-- Escolher Cliente --</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.razaoSocial} ({c.documento})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
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
              <div className="sm:col-span-2">
                <label className="block font-medium text-slate-600 mb-1">Razão Social / Nome *</label>
                <input
                  type="text"
                  value={destinatarioNome}
                  onChange={(e) => setDestinatarioNome(e.target.value)}
                  className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                  placeholder="Razão Social do destinatário"
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
              <div className="sm:col-span-2">
                <label className="block font-medium text-slate-600 mb-1">Natureza da Operação</label>
                <input
                  type="text"
                  value={naturezaOperacao}
                  onChange={(e) => setNaturezaOperacao(e.target.value)}
                  className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                />
              </div>
            </div>
          </div>

          {/* BLOCO 2: Itens */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <Package className={`w-4 h-4 ${corText}`} />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  2. Produtos ({itens.length})
                </h3>
              </div>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddItem(e.target.value);
                    e.target.value = '';
                  }
                }}
                className={`text-xs ${corBgBadge} hover:bg-opacity-80 border ${corBorder} rounded-lg p-1.5 ${corTextDark} font-semibold focus:outline-none transition-colors cursor-pointer`}
              >
                <option value="">+ Adicionar Produto</option>
                {produtos.map(p => (
                  <option key={p.id} value={p.id}>{p.codigo} - {p.descricao.slice(0, 35)} ({formatarMoeda(p.precoVenda)})</option>
                ))}
              </select>
            </div>

            {itens.length === 0 ? (
              <div className="p-6 border-2 border-dashed border-slate-200 rounded-lg text-center bg-slate-50/70">
                <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">Nenhum produto adicionado</p>
                <p className="text-[11px] text-slate-500">Selecione um produto no botão acima</p>
              </div>
            ) : (
              <div className="space-y-2">
                {itens.map((item, idx) => (
                  <div key={item.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-slate-900 text-xs">{item.descricao}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Cód: {item.codigoProduto} | NCM: {item.ncm} | CFOP: {item.cfop} | CST: {item.cstICMS}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1 rounded transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1.5 border-t border-slate-200 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Qtd:</span>
                        <input
                          type="number"
                          min="1"
                          value={item.quantidade}
                          onChange={(e) => handleUpdateItemQtd(idx, parseInt(e.target.value) || 1)}
                          className="w-full bg-white border border-slate-300 rounded p-1 font-bold text-slate-900 text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">V. Unitário:</span>
                        <span className="font-medium block mt-1">{formatarMoeda(item.valorUnitario)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">ICMS:</span>
                        <span className={`font-medium ${corText} block mt-1`}>{formatarMoeda(item.valorICMS)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Total:</span>
                        <span className="font-bold text-slate-900 block mt-1">{formatarMoeda(item.valorTotalBruto)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* COLUNA DIREITA (1/3) */}
        <div className="space-y-4">
          
          {/* BLOCO 3: Totais */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">
              3. Totais da NF-e
            </h3>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Produtos:</span>
                <span className="font-semibold text-slate-900">{formatarMoeda(totais.valorTotalProdutos)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">ICMS:</span>
                <span className={`font-semibold ${corText}`}>{formatarMoeda(totais.valorTotalICMS)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">PIS / COFINS:</span>
                <span className="font-semibold">{formatarMoeda(totais.valorTotalPIS + totais.valorTotalCOFINS)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">IBS / CBS (2026):</span>
                <span className="font-semibold text-blue-700">{formatarMoeda(totais.valorTotalIBS + totais.valorTotalCBS)}</span>
              </div>
            </div>

            {/* 🔥 TOTAL DESTAQUE - MESMO ESTILO DO NFA-E */}
            <div className={`mt-3 p-3 bg-gradient-to-r from-${cor}-600 to-${cor}-700 text-white rounded-lg`}>
              <span className="text-[10px] text-${cor}-100 uppercase block font-medium">Total da Nota</span>
              <span className="text-xl font-bold text-white">{formatarMoeda(totais.valorTotalNota)}</span>
            </div>

            {/* 🔥 BOTÃO TRANSMITIR - MESMO ESTILO */}
            <button
              onClick={handleTransmitirNfe}
              disabled={isTransmitting}
              id="btn-transmitir-nfe"
              className={`w-full mt-3 ${corBgButton} disabled:bg-slate-300 text-white font-semibold text-xs py-2.5 px-3 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50`}
            >
              {isTransmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Transmitindo...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>EMITIR & AUTORIZAR NF-e</span>
                </>
              )}
            </button>
          </div>

          {/* BLOCO 4: Transporte */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
              <Truck className="w-4 h-4 text-slate-500" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">4. Transporte</h3>
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <label className="block font-medium text-slate-600 mb-1">Modalidade Frete</label>
                <select
                  value={modalidadeFrete}
                  onChange={(e) => setModalidadeFrete(parseInt(e.target.value) as any)}
                  className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                >
                  <option value={0}>0 - CIF (Emitente)</option>
                  <option value={1}>1 - FOB (Destinatário)</option>
                  <option value={2}>2 - Terceiros</option>
                  <option value={9}>9 - Sem Frete</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Transportadora</label>
                  <input
                    type="text"
                    value={transportadoraNome}
                    onChange={(e) => setTransportadoraNome(e.target.value)}
                    className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">CNPJ</label>
                  <input
                    type="text"
                    value={transportadoraCnpj}
                    onChange={(e) => setTransportadoraCnpj(e.target.value)}
                    className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};