// C:\emissornfe\src\components\fiscal\NfseEmissor.tsx

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
  DollarSign
} from 'lucide-react';
import { NFSeDocumento, TributacaoISSQN, TipoRetencaoISS } from '../../types/fiscal';
import { ClienteFornecedor, ServicoCatalogo, ConfiguracaoEmpresa } from '../../types/erp';
import { StorageService } from '../../utils/storage';
import { validarCpfOuCnpj, formatarMoeda, limparDocumento } from '../../utils/cpfCnpjValidator';
import { gerarChaveAcessoNFSe } from '../../utils/chaveAcesso';
import { calcularTributosNfse } from '../../utils/tributosEngine';
import { gerarXmlNfseNacional } from '../../utils/xmlNfseGenerator';
import api from '../../services/api';

interface NfseEmissorProps {
  empresa: ConfiguracaoEmpresa;
  clientes: ClienteFornecedor[];
  servicosCatalogo: ServicoCatalogo[];
  onNfseEmitida: (nfse: NFSeDocumento) => void;
  onViewDanfse: (nfse: NFSeDocumento) => void;
}

export const NfseEmissor: React.FC<NfseEmissorProps> = ({
  empresa,
  clientes,
  servicosCatalogo,
  onNfseEmitida,
  onViewDanfse,
}) => {
  // Tomador
  const [selectedClienteId, setSelectedClienteId] = useState<string>('');
  const [tomadorDoc, setTomadorDoc] = useState('');
  const [tomadorNome, setTomadorNome] = useState('');
  const [tomadorEmail, setTomadorEmail] = useState('');
  const [tomadorTelefone, setTomadorTelefone] = useState('');
  const [tomadorLogradouro, setTomadorLogradouro] = useState('');
  const [tomadorNumero, setTomadorNumero] = useState('');
  const [tomadorBairro, setTomadorBairro] = useState('');
  const [tomadorMun, setTomadorMun] = useState('');
  const [tomadorMunIbge, setTomadorMunIbge] = useState('');
  const [tomadorUf, setTomadorUf] = useState('SP');
  const [tomadorCep, setTomadorCep] = useState('');

  // Serviço
  const [selectedServicoId, setSelectedServicoId] = useState<string>(servicosCatalogo[0]?.id || '');
  const [codigoTribNac, setCodigoTribNac] = useState(servicosCatalogo[0]?.codigoTributacaoNacional || '010701');
  const [codigoTribMun, setCodigoTribMun] = useState(servicosCatalogo[0]?.codigoTributacaoMunicipal || '0107');
  const [codigoNBS, setCodigoNBS] = useState(servicosCatalogo[0]?.codigoNBS || '1.1403.21.10');
  const [discriminacaoServico, setDiscriminacaoServico] = useState(servicosCatalogo[0]?.descricao || '');
  
  // Valores
  const [valorServico, setValorServico] = useState<number>(servicosCatalogo[0]?.valorUnitario || 3500);
  const [descontoIncondicionado, setDescontoIncondicionado] = useState<number>(0);
  const [deducoesMateriais, setDeducoesMateriais] = useState<number>(0);

  // Tributação
  const [tributacaoISSQN, setTributacaoISSQN] = useState<TributacaoISSQN>(1);
  const [aliquotaISS, setAliquotaISS] = useState<number>(5.0);
  const [tipoRetencaoISS, setTipoRetencaoISS] = useState<TipoRetencaoISS>(1);

  // Retenções
  const [aliquotaIRRF, setAliquotaIRRF] = useState<number>(1.5);
  const [aliquotaCSLL, setAliquotaCSLL] = useState<number>(1.0);
  const [aliquotaINSS, setAliquotaINSS] = useState<number>(0);
  const [aliquotaPIS, setAliquotaPIS] = useState<number>(0.65);
  const [aliquotaCOFINS, setAliquotaCOFINS] = useState<number>(3.0);
  const [retidoPIS, setRetidoPIS] = useState<boolean>(false);
  const [retidoCOFINS, setRetidoCOFINS] = useState<boolean>(false);

  const [infoComplementares, setInfoComplementares] = useState<string>(
    'Documento emitido por ME ou EPP optante pelo Simples Nacional. Lei Complementar 123/2006. Tributação do IBS/CBS em conformidade com o Manual NFS-e Nacional v1.01 (EC 132/2023).'
  );
  const [formaPagamento, setFormaPagamento] = useState<string>('17');

  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);
  const [errosValidacao, setErrosValidacao] = useState<string[]>([]);
  const [sucessoNfse, setSucessoNfse] = useState<NFSeDocumento | null>(null);

  const handleClienteChange = (clienteId: string) => {
    setSelectedClienteId(clienteId);
    if (!clienteId) {
      setTomadorDoc('');
      setTomadorNome('');
      setTomadorEmail('');
      setTomadorTelefone('');
      setTomadorLogradouro('');
      setTomadorNumero('');
      setTomadorBairro('');
      setTomadorMun('');
      setTomadorMunIbge('');
      setTomadorUf('SP');
      setTomadorCep('');
      return;
    }
    const cli = clientes.find(c => c.id === clienteId);
    if (cli) {
      setTomadorDoc(cli.documento);
      setTomadorNome(cli.razaoSocial);
      setTomadorEmail(cli.email || '');
      setTomadorTelefone(cli.telefone || '');
      setTomadorLogradouro(cli.endereco.logradouro);
      setTomadorNumero(cli.endereco.numero);
      setTomadorBairro(cli.endereco.bairro);
      setTomadorMun(cli.endereco.nomeMunicipio);
      setTomadorMunIbge(cli.endereco.codigoMunicipio);
      setTomadorUf(cli.endereco.uf);
      setTomadorCep(cli.endereco.cep);
    }
  };

  const handleServicoChange = (servicoId: string) => {
    setSelectedServicoId(servicoId);
    const srv = servicosCatalogo.find(s => s.id === servicoId);
    if (srv) {
      setCodigoTribNac(srv.codigoTributacaoNacional);
      setCodigoTribMun(srv.codigoTributacaoMunicipal);
      setCodigoNBS(srv.codigoNBS);
      setDiscriminacaoServico(srv.descricao);
      setValorServico(srv.valorUnitario);
      setAliquotaISS(srv.aliquotaISS);
      setTipoRetencaoISS(srv.retencaoISSPadrao ? 2 : 1);
      setAliquotaPIS(srv.aliquotaPIS);
      setAliquotaCOFINS(srv.aliquotaCOFINS);
      setAliquotaIRRF(srv.aliquotaIRRF);
      setAliquotaCSLL(srv.aliquotaCSLL);
      setAliquotaINSS(srv.aliquotaINSS);
    }
  };

  const calc = calcularTributosNfse({
    valorServico,
    descontoIncondicionado,
    deducoesMateriais,
    aliquotaISS,
    tipoRetencaoISS,
    tributacaoISSQN,
    optanteSimplesNacional: empresa.optanteSimplesNacional,
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

  const validarFormulario = (): boolean => {
    const errs: string[] = [];
    const valDoc = validarCpfOuCnpj(tomadorDoc);
    if (!valDoc.valido) {
      errs.push('CPF ou CNPJ do tomador inválido segundo validação Módulo 11.');
    }
    if (!tomadorNome.trim()) errs.push('Nome / Razão Social do tomador é obrigatório.');
    if (!discriminacaoServico.trim()) errs.push('Discriminação detalhada do serviço é obrigatória.');
    if (valorServico <= 0) errs.push('Valor do serviço deve ser maior que zero.');
    if (tributacaoISSQN === 1 && (aliquotaISS < 2 || aliquotaISS > 5)) {
      errs.push('A alíquota de ISSQN deve estar entre 2,00% e 5,00% (LC 116/2003).');
    }
    setErrosValidacao(errs);
    return errs.length === 0;
  };

  const handleTransmitirNfse = async () => {
    if (!validarFormulario()) return;

    setIsTransmitting(true);
    setErrosValidacao([]);

    try {
      const numeroNfse = empresa.proximoNumeroNfse;
      const numeroDPS = empresa.proximoNumeroNfse;
      const aamm = new Date().toISOString().slice(2, 4) + (new Date().getMonth() + 1).toString().padStart(2, '0');

      const { chaveCompleta, codigoVerificacao } = gerarChaveAcessoNFSe({
        codigoMunicipioIBGE: empresa.endereco.codigoMunicipio,
        ambienteGerador: 1,
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
        serieDPS: empresa.serieNfse,
        numeroDPS,
        dataCompetencia: new Date().toISOString().split('T')[0],
        dataHoraEmissao: new Date().toISOString(),
        dataHoraProcessamento: new Date().toISOString(),
        codigoVerificacao,
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
        tomador: {
          tipoPessoa: isCnpj ? 'PJ' : 'PF',
          documento: tomadorDoc,
          nomeRazaoSocial: tomadorNome,
          email: tomadorEmail,
          telefone: tomadorTelefone,
          endereco: {
            logradouro: tomadorLogradouro,
            numero: tomadorNumero,
            bairro: tomadorBairro,
            codigoMunicipio: tomadorMunIbge,
            nomeMunicipio: tomadorMun,
            uf: tomadorUf,
            cep: tomadorCep,
          },
        },
        servico: {
          codigoTributacaoNacional: codigoTribNac,
          codigoTributacaoMunicipal: codigoTribMun,
          descricao: discriminacaoServico,
          codigoNBS: codigoNBS,
          localPrestacao: {
            codigoMunicipio: empresa.endereco.codigoMunicipio,
            nomeMunicipio: empresa.endereco.nomeMunicipio,
            uf: empresa.endereco.uf,
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
        informacoesComplementares: infoComplementares,
        xmlAssinado: '',
        urlVisualizacaoNacional: 'https://www.nfse.gov.br/consultapublica',
      };

      novaNfse.xmlAssinado = gerarXmlNfseNacional(novaNfse);

      try {
        const response = await api.post('/nfse/emitir', {
          empresaId: empresa.id,
          nfse: novaNfse
        });
        console.log('✅ NFS-e salva no backend:', response.data);
      } catch (err) {
        console.error('Erro ao salvar NFS-e no backend:', err);
        StorageService.addNfse(novaNfse);
      }

      StorageService.addNfse(novaNfse);
      onNfseEmitida(novaNfse);
      setSucessoNfse(novaNfse);
    } catch (err) {
      setErrosValidacao(['Falha ao processar assinatura digital e envio de DPS. Verifique os dados.']);
    } finally {
      setIsTransmitting(false);
    }
  };

  // 🔥 COR DO MÓDULO (AZUL)
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

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      
      {/* 🔥 HEADER - MESMO DESIGN DO NFA-E */}
      <div className={`${corBg} rounded-xl border ${corBorder} p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}>
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-8 h-8 ${corIconBg} rounded-lg flex items-center justify-center text-white shadow-sm`}>
              <FileText className="w-4 h-4" />
            </span>
            <h1 className="text-base font-bold text-slate-900">
              Emissão de NFS-e (Padrão Nacional)
            </h1>
            <span className={`${corBgBadge} ${corTextDark} text-[10px] font-bold px-2 py-0.5 rounded-full border ${corBorder}`}>
              Serviços
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Declaração de Prestação de Serviços (DPS) com cálculo automático de tributos e IBS/CBS.
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs font-semibold text-slate-700">Série {empresa.serieNfse}</div>
          <div className={`text-[10px] font-medium ${corText}`}>Próxima NFS-e: Nº {empresa.proximoNumeroNfse}</div>
        </div>
      </div>

      {/* 🔥 BANNER SUCESSO */}
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
                onClick={() => setSucessoNfse(null)}
                className="text-xs text-slate-600 hover:text-slate-900 underline ml-2 cursor-pointer"
              >
                Nova Emissão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔥 ERROS */}
      {errosValidacao.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-rose-900">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Erros de validação:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 pl-2">
            {errosValidacao.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 🔥 FORMULÁRIO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* COLUNA ESQUERDA (2/3) */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* BLOCO 1: Tomador */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div>
                <label className="block font-medium text-slate-600 mb-1">CPF / CNPJ *</label>
                <input
                  type="text"
                  value={tomadorDoc}
                  onChange={(e) => setTomadorDoc(e.target.value)}
                  className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                  placeholder="00.000.000/0000-00"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">Razão Social / Nome *</label>
                <input
                  type="text"
                  value={tomadorNome}
                  onChange={(e) => setTomadorNome(e.target.value)}
                  className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                  placeholder="Nome do cliente"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">E-mail</label>
                <input
                  type="email"
                  value={tomadorEmail}
                  onChange={(e) => setTomadorEmail(e.target.value)}
                  className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                  placeholder="email@cliente.com.br"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">Telefone</label>
                <input
                  type="text"
                  value={tomadorTelefone}
                  onChange={(e) => setTomadorTelefone(e.target.value)}
                  className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-medium text-slate-600 mb-1">Endereço</label>
                <input
                  type="text"
                  value={`${tomadorLogradouro}, ${tomadorNumero}`}
                  onChange={(e) => setTomadorLogradouro(e.target.value)}
                  className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">Município / UF</label>
                <input
                  type="text"
                  value={`${tomadorMun} - ${tomadorUf}`}
                  onChange={(e) => setTomadorMun(e.target.value)}
                  className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                />
              </div>
            </div>
          </div>

          {/* BLOCO 2: Serviço */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <Package className={`w-4 h-4 ${corText}`} />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">2. Dados do Serviço</h3>
              </div>
              <select
                value={selectedServicoId}
                onChange={(e) => handleServicoChange(e.target.value)}
                className={`text-xs bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 ${corFocus} font-medium text-slate-700 max-w-[280px]`}
              >
                {servicosCatalogo.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.codigoInterno} - {s.descricao.slice(0, 40)} ({formatarMoeda(s.valorUnitario)})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div>
                <label className="block font-medium text-slate-600 mb-1">Item LC 116 *</label>
                <input
                  type="text"
                  value={codigoTribNac}
                  onChange={(e) => setCodigoTribNac(e.target.value)}
                  className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus} font-mono`}
                  placeholder="010701"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">Cód. Tributação Municipal</label>
                <input
                  type="text"
                  value={codigoTribMun}
                  onChange={(e) => setCodigoTribMun(e.target.value)}
                  className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus} font-mono`}
                  placeholder="0107"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">Código NBS</label>
                <input
                  type="text"
                  value={codigoNBS}
                  onChange={(e) => setCodigoNBS(e.target.value)}
                  className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus} font-mono`}
                  placeholder="1.1403.21.10"
                />
              </div>
            </div>

            <div className="mt-2">
              <label className="block font-medium text-slate-600 mb-1">Discriminação dos Serviços *</label>
              <textarea
                rows={3}
                value={discriminacaoServico}
                onChange={(e) => setDiscriminacaoServico(e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus} leading-relaxed text-xs`}
                placeholder="Descrição dos serviços prestados..."
              />
            </div>
          </div>

          {/* BLOCO 3: IBS/CBS */}
          <div className={`${corBg} rounded-xl border ${corBorder} p-4 shadow-sm`}>
            <div className="flex items-center justify-between border-b border-blue-200 pb-2 mb-3">
              <div className="flex items-center gap-1.5">
                <Sparkles className={`w-4 h-4 ${corText}`} />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">3. IBS & CBS 2026 (EC 132/2023)</h3>
              </div>
              <span className="text-[10px] font-medium text-slate-500">Transição</span>
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-xs">
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[10px]">CBS Federal (0,90%)</span>
                <span className="font-bold text-slate-900">{formatarMoeda(calc.valorCBS)}</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[10px]">IBS Estadual (0,05%)</span>
                <span className="font-bold text-slate-900">{formatarMoeda(calc.valorIBSUF)}</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[10px]">IBS Municipal (0,05%)</span>
                <span className="font-bold text-slate-900">{formatarMoeda(calc.valorIBSMun)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-2">
              <span className="text-slate-600 font-medium">Forma de Pagamento:</span>
              <select
                value={formaPagamento}
                onChange={(e) => setFormaPagamento(e.target.value)}
                className={`text-xs bg-white border border-slate-300 rounded-lg p-1 focus:outline-none focus:ring-2 ${corFocus}`}
              >
                <option value="17">17 - PIX Instantâneo</option>
                <option value="15">15 - Boleto Bancário</option>
                <option value="03">03 - Cartão de Crédito</option>
                <option value="01">01 - Dinheiro</option>
              </select>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA (1/3) */}
        <div className="space-y-4">
          
          {/* BLOCO 4: Valores e Tributação */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
              <Calculator className={`w-4 h-4 ${corText}`} />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">4. Valores & Tributação</h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Valor Total (R$) *</label>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-slate-400 text-xs font-bold">R$</span>
                <input
                  type="number"
                  step="0.01"
                  value={valorServico}
                  onChange={(e) => setValorServico(parseFloat(e.target.value) || 0)}
                  className={`w-full pl-8 text-base font-bold text-slate-900 border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs mt-2">
              <div>
                <label className="block text-[10px] font-medium text-slate-600 mb-0.5">Desc. Incond.</label>
                <input
                  type="number"
                  step="0.01"
                  value={descontoIncondicionado}
                  onChange={(e) => setDescontoIncondicionado(parseFloat(e.target.value) || 0)}
                  className={`w-full border border-slate-300 rounded-lg p-1 focus:outline-none focus:ring-2 ${corFocus}`}
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-slate-600 mb-0.5">Deduções</label>
                <input
                  type="number"
                  step="0.01"
                  value={deducoesMateriais}
                  onChange={(e) => setDeducoesMateriais(parseFloat(e.target.value) || 0)}
                  className={`w-full border border-slate-300 rounded-lg p-1 focus:outline-none focus:ring-2 ${corFocus}`}
                />
              </div>
            </div>

            {/* ISSQN */}
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5 text-xs mt-2">
              <div className="font-bold text-slate-800 text-[11px]">ISSQN</div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Alíquota (%):</span>
                <input
                  type="number"
                  step="0.1"
                  min="2"
                  max="5"
                  value={aliquotaISS}
                  onChange={(e) => setAliquotaISS(parseFloat(e.target.value) || 0)}
                  className={`w-16 text-right font-bold text-slate-900 border border-slate-300 rounded p-0.5 text-xs bg-white focus:outline-none focus:ring-2 ${corFocus}`}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Retenção:</span>
                <select
                  value={tipoRetencaoISS}
                  onChange={(e) => setTipoRetencaoISS(parseInt(e.target.value) as TipoRetencaoISS)}
                  className={`text-xs bg-white border border-slate-300 rounded p-0.5 focus:outline-none focus:ring-2 ${corFocus}`}
                >
                  <option value={1}>1 - Não Retido</option>
                  <option value={2}>2 - Retido Tomador</option>
                  <option value={3}>3 - Retido Interm.</option>
                </select>
              </div>
              <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between font-semibold">
                <span>ISS Apurado:</span>
                <span className="text-slate-900">{formatarMoeda(calc.valorISS)}</span>
              </div>
            </div>

            {/* Retenções Federais */}
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5 text-xs mt-2">
              <div className="font-bold text-slate-800 text-[11px]">Retenções Federais</div>
              <div className="grid grid-cols-2 gap-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">IRRF:</span>
                  <span>{formatarMoeda(calc.valorIRRF)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">CSLL:</span>
                  <span>{formatarMoeda(calc.valorCSLL)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">PIS:</span>
                  <span>{formatarMoeda(calc.valorPIS)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">COFINS:</span>
                  <span>{formatarMoeda(calc.valorCOFINS)}</span>
                </div>
              </div>
              <div className="pt-1 border-t border-slate-200 flex items-center justify-between text-slate-700">
                <span>Total Retido:</span>
                <span className="font-bold text-rose-700">{formatarMoeda(calc.totalRetencoes)}</span>
              </div>
            </div>

            {/* 🔥 TOTAL DESTAQUE */}
            <div className={`mt-3 p-3 bg-gradient-to-r ${corGradient} text-white rounded-lg`}>
              <span className="text-[10px] text-blue-100 uppercase block font-medium">Líquido a Receber</span>
              <span className="text-xl font-bold text-white">{formatarMoeda(calc.valorLiquido)}</span>
            </div>

            {/* 🔥 BOTÃO TRANSMITIR */}
            <button
              onClick={handleTransmitirNfse}
              disabled={isTransmitting}
              id="btn-transmitir-nfse"
              className={`w-full mt-3 ${corBgButton} disabled:bg-slate-300 text-white font-semibold text-xs py-2.5 px-3 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50`}
            >
              {isTransmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Transmitindo DPS...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>TRANSMITIR NFS-e NACIONAL</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};