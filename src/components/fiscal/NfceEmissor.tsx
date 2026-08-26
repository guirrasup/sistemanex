// C:\emissornfe\src\components\fiscal\NfceEmissor.tsx

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
  Receipt
} from 'lucide-react';
import { NFCeDocumento, ItemNfe } from '../../types/fiscal';
import { Produto, ClienteFornecedor, ConfiguracaoEmpresa } from '../../types/erp';
import { StorageService } from '../../utils/storage';
import { formatarMoeda, formatarCpfCnpj, validarCpfOuCnpj } from '../../utils/cpfCnpjValidator';
import { gerarChaveAcessoNFe } from '../../utils/chaveAcesso';
import { calcularTotaisNfe } from '../../utils/tributosEngine';

interface NfceEmissorProps {
  empresa: ConfiguracaoEmpresa;
  clientes: ClienteFornecedor[];
  produtos: Produto[];
  onNfceEmitida: (nfce: NFCeDocumento) => void;
  onViewDanfce: (nfce: NFCeDocumento) => void;
}

export const NfceEmissor: React.FC<NfceEmissorProps> = ({
  empresa,
  clientes,
  produtos,
  onNfceEmitida,
  onViewDanfce,
}) => {
  // Consumidor
  const [identificarConsumidor, setIdentificarConsumidor] = useState<boolean>(false);
  const [selectedClienteId, setSelectedClienteId] = useState<string>('');
  const [consumidorDoc, setConsumidorDoc] = useState<string>('');
  const [consumidorNome, setConsumidorNome] = useState<string>('');
  const [consumidorEmail, setConsumidorEmail] = useState<string>('');

  // Itens do Cupom
  const [itens, setItens] = useState<ItemNfe[]>([]);
  const [buscaProduto, setBuscaProduto] = useState<string>('');

  // Pagamento
  const [formaPagamento, setFormaPagamento] = useState<'01' | '02' | '03' | '04' | '15' | '17' | '90' | '99'>('17');
  const [valorDesconto, setValorDesconto] = useState<number>(0);
  const [valorRecebido, setValorRecebido] = useState<number>(0);

  // Estados
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);
  const [erros, setErros] = useState<string[]>([]);
  const [sucessoNfce, setSucessoNfce] = useState<NFCeDocumento | null>(null);

  // Totais
  const totais = calcularTotaisNfe(itens, 0, 0, 0, valorDesconto);
  const valorTotalFinal = Math.max(0, totais.valorTotalNota);
  const troco = Math.max(0, valorRecebido - valorTotalFinal);

  const handleSelectCliente = (clienteId: string) => {
    setSelectedClienteId(clienteId);
    if (!clienteId) {
      setConsumidorDoc('');
      setConsumidorNome('');
      setConsumidorEmail('');
      return;
    }
    const cli = clientes.find(c => c.id === clienteId);
    if (cli) {
      setConsumidorDoc(cli.documento);
      setConsumidorNome(cli.razaoSocial);
      setConsumidorEmail(cli.email || '');
    }
  };

  const handleAddItem = (prodId: string) => {
    const prod = produtos.find(p => p.id === prodId);
    if (!prod) return;

    const existenteIndex = itens.findIndex(it => it.codigoProduto === prod.codigo);
    if (existenteIndex >= 0) {
      const novos = [...itens];
      const it = novos[existenteIndex];
      const novaQtd = it.quantidade + 1;
      const novoTotal = novaQtd * it.valorUnitario;
      novos[existenteIndex] = {
        ...it,
        quantidade: novaQtd,
        valorTotalBruto: novoTotal,
        baseCalculoICMS: novoTotal,
        valorICMS: (novoTotal * it.aliquotaICMS) / 100,
        valorPIS: (novoTotal * it.aliquotaPIS) / 100,
        valorCOFINS: (novoTotal * it.aliquotaCOFINS) / 100,
        valorTributosAproximados: novoTotal * 0.314,
      };
      setItens(novos);
      return;
    }

    const novoItem: ItemNfe = {
      id: `item-nfce-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      codigoProduto: prod.codigo,
      descricao: prod.descricao,
      ncm: prod.ncm,
      cfop: '5102',
      unidadeMedida: prod.unidade,
      quantidade: 1,
      valorUnitario: prod.precoVenda,
      valorTotalBruto: prod.precoVenda,
      origemMercadoria: 0,
      cstICMS: '00',
      aliquotaICMS: prod.aliquotaICMS,
      baseCalculoICMS: prod.precoVenda,
      valorICMS: (prod.precoVenda * prod.aliquotaICMS) / 100,
      cstPIS: '01',
      aliquotaPIS: prod.aliquotaPIS,
      valorPIS: (prod.precoVenda * prod.aliquotaPIS) / 100,
      cstCOFINS: '01',
      aliquotaCOFINS: prod.aliquotaCOFINS,
      valorCOFINS: (prod.precoVenda * prod.aliquotaCOFINS) / 100,
      valorTributosAproximados: prod.precoVenda * 0.314,
    };

    setItens([...itens, novoItem]);
    setBuscaProduto('');
  };

  const handleUpdateItemQtd = (itemId: string, novaQtd: number) => {
    if (novaQtd <= 0) {
      handleRemoveItem(itemId);
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
          valorTributosAproximados: total * 0.314,
        };
      }
      return it;
    }));
  };

  const handleRemoveItem = (itemId: string) => {
    setItens(itens.filter(i => i.id !== itemId));
  };

  const validarNfce = (): boolean => {
    const errs: string[] = [];
    if (itens.length === 0) {
      errs.push('Adicione pelo menos 1 produto no cupom para emitir a NFC-e.');
    }
    if (identificarConsumidor && consumidorDoc.trim()) {
      const val = validarCpfOuCnpj(consumidorDoc);
      if (!val.valido) {
        errs.push('CPF/CNPJ do consumidor informado é inválido.');
      }
    }
    if (formaPagamento === '01' && valorRecebido > 0 && valorRecebido < valorTotalFinal) {
      errs.push(`Valor recebido em dinheiro (R$ ${valorRecebido.toFixed(2)}) é inferior ao total (R$ ${valorTotalFinal.toFixed(2)}).`);
    }
    setErros(errs);
    return errs.length === 0;
  };

  const handleTransmitirNfce = () => {
    if (!validarNfce()) return;

    setIsTransmitting(true);
    setErros([]);

    setTimeout(() => {
      try {
        const numero = empresa.proximoNumeroNfce || 219;
        const { chaveCompleta } = gerarChaveAcessoNFe({
          codigoUf: empresa.endereco.codigoMunicipio.slice(0, 2) || '35',
          anoMes: new Date().toISOString().slice(2, 4) + new Date().toISOString().slice(5, 7),
          cnpjEmitente: empresa.cnpj,
          modelo: '65',
          serie: empresa.serieNfce || 1,
          numero,
          tipoEmissao: 1,
        });

        const novaNfce: NFCeDocumento = {
          id: `nfce-${Date.now()}`,
          modelo: '65',
          serie: empresa.serieNfce || 1,
          numero,
          chaveAcesso: chaveCompleta,
          dataHoraEmissao: new Date().toISOString(),
          naturezaOperacao: 'Venda a Consumidor Final (NFC-e)',
          ambiente: empresa.ambienteEmissao,
          tipoEmissao: 1,
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
          consumidorIdentificado: identificarConsumidor,
          destinatario: identificarConsumidor ? {
            cpfCnpj: consumidorDoc || undefined,
            nomeRazaoSocial: consumidorNome || 'Consumidor Identificado',
            email: consumidorEmail || undefined,
          } : undefined,
          itens,
          valorTotalProdutos: totais.valorTotalProdutos,
          valorTotalDesconto: valorDesconto,
          valorTotalTributosAproximados: totais.valorTotalTributosAproximados,
          valorTotalNota: valorTotalFinal,
          formaPagamento,
          valorPago: formaPagamento === '01' && valorRecebido > 0 ? valorRecebido : valorTotalFinal,
          valorTroco: formaPagamento === '01' ? troco : 0,
          urlQrCode: `https://www.nfce.fazenda.sp.gov.br/qrcode?p=${chaveCompleta}|2|1|1|D9B8C7E6A5F4`,
          tokenCscId: '000001',
          protocoloAutorizacao: `1352600${Math.floor(1000000 + Math.random() * 9000000)}`,
          dataHoraAutorizacao: new Date().toISOString(),
          xmlAssinado: `<nfeProc versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe"><NFe><infNFe Id="NFe${chaveCompleta}" versao="4.00"><ide><cUF>35</cUF><mod>65</mod><nNF>${numero}</nNF></ide></infNFe></NFe></nfeProc>`,
        };

        StorageService.addNfce(novaNfce);
        onNfceEmitida(novaNfce);
        setSucessoNfce(novaNfce);
      } catch (e) {
        setErros(['Falha ao autorizar NFC-e junto ao webservice da SEFAZ.']);
      } finally {
        setIsTransmitting(false);
      }
    }, 1000);
  };

  const produtosFiltrados = produtos.filter(p => 
    p.descricao.toLowerCase().includes(buscaProduto.toLowerCase()) ||
    p.codigo.toLowerCase().includes(buscaProduto.toLowerCase()) ||
    (p.codigoBarrasEAN && p.codigoBarrasEAN.includes(buscaProduto))
  );

  // 🔥 COR DO MÓDULO (ROXO)
  const cor = 'purple';
  const corBg = 'bg-purple-50';
  const corBorder = 'border-purple-200';
  const corText = 'text-purple-700';
  const corTextDark = 'text-purple-800';
  const corBgButton = 'bg-purple-600 hover:bg-purple-700';
  const corBgBadge = 'bg-purple-100';
  const corFocus = 'focus:ring-purple-500';
  const corIconBg = 'bg-purple-600';
  const corGradient = 'from-purple-600 to-purple-700';

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      
      {/* 🔥 HEADER - MESMO DESIGN DO NFA-E */}
      <div className={`${corBg} rounded-xl border ${corBorder} p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}>
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-8 h-8 ${corIconBg} rounded-lg flex items-center justify-center text-white shadow-sm`}>
              <ShoppingBag className="w-4 h-4" />
            </span>
            <h1 className="text-base font-bold text-slate-900">
              Emissão de NFC-e (Consumidor & PDV)
            </h1>
            <span className={`${corBgBadge} ${corTextDark} text-[10px] font-bold px-2 py-0.5 rounded-full border ${corBorder}`}>
              Modelo 65
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Emissão ágil de Cupom Fiscal Eletrônico para consumidor final com QR Code e baixa em estoque.
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs font-semibold text-slate-700">Série {empresa.serieNfce || 1}</div>
          <div className={`text-[10px] font-medium ${corText}`}>Próxima NFC-e: Nº {empresa.proximoNumeroNfce || 219}</div>
        </div>
      </div>

      {/* 🔥 BANNER SUCESSO */}
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
                onClick={() => onViewDanfce(sucessoNfce)}
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
                  setValorRecebido(0);
                }}
                className="text-xs text-slate-600 hover:text-slate-900 underline ml-2 cursor-pointer"
              >
                Nova Venda
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
            <span>Pendências na NFC-e:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 pl-2">
            {erros.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 🔥 FORMULÁRIO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* COLUNA ESQUERDA (2/3) */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* BLOCO 1: Consumidor */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <User className={`w-4 h-4 ${corText}`} />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">1. Consumidor</h3>
              </div>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={identificarConsumidor}
                  onChange={(e) => setIdentificarConsumidor(e.target.checked)}
                  className={`rounded ${corText} focus:ring-2 ${corFocus} cursor-pointer`}
                />
                <span>Identificar CPF/CNPJ</span>
              </label>
            </div>

            {!identificarConsumidor ? (
              <div className="bg-slate-50 border border-dashed border-slate-300 rounded-lg p-4 text-center text-xs text-slate-600">
                <span>👤 <strong>Consumidor Não Identificado</strong> (Padrão Varejo)</span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">Cliente cadastrado:</span>
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
                    <label className="block font-medium text-slate-600 mb-1">CPF ou CNPJ</label>
                    <input
                      type="text"
                      value={consumidorDoc}
                      onChange={(e) => setConsumidorDoc(e.target.value)}
                      className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                      placeholder="000.000.000-00"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-medium text-slate-600 mb-1">Nome do Consumidor</label>
                    <input
                      type="text"
                      value={consumidorNome}
                      onChange={(e) => setConsumidorNome(e.target.value)}
                      className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                      placeholder="Nome do cliente"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* BLOCO 2: Produtos */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <Package className={`w-4 h-4 ${corText}`} />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  2. Produtos ({itens.length})
                </h3>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                <input
                  type="text"
                  value={buscaProduto}
                  onChange={(e) => setBuscaProduto(e.target.value)}
                  placeholder="Buscar produto..."
                  className={`text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 ${corFocus} w-56`}
                />
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
              <div className="p-6 border-2 border-dashed border-slate-200 rounded-lg text-center bg-slate-50/70">
                <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">Cupom Fiscal em Branco</p>
                <p className="text-[11px] text-slate-500">Pesquise um produto acima para adicionar</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                {itens.map((item, idx) => (
                  <div key={item.id} className="p-3 bg-white hover:bg-slate-50 flex items-center justify-between gap-3 text-xs">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-semibold">
                          #{idx + 1}
                        </span>
                        <span className="font-bold text-slate-900 truncate">{item.descricao}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        NCM {item.ncm} • ICMS {item.aliquotaICMS}% • Unit: {formatarMoeda(item.valorUnitario)}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden">
                        <button
                          type="button"
                          onClick={() => handleUpdateItemQtd(item.id, item.quantidade - 1)}
                          className="px-2 py-1 text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-2 py-1 font-semibold text-slate-900 min-w-[28px] text-center">
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

                      <div className="text-right min-w-[80px]">
                        <div className="font-bold text-slate-900">{formatarMoeda(item.valorTotalBruto)}</div>
                        <div className="text-[10px] text-slate-400">Total</div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* COLUNA DIREITA (1/3) */}
        <div className="space-y-4">
          
          {/* BLOCO 3: Fechamento */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <Receipt className={`w-4 h-4 ${corText}`} />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">3. Fechamento</h3>
              </div>
              <DollarSign className={`w-4 h-4 ${corText}`} />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1.5">Forma de Pagamento</label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: '17', label: '⚡ PIX' },
                  { id: '03', label: '💳 Crédito' },
                  { id: '04', label: '💳 Débito' },
                  { id: '01', label: '💵 Dinheiro' },
                ].map(forma => (
                  <button
                    key={forma.id}
                    type="button"
                    onClick={() => setFormaPagamento(forma.id as any)}
                    className={`text-xs p-2 rounded-lg border font-medium transition-colors text-left cursor-pointer ${
                      formaPagamento === forma.id
                        ? `${corBg} border-${cor}-500 ${corText} font-bold shadow-sm`
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {forma.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Desconto (R$)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={valorDesconto || ''}
                onChange={(e) => setValorDesconto(parseFloat(e.target.value) || 0)}
                className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                placeholder="0,00"
              />
            </div>

            {formaPagamento === '01' && (
              <div className={`${corBg} border ${corBorder} rounded-lg p-3 space-y-2 text-xs mt-2`}>
                <div>
                  <label className={`block text-[11px] font-bold ${corTextDark} mb-1`}>Valor Recebido (R$)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={valorRecebido || ''}
                    onChange={(e) => setValorRecebido(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="0,00"
                  />
                </div>
                {valorRecebido > valorTotalFinal && (
                  <div className="flex items-center justify-between font-bold pt-1 border-t border-purple-200">
                    <span className="text-purple-700">Troco:</span>
                    <span className="text-emerald-700">{formatarMoeda(troco)}</span>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs mt-3">
              <div className="flex items-center justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold">{formatarMoeda(totais.valorTotalProdutos)}</span>
              </div>
              {valorDesconto > 0 && (
                <div className="flex items-center justify-between text-rose-600">
                  <span>Desconto:</span>
                  <span>-{formatarMoeda(valorDesconto)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>Tributos Aprox.:</span>
                <span>{formatarMoeda(totais.valorTotalTributosAproximados)}</span>
              </div>
            </div>

            {/* 🔥 TOTAL DESTAQUE */}
            <div className={`mt-3 p-3 bg-gradient-to-r ${corGradient} text-white rounded-lg`}>
              <span className="text-[10px] text-purple-100 uppercase block font-medium">Total a Pagar</span>
              <span className="text-xl font-bold text-white">{formatarMoeda(valorTotalFinal)}</span>
            </div>

            {/* 🔥 BOTÃO TRANSMITIR */}
            <button
              type="button"
              onClick={handleTransmitirNfce}
              disabled={isTransmitting || itens.length === 0}
              id="btn-emitir-nfce"
              className={`w-full mt-3 ${corBgButton} disabled:bg-slate-300 text-white font-semibold text-xs py-2.5 px-3 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50`}
            >
              {isTransmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Transmitindo...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>EMITIR & AUTORIZAR NFC-e</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};