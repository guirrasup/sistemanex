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
} from 'lucide-react';
import { consultarCnpjConectaGov } from '../../utils/consultaCnpjApi';
import { formatarCpfCnpj } from '../../utils/cpfCnpjValidator';

interface ConsultaCnpjViewProps {
  onNavigate?: (view: string) => void;
}

export const ConsultaCnpjView: React.FC<ConsultaCnpjViewProps> = ({ onNavigate }) => {
  const [cnpj, setCnpj] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [historico, setHistorico] = useState<string[]>([]);

  // 🔥 COR DO MÓDULO (ROSA) - MESMA DO HEADER E SIDEBAR
  const cor = 'rose';
  const corBg = 'bg-rose-50';
  const corBorder = 'border-rose-200';
  const corText = 'text-rose-700';
  const corTextDark = 'text-rose-800';
  const corBgButton = 'bg-rose-600 hover:bg-rose-700';
  const corBgBadge = 'bg-rose-100';
  const corFocus = 'focus:ring-rose-500';
  const corIconBg = 'bg-rose-600';

  const handleConsultar = async () => {
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    
    if (cnpjLimpo.length !== 14) {
      setErro('Digite um CNPJ válido com 14 dígitos');
      return;
    }

    setLoading(true);
    setErro(null);
    setResultado(null);

    try {
      const response = await consultarCnpjConectaGov(cnpjLimpo);
      
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
          codigoMunicipio: resultado.endereco.codigoMunicipio,
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

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* 🔥 HEADER - COR ROSA */}
      <div className={`${corBg} rounded-xl border ${corBorder} p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}>
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-8 h-8 ${corIconBg} rounded-lg flex items-center justify-center text-white shadow-sm`}>
              <Search className="w-4 h-4" />
            </span>
            <h1 className="text-base font-bold text-slate-900">
              Consulta CNPJ
            </h1>
            <span className={`${corBgBadge} ${corTextDark} text-[10px] font-bold px-2 py-0.5 rounded-full border ${corBorder}`}>
              Receita Federal
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Dados oficiais da Receita Federal via API do Governo Federal
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs font-semibold text-slate-700">Ferramenta</div>
          <div className={`text-[10px] font-medium ${corText}`}>Consulta Pública</div>
        </div>
      </div>

      {/* Busca */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              CNPJ (apenas números)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Building2 className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value.replace(/\D/g, ''))}
                onKeyPress={handleKeyPress}
                placeholder="Digite o CNPJ (ex: 18236447000190)"
                className={`w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none ${corFocus} focus:border-rose-600 focus:ring-2 focus:ring-rose-600/20 transition-all font-mono`}
                maxLength={14}
              />
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

        {erro && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="text-sm text-rose-800">{erro}</span>
          </div>
        )}
      </div>

      {/* Resultado da Consulta */}
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
                  <div className="text-xs text-slate-600">
                    {resultado.nomeFantasia}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono bg-white px-3 py-1 rounded border border-slate-200 text-slate-700">
                {resultado.cnpj || 'CNPJ não informado'}
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

          {/* Grid de Dados */}
          <div className="p-6 space-y-4">
            
            {/* Status e Situação */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Situação Cadastral
                </span>
                <span className={`font-bold text-sm ${resultado.situacaoCadastral === 'ATIVA' || resultado.situacaoCadastral === 'ATIVO' ? 'text-emerald-700' : 'text-rose-700'}`}>
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
              <span className="font-medium text-slate-900 text-sm">{resultado.cnaePrincipal || '-'}</span>
              {resultado.cnaeSecundarios && resultado.cnaeSecundarios.length > 0 && (
                <div className="mt-1 text-xs text-slate-500">
                  Secundários: {resultado.cnaeSecundarios.join(', ')}
                </div>
              )}
            </div>

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

            {/* QSA - Quadro Societário */}
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
                  window.open(`https://www.receitaws.com.br/v1/cnpj/${cnpjLimpo}`, '_blank');
                }}
                className="bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium px-4 py-2 rounded-lg border border-slate-300 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Ver na ReceitaWS</span>
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
                  setCnpj(item);
                  handleConsultar();
                }}
                className="text-xs bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-700 px-3 py-1.5 rounded border border-slate-200 hover:border-rose-300 transition-colors font-mono cursor-pointer"
              >
                {formatarCpfCnpj(item)}
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};