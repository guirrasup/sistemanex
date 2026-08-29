// C:\emissornfe\src\components\tools\ConsultaCnpjView.tsx

import React, { useState } from 'react';
import {
  Search,
  Building2,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle2,
  User,
  FileText,
  Clipboard,
  ExternalLink,
  Loader2,
  Clock,
  ShieldCheck,
  Calendar,
  DollarSign,
  Users,
  Briefcase,
  Award,
  Truck,
  Database,
  RefreshCw,
  ChevronDown,
  Check,
  X,
  Filter
} from 'lucide-react';
import { consultarCnpjOpen, OpenCnpjConsultaResultado } from '../../services/openCnpj.service';
import { formatarCpfCnpj, limparDocumento } from '../../utils/cpfCnpjValidator';

interface ConsultaCnpjViewProps {
  onNavigate?: (view: string) => void;
}

// 🔥 DATASETS DISPONÍVEIS
const DATASETS_OPCOES = [
  { id: 'receita', label: 'Receita Federal', icon: <Building2 className="w-3.5 h-3.5" /> },
  { id: 'rntrc', label: 'RNTRC (Transporte)', icon: <Truck className="w-3.5 h-3.5" /> },
  { id: 'cno', label: 'CNO (Obras)', icon: <Briefcase className="w-3.5 h-3.5" /> },
  { id: 'ceis', label: 'CEIS (Sanções)', icon: <AlertCircle className="w-3.5 h-3.5" /> },
  { id: 'cnep', label: 'CNEP (Sanções)', icon: <AlertCircle className="w-3.5 h-3.5" /> },
];

