// C:\emissornfe\src\components\fiscal\NfaeEmissor.tsx

import React, { useState } from 'react';
import { 
  FileBadge2, 
  Plus, 
  Trash2, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  Download, 
  Zap, 
  DollarSign, 
  Package,
  RefreshCw,
  User,
  FileText,
  Gauge
} from 'lucide-react';
import { NFAeDocumento, ItemNfe } from '../../types/fiscal';
import { Produto, ClienteFornecedor, ConfiguracaoEmpresa } from '../../types/erp';
import { StorageService } from '../../utils/storage';
import { formatarMoeda, validarCpfOuCnpj, limparDocumento } from '../../utils/cpfCnpjValidator';
import { gerarChaveAcessoNFe } from '../../utils/chaveAcesso';
import { calcularTotaisNfe } from '../../utils/tributosEngine';

interface NfaeEmissorProps {
  empresa: ConfiguracaoEmpresa;
  clientes: ClienteFornecedor[];
  produtos: Produto[];
  onNfaeEmitida: (nfae: NFAeDocumento) => void;
  onViewDanfae: (nfae: NFAeDocumento) => void;
}

export const NfaeEmissor: React.FC<NfaeEmissorProps> = ({
  empresa,
  clientes,
  produtos,
  onNfaeEmitida,
  onViewDanfae,
}) => {
  // Consumidor
  const [selectedClienteId, setSelectedClienteId] = useState<string>('');
  const [consumidorDoc, setConsumidorDoc] = useState('');
  const [consumidorNome, setConsumidorNome] = useState('');
  const [consumidorIE, setConsumidorIE] = useState('');
  const [consumidorEmail, setConsumidorEmail] = useState('');
  const [consumidorLogradouro, setConsumidorLogradouro] = useState('');
  const [consumidorNumero, setConsumidorNumero] = useState('');
  const [consumidorBairro, setConsumidorBairro] = useState('');
  const [consumidorMun, setConsumidorMun] = useState('');
  const [consumidorMunIbge, setConsumidorMunIbge] = useState('');
  const [consumidorUf, setConsumidorUf] = useState('SP');
  const [consumidorCep, setConsumidorCep] = useState('');

  // Dados da NFA-e
  const [naturezaOperacao, setNaturezaOperacao] = useState('Fornecimento de Energia Elétrica');
  const [formaPagamento, setFormaPagamento] = useState<'01' | '02' | '03' | '04' | '15' | '17' | '90' | '99'>('17');

  // Dados de Energia
  const [leituraAnterior, setLeituraAnterior] = useState<number>(1250);
  const [leituraAtual, setLeituraAtual] = useState<number>(1420);
  const [valorKwh, setValorKwh] = useState<number>(0.95);
  const [bandeiraTarifaria, setBandeiraTarifaria] = useState<'VERDE' | 'AMARELA' | 'VERMELHA_1' | 'VERMELHA_2'>('VERDE');
  const [valorAdicionalBandeira, setValorAdicionalBandeira] = useState<number>(0);
  const [numeroMedidor, setNumeroMedidor] = useState('MED-2024-001');
  const [tipoConexao, setTipoConexao] = useState<'MONOFASICO' | 'BIFASICO' | 'TRIFASICO'>('TRIFASICO');

  // Grade de Itens (serviços/taxas)
  const [itens, setItens] = useState<ItemNfe[]>([]);

  // Estados
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);
  const [erros, setErros] = useState<string[]>([]);
  const [nfaeEmitidaSucesso, setNfaeEmitidaSucesso] = useState<NFAeDocumento | null>(null);

  // 🔥 COR DO MÓDULO (ÂMBAR/LARANJA)
  const cor = 'amber';
  const corBg = 'bg-amber-50';
  const corBorder = 'border-amber-200';
  const corText = 'text-amber-700';
  const corTextDark = 'text-amber-800';
  const corBgButton = 'bg-amber-600 hover:bg-amber-700';
  const corBgBadge = 'bg-amber-100';
  const corFocus = 'focus:ring-amber-500';
  const corIconBg = 'bg-amber-600';
  const corGradient = 'from-amber-600 to-amber-700';

  // Cálculo do consumo
  const consumoCalculado = leituraAtual - leituraAnterior;
  const valorEnergia = consumoCalculado * valorKwh;
  const totalServicos = itens.reduce((acc, item) => acc + item.valorTotalBruto, 0);
  const valorTotalNota = valorEnergia + valorAdicionalBandeira + totalServicos;

  const handleSelectCliente = (clienteId: string) => {
    setSelectedClienteId(clienteId);
    if (!clienteId) {
      setConsumidorDoc('');
      setConsumidorNome('');
      setConsumidorIE('');
      setConsumidorEmail('');
      setConsumidorLogradouro('');
      setConsumidorNumero('');
      setConsumidorBairro('');
      setConsumidorMun('');
      setConsumidorMunIbge('');
      setConsumidorUf('SP');
      setConsumidorCep('');
      return;
    }
    const cli = clientes.find(c => c.id === clienteId);
    if (cli) {
      setConsumidorDoc(cli.documento);
      setConsumidorNome(cli.razaoSocial);
      setConsumidorIE(cli.inscricaoEstadual || '');
      setConsumidorEmail(cli.email || '');
      setConsumidorLogradouro(cli.endereco.logradouro);
      setConsumidorNumero(cli.endereco.numero);
      setConsumidorBairro(cli.endereco.bairro);
      setConsumidorMun(cli.endereco.nomeMunicipio);
      setConsumidorMunIbge(cli.endereco.codigoMunicipio);
      setConsumidorUf(cli.endereco.uf);
      setConsumidorCep(cli.endereco.cep);
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
      cfop: '5405',
      unidadeMedida: 'UN',
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
      valorTributosAproximados: prod.precoVenda * 0.25,
    };

    setItens(prev => [...prev, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    setItens(prev => prev.filter((_, i) => i !== index));
  };

  const handleTransmitirNfae = () => {
    const errs: string[] = [];
    const valDoc = validarCpfOuCnpj(consumidorDoc);
    if (!valDoc.valido) errs.push('CPF / CNPJ do consumidor inválido.');
    if (!consumidorNome.trim()) errs.push('Razão Social do consumidor é obrigatória.');
    if (consumoCalculado <= 0) errs.push('Consumo de energia deve ser maior que zero.');

    if (errs.length > 0) {
      setErros(errs);
      return;
    }

    setIsTransmitting(true);
    setErros([]);

    setTimeout(() => {
      try {
        const numero = empresa.proximoNumeroNfae || 1;
        const aamm = new Date().toISOString().slice(2, 4) + (new Date().getMonth() + 1).toString().padStart(2, '0');

        const { chaveCompleta } = gerarChaveAcessoNFe({
          codigoUf: empresa.endereco.codigoMunicipio.slice(0, 2) || '35',
          anoMes: aamm,
          cnpjEmitente: empresa.cnpj,
          modelo: '63',
          serie: empresa.serieNfae || 1,
          numero,
          tipoEmissao: 1,
        });

        const docDestLimpo = limparDocumento(consumidorDoc);
        const isCnpj = docDestLimpo.length === 14;

        const novaNfae: NFAeDocumento = {
          id: `nfae-${Date.now()}`,
          modelo: '63',
          serie: empresa.serieNfae || 1,
          numero,
          chaveAcesso: chaveCompleta,
          dataHoraEmissao: new Date().toISOString(),
          naturezaOperacao,
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
          destinatario: {
            tipoPessoa: isCnpj ? 'PJ' : 'PF',
            documento: consumidorDoc,
            nomeRazaoSocial: consumidorNome,
            inscricaoEstadual: consumidorIE || 'ISENTO',
            email: consumidorEmail,
            endereco: {
              logradouro: consumidorLogradouro,
              numero: consumidorNumero,
              bairro: consumidorBairro,
              codigoMunicipio: consumidorMunIbge,
              nomeMunicipio: consumidorMun,
              uf: consumidorUf,
              cep: consumidorCep,
            },
          },
          dadosEnergia: {
            leituraAnterior,
            leituraAtual,
            consumoKwh: consumoCalculado,
            valorKwh,
            valorTotalEnergia: valorEnergia,
            bandeiraTarifaria,
            valorAdicionalBandeira,
            numeroMedidor,
            tipoConexao,
          },
          itens,
          valorTotalEnergia: valorEnergia,
          valorTotalBandeira: valorAdicionalBandeira,
          valorTotalServicos: totalServicos,
          valorTotalNota,
          formaPagamento,
          protocoloAutorizacao: `13526000${Math.floor(1000000 + Math.random() * 9000000)}`,
          dataHoraAutorizacao: new Date().toISOString(),
          informacoesAdicionais: 'NFA-e emitida para fornecimento de energia elétrica - SUP TECNOLOGIA ERP.',
          xmlAssinado: `<nfeProc versao="4.00"><NFe><infNFe Id="NFe${chaveCompleta}" versao="4.00"><ide><cUF>35</cUF><mod>63</mod><nNF>${numero}</nNF></ide></infNFe></NFe></nfeProc>`,
        };

        StorageService.addNfae(novaNfae);
        onNfaeEmitida(novaNfae);
        setNfaeEmitidaSucesso(novaNfae);
      } catch (e) {
        setErros(['Falha ao autorizar NFA-e junto ao webservice da SEFAZ.']);
      } finally {
        setIsTransmitting(false);
      }
    }, 1200);
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      
      {/* Header NFA-e */}
      <div className={`bg-white rounded-xl border ${corBorder} p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`} style={{ backgroundColor: '#fffbeb' }}>
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-8 h-8 ${corIconBg} rounded-lg flex items-center justify-center text-white shadow-sm`}>
              <FileBadge2 className="w-4 h-4" />
            </span>
            <h1 className="text-base font-bold text-slate-900">
              Emissão de NFA-e (Modelo 63)
            </h1>
            <span className={`${corBgBadge} text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border ${corBorder}`}>
              Energia Elétrica
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Emissão de Nota Fiscal de Energia Elétrica Avulsa com dados de consumo e bandeira tarifária.
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs font-semibold text-slate-700">Série {empresa.serieNfae || 1}</div>
          <div className="text-[10px] text-amber-600 font-medium">Próxima NFA-e: Nº {empresa.proximoNumeroNfae || 1}</div>
        </div>
      </div>

      {/* Banner Sucesso */}
      {nfaeEmitidaSucesso && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 shadow-sm animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-amber-900">
                  NFA-e Nº {nfaeEmitidaSucesso.numero} Autorizada!
                </h3>
                <p className="text-xs text-amber-800 font-mono mt-0.5">
                  Chave: {nfaeEmitidaSucesso.chaveAcesso}
                </p>
                <div className="text-[11px] text-amber-700 mt-1">
                  Consumidor: {nfaeEmitidaSucesso.destinatario.nomeRazaoSocial} • Total: {formatarMoeda(nfaeEmitidaSucesso.valorTotalNota)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onViewDanfae(nfaeEmitidaSucesso)}
                className="bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Visualizar DANFAE</span>
              </button>

              <button
                onClick={() => {
                  const blob = new Blob([nfaeEmitidaSucesso.xmlAssinado], { type: 'application/xml' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `NFAe_${nfaeEmitidaSucesso.numero}_SUP.xml`;
                  a.click();
                }}
                className="bg-white hover:bg-slate-100 text-slate-700 font-medium text-xs px-3 py-2 rounded-lg border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>XML</span>
              </button>

              <button
                onClick={() => {
                  setNfaeEmitidaSucesso(null);
                  setItens([]);
                  setLeituraAnterior(0);
                  setLeituraAtual(0);
                  setValorAdicionalBandeira(0);
                }}
                className="text-xs text-slate-600 hover:text-slate-900 underline ml-2 cursor-pointer"
              >
                Nova NFA-e
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Erros */}
      {erros.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-rose-900">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Pendências na NFA-e:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 pl-2">
            {erros.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Formulário */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Coluna Principal */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Consumidor */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">1. Consumidor</h3>
              </div>
              <select
                value={selectedClienteId}
                onChange={(e) => handleSelectCliente(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-slate-700 max-w-[280px]"
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
                  value={consumidorDoc}
                  onChange={(e) => setConsumidorDoc(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="00.000.000/0000-00"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-medium text-slate-600 mb-1">Razão Social / Nome *</label>
                <input
                  type="text"
                  value={consumidorNome}
                  onChange={(e) => setConsumidorNome(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Razão Social do consumidor"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">Inscrição Estadual</label>
                <input
                  type="text"
                  value={consumidorIE}
                  onChange={(e) => setConsumidorIE(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="ISENTO ou número"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-medium text-slate-600 mb-1">Email</label>
                <input
                  type="email"
                  value={consumidorEmail}
                  onChange={(e) => setConsumidorEmail(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="email@consumidor.com"
                />
              </div>
            </div>
          </div>

          {/* Dados de Energia */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
              <Zap className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">2. Dados de Energia</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div>
                <label className="block font-medium text-slate-600 mb-1">Leitura Anterior (kWh)</label>
                <input
                  type="number"
                  value={leituraAnterior}
                  onChange={(e) => setLeituraAnterior(parseFloat(e.target.value) || 0)}
                  className="w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">Leitura Atual (kWh)</label>
                <input
                  type="number"
                  value={leituraAtual}
                  onChange={(e) => setLeituraAtual(parseFloat(e.target.value) || 0)}
                  className="w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">Valor kWh (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={valorKwh}
                  onChange={(e) => setValorKwh(parseFloat(e.target.value) || 0)}
                  className="w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">Consumo (kWh)</label>
                <div className="w-full bg-amber-50 border border-amber-200 rounded-lg p-1.5 font-bold text-amber-900">
                  {consumoCalculado.toFixed(1)}
                </div>
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">Bandeira Tarifária</label>
                <select
                  value={bandeiraTarifaria}
                  onChange={(e) => setBandeiraTarifaria(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="VERDE">🟢 Verde</option>
                  <option value="AMARELA">🟡 Amarela</option>
                  <option value="VERMELHA_1">🔴 Vermelha (Nível 1)</option>
                  <option value="VERMELHA_2">🔴 Vermelha (Nível 2)</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">Adicional Bandeira (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={valorAdicionalBandeira}
                  onChange={(e) => setValorAdicionalBandeira(parseFloat(e.target.value) || 0)}
                  className="w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-medium text-slate-600 mb-1">Número do Medidor</label>
                <input
                  type="text"
                  value={numeroMedidor}
                  onChange={(e) => setNumeroMedidor(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Número do medidor"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">Tipo de Conexão</label>
                <select
                  value={tipoConexao}
                  onChange={(e) => setTipoConexao(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="MONOFASICO">Monofásico</option>
                  <option value="BIFASICO">Bifásico</option>
                  <option value="TRIFASICO">Trifásico</option>
                </select>
              </div>
            </div>
          </div>

          {/* Serviços Adicionais */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  3. Serviços Adicionais ({itens.length})
                </h3>
              </div>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddItem(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="text-xs bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg p-1.5 text-amber-900 font-semibold focus:outline-none transition-colors cursor-pointer"
              >
                <option value="">+ Adicionar Serviço</option>
                {produtos && produtos.map(p => (
                  <option key={p.id} value={p.id}>{p.codigo} - {p.descricao.slice(0, 35)} ({formatarMoeda(p.precoVenda)})</option>
                ))}
              </select>
            </div>

            {itens.length === 0 ? (
              <div className="p-6 border-2 border-dashed border-slate-200 rounded-lg text-center bg-slate-50/70">
                <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">Nenhum serviço adicional</p>
                <p className="text-[11px] text-slate-500">Selecione um serviço no botão acima</p>
              </div>
            ) : (
              <div className="space-y-2">
                {itens.map((item, idx) => (
                  <div key={item.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-slate-900 text-xs">{item.descricao}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Cód: {item.codigoProduto} | NCM: {item.ncm} | CFOP: {item.cfop}
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
                        <span className="font-medium block mt-1">{item.quantidade}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">V. Unitário:</span>
                        <span className="font-medium block mt-1">{formatarMoeda(item.valorUnitario)}</span>
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

        {/* Coluna Direita */}
        <div className="space-y-4">
          
          {/* Totais */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">4. Totais</h3>
              </div>
              <FileBadge2 className="w-4 h-4 text-amber-600" />
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Energia:</span>
                <span className="font-semibold text-slate-900">{formatarMoeda(valorEnergia)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Bandeira:</span>
                <span className="font-semibold text-amber-700">{formatarMoeda(valorAdicionalBandeira)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Serviços:</span>
                <span className="font-semibold text-slate-900">{formatarMoeda(totalServicos)}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5 border-t border-slate-100">
                <span>Consumo: {consumoCalculado.toFixed(1)} kWh</span>
                <span>{bandeiraTarifaria}</span>
              </div>
            </div>

            <div className="mt-3 p-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg">
              <span className="text-[10px] text-amber-100 uppercase block font-medium">Total da NFA-e</span>
              <span className="text-xl font-bold text-white">{formatarMoeda(valorTotalNota)}</span>
            </div>

            <button
              onClick={handleTransmitirNfae}
              disabled={isTransmitting}
              id="btn-transmitir-nfae"
              className="w-full mt-3 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 text-white font-semibold text-xs py-2.5 px-3 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isTransmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Transmitindo...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Emitir NFA-e</span>
                </>
              )}
            </button>
          </div>

          {/* Natureza e Pagamento */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
              <FileText className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Natureza</h3>
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <label className="block font-medium text-slate-600 mb-1">Descrição da Operação</label>
                <input
                  type="text"
                  value={naturezaOperacao}
                  onChange={(e) => setNaturezaOperacao(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">Forma de Pagamento</label>
                <select
                  value={formaPagamento}
                  onChange={(e) => setFormaPagamento(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="01">💵 Dinheiro</option>
                  <option value="02">💳 Cartão de Crédito</option>
                  <option value="03">💳 Cartão de Débito</option>
                  <option value="04">💰 Boleto</option>
                  <option value="15">⚡ PIX</option>
                  <option value="17">📱 PIX</option>
                  <option value="90">🔄 Sem Pagamento</option>
                  <option value="99">📝 Outros</option>
                </select>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};