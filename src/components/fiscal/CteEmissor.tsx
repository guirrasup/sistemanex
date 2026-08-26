// C:\emissornfe\src\components\fiscal\CteEmissor.tsx

import React, { useState } from 'react';
import { 
  Truck, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  Download, 
  MapPin, 
  Package, 
  FileText, 
  UserCheck, 
  CreditCard,
  Plus,
  Trash2,
  Navigation,
  Route,
  Weight,
  Box,
  User,
  Building,
  Calculator,
  Receipt,
  Barcode
} from 'lucide-react';
import { CTeDocumento } from '../../types/fiscal';
import { ClienteFornecedor, ConfiguracaoEmpresa } from '../../types/erp';
import { StorageService } from '../../utils/storage';
import { formatarMoeda, formatarCpfCnpj, validarCpfOuCnpj } from '../../utils/cpfCnpjValidator';
import { gerarChaveAcessoNFe } from '../../utils/chaveAcesso';

interface CteEmissorProps {
  empresa: ConfiguracaoEmpresa;
  clientes: ClienteFornecedor[];
  onCteEmitido: (cte: CTeDocumento) => void;
  onViewDacte: (cte: CTeDocumento) => void;
}

export const CteEmissor: React.FC<CteEmissorProps> = ({
  empresa,
  clientes,
  onCteEmitido,
  onViewDacte,
}) => {
  // 1. Remetente
  const [selectedRemetenteId, setSelectedRemetenteId] = useState<string>('');
  const [remetenteDoc, setRemetenteDoc] = useState<string>('');
  const [remetenteNome, setRemetenteNome] = useState<string>('');
  const [remetenteIE, setRemetenteIE] = useState<string>('');
  const [remetenteLogradouro, setRemetenteLogradouro] = useState<string>('');
  const [remetenteNumero, setRemetenteNumero] = useState<string>('');
  const [remetenteBairro, setRemetenteBairro] = useState<string>('');
  const [remetenteMun, setRemetenteMun] = useState<string>('');
  const [remetenteMunIbge, setRemetenteMunIbge] = useState<string>('');
  const [remetenteUf, setRemetenteUf] = useState<string>('SP');
  const [remetenteCep, setRemetenteCep] = useState<string>('');

  // 2. Destinatário
  const [selectedDestinatarioId, setSelectedDestinatarioId] = useState<string>('');
  const [destinatarioDoc, setDestinatarioDoc] = useState<string>('');
  const [destinatarioNome, setDestinatarioNome] = useState<string>('');
  const [destinatarioIE, setDestinatarioIE] = useState<string>('');
  const [destinatarioLogradouro, setDestinatarioLogradouro] = useState<string>('');
  const [destinatarioNumero, setDestinatarioNumero] = useState<string>('');
  const [destinatarioBairro, setDestinatarioBairro] = useState<string>('');
  const [destinatarioMun, setDestinatarioMun] = useState<string>('');
  const [destinatarioMunIbge, setDestinatarioMunIbge] = useState<string>('');
  const [destinatarioUf, setDestinatarioUf] = useState<string>('RJ');
  const [destinatarioCep, setDestinatarioCep] = useState<string>('');

  // 3. Tomador do Serviço
  const [tomadorServico, setTomadorServico] = useState<0 | 1 | 2 | 3 | 4>(0);

  // 4. Percurso
  const [munInicioNome, setMunInicioNome] = useState<string>('São Paulo');
  const [munInicioUf, setMunInicioUf] = useState<string>('SP');
  const [munInicioIbge, setMunInicioIbge] = useState<string>('3550308');
  const [munFimNome, setMunFimNome] = useState<string>('Rio de Janeiro');
  const [munFimUf, setMunFimUf] = useState<string>('RJ');
  const [munFimIbge, setMunFimIbge] = useState<string>('3304557');
  const [naturezaOperacao, setNaturezaOperacao] = useState<string>('Prestação de Serviço de Transporte de Cargas Intermunicipal / Interestadual');
  const [cfop, setCfop] = useState<string>('6353');

  // 5. Carga
  const [produtoPredominante, setProdutoPredominante] = useState<string>('Equipamentos de Tecnologia, Servidores e Peças de TI');
  const [valorCargaAverbada, setValorCargaAverbada] = useState<number>(85000);
  const [pesoBrutoKg, setPesoBrutoKg] = useState<number>(280);
  const [pesoLiquidoKg, setPesoLiquidoKg] = useState<number>(250);
  const [quantidadeVolumes, setQuantidadeVolumes] = useState<number>(6);
  const [especieVolumes, setEspecieVolumes] = useState<string>('Caixas Paletizadas');
  const [chavesNfeTexto, setChavesNfeTexto] = useState<string>('35260818236447000190550010000010411123456784');

  // 6. Veículo e Motorista
  const [placaVeiculo, setPlacaVeiculo] = useState<string>('BRA2E26');
  const [ufVeiculo, setUfVeiculo] = useState<string>('SP');
  const [rntrc, setRntrc] = useState<string>('09847123');
  const [motoristaNome, setMotoristaNome] = useState<string>('Marcos Vinicius de Castro');
  const [motoristaCpf, setMotoristaCpf] = useState<string>('342.981.448-91');

  // 7. Frete
  const [fretePeso, setFretePeso] = useState<number>(1850);
  const [freteValor, setFreteValor] = useState<number>(250);
  const [pedagio, setPedagio] = useState<number>(180);
  const [taxaGris, setTaxaGris] = useState<number>(120);
  const [outrasTaxas, setOutrasTaxas] = useState<number>(0);
  const [aliquotaICMS, setAliquotaICMS] = useState<number>(12.0);

  // Estados
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);
  const [erros, setErros] = useState<string[]>([]);
  const [sucessoCte, setSucessoCte] = useState<CTeDocumento | null>(null);

  const totalFrete = fretePeso + freteValor + pedagio + taxaGris + outrasTaxas;
  const baseCalculoICMS = totalFrete;
  const valorICMS = (baseCalculoICMS * aliquotaICMS) / 100;
  const valorPIS = (totalFrete * 0.65) / 100;
  const valorCOFINS = (totalFrete * 3.00) / 100;
  const valorTributosAprox = valorICMS + valorPIS + valorCOFINS;

  const handleSelectRemetente = (clienteId: string) => {
    setSelectedRemetenteId(clienteId);
    if (!clienteId) {
      setRemetenteDoc('');
      setRemetenteNome('');
      setRemetenteIE('');
      setRemetenteLogradouro('');
      setRemetenteNumero('');
      setRemetenteBairro('');
      setRemetenteMun('');
      setRemetenteMunIbge('');
      setRemetenteUf('SP');
      setRemetenteCep('');
      return;
    }
    const cli = clientes.find(c => c.id === clienteId);
    if (cli) {
      setRemetenteDoc(cli.documento);
      setRemetenteNome(cli.razaoSocial);
      setRemetenteIE(cli.inscricaoEstadual || 'ISENTO');
      setRemetenteLogradouro(cli.endereco.logradouro);
      setRemetenteNumero(cli.endereco.numero);
      setRemetenteBairro(cli.endereco.bairro);
      setRemetenteMun(cli.endereco.nomeMunicipio);
      setRemetenteMunIbge(cli.endereco.codigoMunicipio);
      setRemetenteUf(cli.endereco.uf);
      setRemetenteCep(cli.endereco.cep);
      setMunInicioNome(cli.endereco.nomeMunicipio);
      setMunInicioUf(cli.endereco.uf);
      setMunInicioIbge(cli.endereco.codigoMunicipio);
    }
  };

  const handleSelectDestinatario = (clienteId: string) => {
    setSelectedDestinatarioId(clienteId);
    if (!clienteId) {
      setDestinatarioDoc('');
      setDestinatarioNome('');
      setDestinatarioIE('');
      setDestinatarioLogradouro('');
      setDestinatarioNumero('');
      setDestinatarioBairro('');
      setDestinatarioMun('');
      setDestinatarioMunIbge('');
      setDestinatarioUf('RJ');
      setDestinatarioCep('');
      return;
    }
    const cli = clientes.find(c => c.id === clienteId);
    if (cli) {
      setDestinatarioDoc(cli.documento);
      setDestinatarioNome(cli.razaoSocial);
      setDestinatarioIE(cli.inscricaoEstadual || 'ISENTO');
      setDestinatarioLogradouro(cli.endereco.logradouro);
      setDestinatarioNumero(cli.endereco.numero);
      setDestinatarioBairro(cli.endereco.bairro);
      setDestinatarioMun(cli.endereco.nomeMunicipio);
      setDestinatarioMunIbge(cli.endereco.codigoMunicipio);
      setDestinatarioUf(cli.endereco.uf);
      setDestinatarioCep(cli.endereco.cep);
      setMunFimNome(cli.endereco.nomeMunicipio);
      setMunFimUf(cli.endereco.uf);
      setMunFimIbge(cli.endereco.codigoMunicipio);
    }
  };

  const validarCte = (): boolean => {
    const errs: string[] = [];
    if (!remetenteDoc || !remetenteNome) errs.push('Informe os dados completos do Remetente (embarcador da carga).');
    if (!destinatarioDoc || !destinatarioNome) errs.push('Informe os dados completos do Destinatário da carga.');
    if (!produtoPredominante.trim()) errs.push('Informe o Produto Predominante da carga transportada.');
    if (valorCargaAverbada <= 0) errs.push('Informe o Valor da Carga para fins de averbação securitária.');
    if (pesoBrutoKg <= 0) errs.push('Informe o Peso Bruto da carga em quilogramas.');
    if (totalFrete <= 0) errs.push('O valor total da prestação do frete deve ser maior que zero.');
    setErros(errs);
    return errs.length === 0;
  };

  const handleTransmitirCte = () => {
    if (!validarCte()) return;

    setIsTransmitting(true);
    setErros([]);

    setTimeout(() => {
      try {
        const numero = Math.floor(100 + Math.random() * 900);
        const { chaveCompleta } = gerarChaveAcessoNFe({
          codigoUf: munInicioIbge.slice(0, 2) || '35',
          anoMes: new Date().toISOString().slice(2, 4) + new Date().toISOString().slice(5, 7),
          cnpjEmitente: empresa.cnpj,
          modelo: '57' as any,
          serie: 1,
          numero,
          tipoEmissao: 1,
        });

        const chavesList = chavesNfeTexto
          .split(/[\n,;]/)
          .map(s => s.trim().replace(/\D/g, ''))
          .filter(s => s.length >= 40);

        const novoCte: CTeDocumento = {
          id: `cte-${Date.now()}`,
          modelo: '57',
          serie: 1,
          numero,
          chaveAcesso: chaveCompleta,
          dataHoraEmissao: new Date().toISOString(),
          naturezaOperacao,
          cfop,
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
          remetente: {
            tipoPessoa: remetenteDoc.replace(/\D/g, '').length > 11 ? 'PJ' : 'PF',
            documento: remetenteDoc,
            nomeRazaoSocial: remetenteNome,
            inscricaoEstadual: remetenteIE || 'ISENTO',
            indicadorIEDestinatario: remetenteIE ? '1' : '9',
            endereco: {
              logradouro: remetenteLogradouro || 'Av. Principal',
              numero: remetenteNumero || '100',
              bairro: remetenteBairro || 'Centro',
              codigoMunicipio: remetenteMunIbge || '3550308',
              nomeMunicipio: remetenteMun || 'São Paulo',
              uf: remetenteUf || 'SP',
              cep: remetenteCep || '01000-000',
            },
          },
          destinatario: {
            tipoPessoa: destinatarioDoc.replace(/\D/g, '').length > 11 ? 'PJ' : 'PF',
            documento: destinatarioDoc,
            nomeRazaoSocial: destinatarioNome,
            inscricaoEstadual: destinatarioIE || 'ISENTO',
            indicadorIEDestinatario: destinatarioIE ? '1' : '9',
            endereco: {
              logradouro: destinatarioLogradouro || 'Av. das Indústrias',
              numero: destinatarioNumero || '500',
              bairro: destinatarioBairro || 'Distrito Industrial',
              codigoMunicipio: destinatarioMunIbge || '3304557',
              nomeMunicipio: destinatarioMun || 'Rio de Janeiro',
              uf: destinatarioUf || 'RJ',
              cep: destinatarioCep || '20000-000',
            },
          },
          tomadorServico,
          municipioInicio: {
            codigoIbge: munInicioIbge,
            nome: munInicioNome,
            uf: munInicioUf,
          },
          municipioFim: {
            codigoIbge: munFimIbge,
            nome: munFimNome,
            uf: munFimUf,
          },
          produtoPredominante,
          valorCargaAverbada,
          pesoBrutoKg,
          pesoLiquidoKg,
          quantidadeVolumes,
          especieVolumes,
          cubagemM3: 3.5,
          chavesNFeTransportadas: chavesList.length > 0 ? chavesList : ['35260818236447000190550010000010411123456784'],
          rntrc,
          veiculo: {
            placa: placaVeiculo,
            uf: ufVeiculo,
            rntrcProprietario: rntrc,
          },
          motorista: {
            nome: motoristaNome,
            cpf: motoristaCpf,
          },
          valorTotalFrete: totalFrete,
          componentesValor: {
            fretePeso,
            freteValor,
            pedagio,
            taxaGris,
            outrasTaxas,
          },
          valorReceber: totalFrete,
          cstICMS: '00',
          baseCalculoICMS,
          aliquotaICMS,
          valorICMS,
          valorPIS,
          valorCOFINS,
          valorTributosAproximados: valorTributosAprox,
          protocoloAutorizacao: `1352600${Math.floor(1000000 + Math.random() * 9000000)}`,
          dataHoraAutorizacao: new Date().toISOString(),
          xmlAssinado: `<cteProc versao="4.00" xmlns="http://www.portalfiscal.inf.br/cte"><CTe><infCte Id="CTe${chaveCompleta}" versao="4.00"><ide><cUF>${munInicioIbge.slice(0, 2)}</cUF><mod>57</mod><nCT>${numero}</nCT></ide></infCte></CTe></cteProc>`,
        };

        StorageService.addCte(novoCte);
        onCteEmitido(novoCte);
        setSucessoCte(novoCte);
      } catch (e) {
        setErros(['Falha ao emitir CT-e junto à SEFAZ de Transporte.']);
      } finally {
        setIsTransmitting(false);
      }
    }, 1200);
  };

  // 🔥 COR DO MÓDULO (CIANO)
  const cor = 'cyan';
  const corBg = 'bg-cyan-50';
  const corBorder = 'border-cyan-200';
  const corText = 'text-cyan-700';
  const corTextDark = 'text-cyan-800';
  const corBgButton = 'bg-cyan-600 hover:bg-cyan-700';
  const corBgBadge = 'bg-cyan-100';
  const corFocus = 'focus:ring-cyan-500';
  const corIconBg = 'bg-cyan-600';
  const corGradient = 'from-cyan-600 to-cyan-700';

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      
      {/* 🔥 HEADER - MESMO DESIGN DO NFA-E */}
      <div className={`${corBg} rounded-xl border ${corBorder} p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}>
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-8 h-8 ${corIconBg} rounded-lg flex items-center justify-center text-white shadow-sm`}>
              <Truck className="w-4 h-4" />
            </span>
            <h1 className="text-base font-bold text-slate-900">
              Emissão de CT-e (Conhecimento de Transporte)
            </h1>
            <span className={`${corBgBadge} ${corTextDark} text-[10px] font-bold px-2 py-0.5 rounded-full border ${corBorder}`}>
              Modelo 57
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Documento fiscal oficial para prestação de serviços de transporte de cargas rodoviário intermunicipal e interestadual.
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs font-semibold text-slate-700">RNTRC: {rntrc}</div>
          <div className={`text-[10px] font-medium ${corText}`}>SEFAZ Autorizadora</div>
        </div>
      </div>

      {/* 🔥 BANNER SUCESSO */}
      {sucessoCte && (
        <div className={`${corBg} border ${corBorder} rounded-xl p-4 shadow-sm animate-fadeIn`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className={`w-5 h-5 ${corText} shrink-0 mt-0.5`} />
              <div>
                <h3 className={`text-sm font-bold ${corTextDark}`}>
                  CT-e Nº {sucessoCte.numero} Autorizado com Sucesso!
                </h3>
                <p className="text-xs text-cyan-800 font-mono mt-0.5">
                  Chave: {sucessoCte.chaveAcesso}
                </p>
                <div className="text-[11px] text-cyan-700 mt-1">
                  Origem: {sucessoCte.municipioInicio.nome}/{sucessoCte.municipioInicio.uf} ➔ Destino: {sucessoCte.municipioFim.nome}/{sucessoCte.municipioFim.uf} • Total: {formatarMoeda(sucessoCte.valorTotalFrete)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onViewDacte(sucessoCte)}
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
                  a.download = `CTe_${sucessoCte.numero}_SUP.xml`;
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

      {/* 🔥 ERROS */}
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

      {/* 🔥 FORMULÁRIO */}
      <div className="space-y-4">
        
        {/* BLOCO 1: Remetente & Destinatário */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
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
            </div>
          </div>

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
            </div>
          </div>

        </div>

        {/* BLOCO 2: Percurso e Tomador */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
            <Route className={`w-4 h-4 ${corText}`} />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">3. Percurso & Tomador</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-medium text-slate-600 mb-1">Tomador do Serviço</label>
              <select
                value={tomadorServico}
                onChange={(e) => setTomadorServico(parseInt(e.target.value) as any)}
                className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              >
                <option value={0}>0 - Remetente (CIF)</option>
                <option value={3}>3 - Destinatário (FOB)</option>
                <option value={1}>1 - Expedidor</option>
                <option value={2}>2 - Recebedor</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">CFOP</label>
              <input
                type="text"
                value={cfop}
                onChange={(e) => setCfop(e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus} font-mono`}
                placeholder="6353"
              />
            </div>
            <div>
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

        {/* BLOCO 3: Carga */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
            <Package className={`w-4 h-4 ${corText}`} />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">4. Carga Transportada</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="sm:col-span-2">
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
              <label className="block font-medium text-slate-600 mb-1">Peso Bruto (Kg) *</label>
              <input
                type="number"
                value={pesoBrutoKg}
                onChange={(e) => setPesoBrutoKg(parseFloat(e.target.value) || 0)}
                className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus} font-bold`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mt-3">
            <div>
              <label className="block font-medium text-slate-600 mb-1">Qtd. Volumes</label>
              <input
                type="number"
                value={quantidadeVolumes}
                onChange={(e) => setQuantidadeVolumes(parseInt(e.target.value) || 1)}
                className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">Espécie dos Volumes</label>
              <input
                type="text"
                value={especieVolumes}
                onChange={(e) => setEspecieVolumes(e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">RNTRC</label>
              <input
                type="text"
                value={rntrc}
                onChange={(e) => setRntrc(e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus} font-mono`}
              />
            </div>
          </div>

          <div className="mt-3 text-xs">
            <label className="block font-medium text-slate-600 mb-1">Chaves NF-e Transportadas</label>
            <textarea
              rows={2}
              value={chavesNfeTexto}
              onChange={(e) => setChavesNfeTexto(e.target.value)}
              className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus} font-mono`}
              placeholder="35260818236447000190550010000010411123456784"
            />
          </div>
        </div>

        {/* BLOCO 4: Frete e Totais */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
              <Calculator className={`w-4 h-4 ${corText}`} />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">5. Componentes do Frete</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
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
                <label className="block font-medium text-slate-600 mb-1">Alíq. ICMS (%)</label>
                <input
                  type="number"
                  value={aliquotaICMS}
                  onChange={(e) => setAliquotaICMS(parseFloat(e.target.value) || 0)}
                  className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                />
              </div>
            </div>

            <div className={`mt-3 p-3 ${corBg} rounded-lg border ${corBorder} text-xs`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <span className="text-slate-600">Base ICMS: <strong>{formatarMoeda(baseCalculoICMS)}</strong></span>
                  <span className="ml-3 text-slate-600">ICMS: <strong className={corText}>{formatarMoeda(valorICMS)}</strong></span>
                  <span className="ml-3 text-slate-500 text-[11px]">PIS/COFINS: {formatarMoeda(valorPIS + valorCOFINS)}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Total do Frete</span>
                  <span className={`text-lg font-extrabold ${corText}`}>{formatarMoeda(totalFrete)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA - Veículo e Motorista */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
              <Truck className={`w-4 h-4 ${corText}`} />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">6. Veículo & Motorista</h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Placa</label>
                  <input
                    type="text"
                    value={placaVeiculo}
                    onChange={(e) => setPlacaVeiculo(e.target.value)}
                    className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus} uppercase`}
                    placeholder="BRA2E26"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">UF</label>
                  <input
                    type="text"
                    value={ufVeiculo}
                    onChange={(e) => setUfVeiculo(e.target.value)}
                    className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus} uppercase`}
                    maxLength={2}
                    placeholder="SP"
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">Motorista</label>
                <input
                  type="text"
                  value={motoristaNome}
                  onChange={(e) => setMotoristaNome(e.target.value)}
                  className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                  placeholder="Nome do motorista"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">CPF Motorista</label>
                  <input
                    type="text"
                    value={motoristaCpf}
                    onChange={(e) => setMotoristaCpf(e.target.value)}
                    className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus}`}
                    placeholder="000.000.000-00"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">RNTRC</label>
                  <input
                    type="text"
                    value={rntrc}
                    onChange={(e) => setRntrc(e.target.value)}
                    className={`w-full border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 ${corFocus} font-mono`}
                  />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* 🔥 BOTÃO TRANSMITIR */}
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

    </div>
  );
};