export const ConsultaCnpjView: React.FC<ConsultaCnpjViewProps> = ({ onNavigate }) => {
  const [cnpj, setCnpj] = useState('');
  const [cnpjRaw, setCnpjRaw] = useState(''); // 🔥 ARMAZENA O VALOR SEM MÁSCARA PARA CONSULTA
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<OpenCnpjConsultaResultado['dados'] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [historico, setHistorico] = useState<string[]>([]);
  const [datasetsSelecionados, setDatasetsSelecionados] = useState<string[]>(['receita']);
  const [menuDatasetsAberto, setMenuDatasetsAberto] = useState(false);

  // 🔥 COR DO MÓDULO (ROSA)
  const cor = 'rose';
  const corBg = 'bg-rose-50';
  const corBorder = 'border-rose-200';
  const corText = 'text-rose-700';
  const corTextDark = 'text-rose-800';
  const corBgButton = 'bg-rose-600 hover:bg-rose-700';
  const corBgBadge = 'bg-rose-100';
  const corFocus = 'focus:ring-rose-500';
  const corIconBg = 'bg-rose-600';

  // 🔥 FUNÇÃO PARA FORMATAR CNPJ COM MÁSCARA
  const formatarCnpjDisplay = (valor: string): string => {
    // Remove tudo que não é número ou letra (permite alfanumérico)
    const limpo = valor.replace(/[^A-Za-z0-9]/g, '');
    
    // Se tiver apenas números, aplica máscara de CNPJ
    if (/^\d+$/.test(limpo) && limpo.length <= 14) {
      if (limpo.length <= 2) return limpo;
      if (limpo.length <= 5) return limpo.replace(/(\d{2})(\d{0,3})/, '$1.$2');
      if (limpo.length <= 8) return limpo.replace(/(\d{2})(\d{3})(\d{0,3})/, '$1.$2.$3');
      if (limpo.length <= 12) return limpo.replace(/(\d{2})(\d{3})(\d{3})(\d{0,4})/, '$1.$2.$3/$4');
      return limpo.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, '$1.$2.$3/$4-$5');
    }
    
    // Se for alfanumérico, retorna sem máscara (mas pode ter formato 12.ABC.345/01DE-35)
    if (limpo.length > 0) {
      // Tenta aplicar máscara alfanumérica se tiver o padrão
      if (limpo.length >= 12) {
        const partes = limpo.match(/^(.{2})(.{3})(.{3})(.{0,4})(.{0,2})/);
        if (partes) {
          let resultado = partes[1];
          if (partes[2]) resultado += '.' + partes[2];
          if (partes[3]) resultado += '.' + partes[3];
          if (partes[4]) resultado += '/' + partes[4];
          if (partes[5]) resultado += '-' + partes[5];
          return resultado;
        }
      }
      return limpo;
    }
    
    return '';
  };

  // 🔥 FUNÇÃO PARA EXTRAIR O CNPJ LIMPO (APENAS NÚMEROS E LETRAS)
  const extrairCnpjRaw = (valor: string): string => {
    return valor.replace(/[^A-Za-z0-9]/g, '');
  };

  // 🔥 HANDLE CHANGE DO INPUT - ACEITA MÁSCARA E ALFANUMÉRICO
  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    const raw = extrairCnpjRaw(valor);
    setCnpjRaw(raw);
    
    // Formata para exibição
    const formatado = formatarCnpjDisplay(valor);
    setCnpj(formatado);
    
    // Limpa erro se começar a digitar
    if (erro) setErro(null);
  };

  const handleConsultar = async () => {
    // 🔥 USA O CNPJ RAW (SEM MÁSCARA) PARA CONSULTA
    const cnpjLimpo = cnpjRaw || extrairCnpjRaw(cnpj);
    
    // 🔥 VALIDAÇÃO: ACEITA 14 CARACTERES (NÚMEROS OU ALFANUMÉRICO)
    // A OpenCNPJ aceita CNPJs alfanuméricos com 14 caracteres
    if (cnpjLimpo.length !== 14) {
      setErro('Digite um CNPJ válido (14 caracteres, podendo ser números ou letras)');
      return;
    }

    setLoading(true);
    setErro(null);
    setResultado(null);

    try {
      const response = await consultarCnpjOpen(cnpjLimpo, datasetsSelecionados);
      
      if (response.sucesso && response.dados) {
        setResultado(response.dados);
        setHistorico(prev => {
          const novo = [cnpjLimpo, ...prev.filter(h => h !== cnpjLimpo)];
          return novo.slice(0, 10);
        });
      } else {
        setErro(response.erro || 'CNPJ não encontrado');
      }
    } catch (err: any) {
      setErro(`Erro na consulta: ${err.message || 'Tente novamente'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConsultar();
    }
  };

  const toggleDataset = (datasetId: string) => {
    setDatasetsSelecionados(prev => {
      if (datasetId === 'receita') {
        return prev;
      }
      if (prev.includes(datasetId)) {
        return prev.filter(id => id !== datasetId);
      } else {
        return [...prev, datasetId];
      }
    });
  };

  const copiarParaClipboard = (texto: string) => {
    navigator.clipboard.writeText(texto);
    alert('✅ Copiado para a área de transferência!');
  };

  const formatarData = (data: string) => {
    if (!data) return '-';
    try {
      const d = new Date(data);
      if (isNaN(d.getTime())) return data;
      return d.toLocaleDateString('pt-BR');
    } catch {
      return data;
    }
  };

  const formatarMoeda = (valor: number) => {
    if (!valor || valor === 0) return '-';
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const preencherConfiguracoes = () => {
    if (!resultado) return;
    
    try {
      const dadosEmpresa = {
        razaoSocial: resultado.razaoSocial,
        nomeFantasia: resultado.nomeFantasia,
        cnpj: resultado.cnpj,
        cnae: resultado.cnaePrincipal,
        endereco: {
          logradouro: resultado.endereco.logradouro,
          numero: resultado.endereco.numero,
          complemento: resultado.endereco.complemento,
          bairro: resultado.endereco.bairro,
          codigoMunicipio: resultado.endereco.codigoMunicipio || '',
          nomeMunicipio: resultado.endereco.municipio,
          uf: resultado.endereco.uf,
          cep: resultado.endereco.cep,
          telefone: resultado.telefone,
          email: resultado.email,
        }
      };
      localStorage.setItem('sup_consulta_cnpj_temp', JSON.stringify(dadosEmpresa));
    } catch (e) {
      console.warn('Erro ao salvar dados temporários:', e);
    }
    
    if (onNavigate) {
      onNavigate('configuracoes');
    }
  };

  const getStatusColor = (status: string) => {
    if (!status) return 'text-slate-500';
    const s = status.toUpperCase();
    if (s === 'ATIVA' || s === 'ATIVO') return 'text-emerald-700';
    if (s === 'SUSPENSA' || s === 'SUSPENSO') return 'text-amber-700';
    if (s === 'BAIXADA' || s === 'INATIVA') return 'text-rose-700';
    return 'text-slate-500';
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* HEADER */}
      <div className={`${corBg} rounded-xl border ${corBorder} p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}>
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-8 h-8 ${corIconBg} rounded-lg flex items-center justify-center text-white shadow-sm`}>
              <Search className="w-4 h-4" />
            </span>
            <h1 className="text-base font-bold text-slate-900">Consulta CNPJ</h1>
            <span className={`${corBgBadge} ${corTextDark} text-[10px] font-bold px-2 py-0.5 rounded-full border ${corBorder}`}>
              OpenCNPJ
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Dados oficiais da Receita Federal via API pública OpenCNPJ
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs font-semibold text-slate-700">Ferramenta</div>
          <div className={`text-[10px] font-medium ${corText}`}>Consulta Pública</div>
        </div>
      </div>

      {/* Busca com Seletores de Dataset */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              CNPJ (números ou alfanumérico)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Building2 className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={cnpj}
                onChange={handleCnpjChange}
                onKeyPress={handleKeyPress}
                placeholder="Ex: 18.236.447/0001-90 ou 12.ABC.345/01DE-35"
                className={`w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none ${corFocus} focus:border-rose-600 focus:ring-2 focus:ring-rose-600/20 transition-all font-mono`}
                maxLength={20}
              />
            </div>
            <div className="mt-1 text-[10px] text-slate-400 flex items-center gap-2">
              <span>🔹 Aceita formatos: números (14 dígitos) ou alfanumérico (14 caracteres)</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleConsultar}
            disabled={loading}
            className={`${corBgButton} disabled:bg-slate-300 text-white font-bold text-sm px-6 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed min-w-[140px]`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Consultando...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Consultar</span>
              </>
            )}
          </button>
        </div>

        {/* Seletores de Dataset */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
            <Database className="w-3.5 h-3.5" />
            Datasets:
          </span>
          
          {DATASETS_OPCOES.map((ds) => {
            const isSelected = datasetsSelecionados.includes(ds.id);
            const isReceita = ds.id === 'receita';
            return (
              <button
                key={ds.id}
                onClick={() => toggleDataset(ds.id)}
                disabled={isReceita}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium transition-all ${
                  isSelected 
                    ? 'bg-rose-100 text-rose-700 border border-rose-300' 
                    : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                } ${isReceita ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {ds.icon}
                {ds.label}
                {isSelected && <Check className="w-3 h-3" />}
                {isReceita && <span className="text-[8px] text-slate-400">(fixo)</span>}
              </button>
            );
          })}
          
          {datasetsSelecionados.length > 1 && (
            <button
              onClick={() => setDatasetsSelecionados(['receita'])}
              className="text-[10px] text-slate-400 hover:text-rose-600 transition-colors"
            >
              <X className="w-3 h-3 inline" /> Limpar extras
            </button>
          )}
        </div>

        {erro && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="text-sm text-rose-800">{erro}</span>
          </div>
        )}
      </div>

      {/* Resultado da Consulta - MESMO CÓDIGO ANTERIOR */}
      {resultado && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn">
          
          {/* Header do Resultado */}
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <div>
                <div className="font-bold text-slate-900 text-sm">
                  {resultado.razaoSocial || 'Razão Social não informada'}
                </div>
                {resultado.nomeFantasia && (
                  <div className="text-xs text-slate-600">{resultado.nomeFantasia}</div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono bg-white px-3 py-1 rounded border border-slate-200 text-slate-700">
                {formatarCpfCnpj(resultado.cnpj) || resultado.cnpj || 'CNPJ não informado'}
              </span>
              <button
                type="button"
                onClick={() => copiarParaClipboard(resultado.cnpj || '')}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                title="Copiar CNPJ"
              >
                <Clipboard className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Grid de Dados - MESMO CÓDIGO */}
          <div className="p-6 space-y-4">
            
            {/* Status e Situação */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Situação Cadastral
                </span>
                <span className={`font-bold text-sm ${getStatusColor(resultado.situacaoCadastral)}`}>
                  {resultado.situacaoCadastral || '-'}
                </span>
                {resultado.dataSituacaoCadastral && (
                  <span className="text-xs text-slate-500 block">
                    desde {formatarData(resultado.dataSituacaoCadastral)}
                  </span>
                )}
              </div>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Data de Abertura
                </span>
                <span className="font-medium text-slate-900">{formatarData(resultado.dataAbertura)}</span>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  Natureza Jurídica
                </span>
                <span className="font-medium text-slate-900 text-xs">{resultado.naturezaJuridica || '-'}</span>
              </div>
            </div>

            {/* CNAE */}
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase block flex items-center gap-1">
                <Briefcase className="w-3 h-3" />
                CNAE Principal
              </span>
              <span className="font-medium text-slate-900 text-sm">
                {resultado.cnaePrincipal || '-'}
                {resultado.cnaePrincipalDescricao && ` - ${resultado.cnaePrincipalDescricao}`}
              </span>
              {resultado.cnaeSecundarios && resultado.cnaeSecundarios.length > 0 && (
                <div className="mt-1 text-xs text-slate-500">
                  Secundários: {resultado.cnaeSecundarios.join(', ')}
                </div>
              )}
            </div>

            {/* RNTRC - se disponível */}
            {resultado.rntrc && (
              <div className="bg-cyan-50 rounded-lg p-3 border border-cyan-200">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-cyan-600" />
                  <span className="text-xs font-bold text-cyan-700 uppercase">RNTRC - Registro Nacional de Transportadores</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                  <div>
                    <span className="text-slate-500 block">Número</span>
                    <span className="font-bold text-slate-900">{resultado.rntrc.numero}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Situação</span>
                    <span className={`font-bold ${resultado.rntrc.situacao === 'ATIVO' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {resultado.rntrc.situacao}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Validade</span>
                    <span className="font-bold text-slate-900">{formatarData(resultado.rntrc.dataValidade)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Endereço */}
            {resultado.endereco && (resultado.endereco.logradouro || resultado.endereco.municipio) && (
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-rose-600" />
                  <span>Endereço</span>
                </h3>
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Logradouro</span>
                      <span className="font-medium text-slate-900">
                        {resultado.endereco.logradouro || '-'}
                        {resultado.endereco.numero && `, ${resultado.endereco.numero}`}
                      </span>
                    </div>
                    {resultado.endereco.complemento && (
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Complemento</span>
                        <span className="font-medium text-slate-900">{resultado.endereco.complemento}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Bairro</span>
                      <span className="font-medium text-slate-900">{resultado.endereco.bairro || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Município / UF</span>
                      <span className="font-medium text-slate-900">
                        {resultado.endereco.municipio || '-'}
                        {resultado.endereco.uf && ` / ${resultado.endereco.uf}`}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">CEP</span>
                      <span className="font-medium text-slate-900 font-mono">{resultado.endereco.cep || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Cód. IBGE</span>
                      <span className="font-medium text-slate-900 font-mono">{resultado.endereco.codigoMunicipio || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contato e Financeiro */}
            {(resultado.telefone || resultado.email || resultado.capitalSocial > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {resultado.telefone && (
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      Telefone
                    </span>
                    <span className="font-medium text-slate-900">{resultado.telefone}</span>
                  </div>
                )}
                {resultado.email && (
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      E-mail
                    </span>
                    <span className="font-medium text-slate-900">{resultado.email}</span>
                  </div>
                )}
                {resultado.capitalSocial > 0 && (
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      Capital Social
                    </span>
                    <span className="font-medium text-slate-900">{formatarMoeda(resultado.capitalSocial)}</span>
                  </div>
                )}
              </div>
            )}

            {/* QSA */}
            {resultado.qsa && resultado.qsa.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-rose-600" />
                  <span>Quadro Societário ({resultado.qsa.length})</span>
                </h3>
                <div className="bg-slate-50 rounded-lg border border-slate-100 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="text-left p-2 text-[10px] font-bold text-slate-500 uppercase">Nome</th>
                        <th className="text-left p-2 text-[10px] font-bold text-slate-500 uppercase">CPF</th>
                        <th className="text-left p-2 text-[10px] font-bold text-slate-500 uppercase">Qualificação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {resultado.qsa.slice(0, 10).map((socio: any, index: number) => (
                        <tr key={index} className="hover:bg-white/50">
                          <td className="p-2 font-medium text-slate-900">{socio.nome || '-'}</td>
                          <td className="p-2 font-mono text-slate-700">{socio.cpf ? formatarCpfCnpj(socio.cpf) : '-'}</td>
                          <td className="p-2 text-slate-700">{socio.qualificacao || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {resultado.qsa.length > 10 && (
                    <div className="p-2 text-center text-xs text-slate-500 bg-slate-50">
                      + {resultado.qsa.length - 10} sócios não listados
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CEIS / CNEP */}
            {(resultado.ceis && resultado.ceis.length > 0) && (
              <div className="bg-rose-50 rounded-lg p-3 border border-rose-200">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span className="text-xs font-bold text-rose-700 uppercase">CEIS - Cadastro de Empresas Inidôneas</span>
                </div>
                <div className="mt-2 space-y-1">
                  {resultado.ceis.slice(0, 3).map((item: any, idx: number) => (
                    <div key={idx} className="text-xs bg-white p-2 rounded border border-rose-100">
                      <span className="font-medium">{item.orgao}</span>
                      <span className="text-slate-500 ml-2">
                        {formatarData(item.dataInicio)} - {formatarData(item.dataFim)}
                      </span>
                      <span className="text-rose-600 ml-2">{item.tipo}</span>
                    </div>
                  ))}
                  {resultado.ceis.length > 3 && (
                    <div className="text-xs text-slate-500">+ {resultado.ceis.length - 3} registros</div>
                  )}
                </div>
              </div>
            )}

            {/* Ações */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={preencherConfiguracoes}
                className={`${corBgButton} text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 cursor-pointer`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Preencher Configurações</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const json = JSON.stringify(resultado, null, 2);
                  const blob = new Blob([json], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `cnpj_${resultado.cnpj?.replace(/\D/g, '') || 'consulta'}.json`;
                  a.click();
                }}
                className="bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium px-4 py-2 rounded-lg border border-slate-300 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Exportar JSON</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const cnpjLimpo = resultado.cnpj?.replace(/\D/g, '') || '';
                  window.open(`https://api.opencnpj.org/${cnpjLimpo}`, '_blank');
                }}
                className="bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium px-4 py-2 rounded-lg border border-slate-300 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Ver na OpenCNPJ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Histórico de Consultas */}
      {historico.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-rose-600" />
            <span>Últimas Consultas</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {historico.map((item, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setCnpj(formatarCpfCnpj(item) || item);
                  setCnpjRaw(item);
                  handleConsultar();
                }}
                className="text-xs bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-700 px-3 py-1.5 rounded border border-slate-200 hover:border-rose-300 transition-colors font-mono cursor-pointer"
              >
                {formatarCpfCnpj(item) || item}
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};