// src/components/ConfiguracoesView.tsx

import React, { useState, useEffect } from 'react';
import { store } from '../services/store';
import { Settings, Calendar, User, FileText, Save, RefreshCw } from 'lucide-react';
import { getContabilConfig, CONTABIL_CONFIG_PADRAO, ContabilConfig } from '../config/contabil.config';
import { getPeriodoAtual, PeriodoConfig } from '../config/periodo.config';

export const ConfiguracoesView: React.FC = () => {
  const [, setTick] = useState(0);
  useEffect(() => {
    return store.subscribe(() => setTick(t => t + 1));
  }, []);

  const [config, setConfig] = useState<ContabilConfig>(getContabilConfig());
  const [periodo, setPeriodo] = useState<PeriodoConfig>(getPeriodoAtual('ecd'));
  const [activeTab, setActiveTab] = useState<'geral' | 'sped' | 'periodos'>('geral');

  const [anoSelecionado, setAnoSelecionado] = useState<number>(new Date().getFullYear());

  const empresas = store.companies || [];

  const handleSalvarConfig = () => {
    localStorage.setItem('nexs_contabil_config', JSON.stringify(config));
    alert('Configurações salvas com sucesso!');
  };

  const handleResetConfig = () => {
    if (confirm('Deseja restaurar as configurações padrão?')) {
      setConfig(CONTABIL_CONFIG_PADRAO);
    }
  };

  const handlePeriodoChange = (tipo: 'ecd' | 'ecf', mesInicio: number, mesFim: number) => {
    // Atualiza período
    alert(`Período ${tipo.toUpperCase()} alterado para ${mesInicio}/${mesFim}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-cyan-400" />
              Configurações do Sistema
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Parâmetros contábeis, fiscais e períodos de apuração
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSalvarConfig}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              Salvar Configurações
            </button>
            <button
              onClick={handleResetConfig}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              Restaurar Padrão
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-950/60 border border-white/5 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('geral')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'geral' 
              ? 'bg-cyan-500 text-slate-950' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <User className="w-4 h-4 inline mr-1.5" />
          Dados do Contador
        </button>
        <button
          onClick={() => setActiveTab('sped')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'sped' 
              ? 'bg-cyan-500 text-slate-950' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4 inline mr-1.5" />
          SPED / ECD / ECF
        </button>
        <button
          onClick={() => setActiveTab('periodos')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'periodos' 
              ? 'bg-cyan-500 text-slate-950' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4 inline mr-1.5" />
          Períodos Contábeis
        </button>
      </div>

      {/* Content */}
      <div className="bg-slate-900/60 border border-white/5 p-6 rounded-2xl shadow-xl">
        {activeTab === 'geral' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white mb-4">Dados do Contador Responsável</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1 font-semibold">Nome do Contador *</label>
                <input
                  type="text"
                  value={config.empresa.nome_contador}
                  onChange={e => setConfig({...config, empresa: {...config.empresa, nome_contador: e.target.value}})}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white text-sm outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1 font-semibold">CPF do Contador *</label>
                <input
                  type="text"
                  value={config.empresa.cpf_contador}
                  onChange={e => setConfig({...config, empresa: {...config.empresa, cpf_contador: e.target.value}})}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white text-sm font-mono outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1 font-semibold">CRC do Contador *</label>
                <input
                  type="text"
                  value={config.empresa.crc_contador}
                  onChange={e => setConfig({...config, empresa: {...config.empresa, crc_contador: e.target.value}})}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white text-sm outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1 font-semibold">CNPJ do Escritório</label>
                <input
                  type="text"
                  value={config.empresa.cnpj_contador}
                  onChange={e => setConfig({...config, empresa: {...config.empresa, cnpj_contador: e.target.value}})}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white text-sm font-mono outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1 font-semibold">Telefone</label>
                <input
                  type="text"
                  value={config.empresa.telefone_contador}
                  onChange={e => setConfig({...config, empresa: {...config.empresa, telefone_contador: e.target.value}})}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white text-sm outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1 font-semibold">E-mail</label>
                <input
                  type="email"
                  value={config.empresa.email_contador}
                  onChange={e => setConfig({...config, empresa: {...config.empresa, email_contador: e.target.value}})}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white text-sm outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="border-t border-white/5 pt-4 mt-4">
              <h4 className="text-xs font-bold text-slate-400 mb-3">Dados do Assinante (Representante Legal)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-semibold">Nome do Assinante *</label>
                  <input
                    type="text"
                    value={config.assinante.nome}
                    onChange={e => setConfig({...config, assinante: {...config.assinante, nome: e.target.value}})}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white text-sm outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-semibold">CPF do Assinante *</label>
                  <input
                    type="text"
                    value={config.assinante.cpf}
                    onChange={e => setConfig({...config, assinante: {...config.assinante, cpf: e.target.value}})}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white text-sm font-mono outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sped' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white mb-4">Configurações SPED</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1 font-semibold">Versão do Layout SPED</label>
                <select
                  value={config.sped.versao}
                  onChange={e => setConfig({...config, sped: {...config.sped, versao: e.target.value}})}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white text-sm outline-none cursor-pointer"
                >
                  <option value="9.0">9.0</option>
                  <option value="8.0">8.0</option>
                  <option value="7.0">7.0</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1 font-semibold">Ambiente SEFAZ</label>
                <select
                  value={config.sped.ambiente}
                  onChange={e => setConfig({...config, sped: {...config.sped, ambiente: e.target.value as 'homologacao' | 'producao'}})}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white text-sm outline-none cursor-pointer"
                >
                  <option value="homologacao">Homologação (Teste)</option>
                  <option value="producao">Produção (Oficial)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1 font-semibold">Tipo de Escrituração ECD</label>
                <select className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white text-sm outline-none cursor-pointer">
                  <option value="0">0 - Contábil</option>
                  <option value="1">1 - Simplificada</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1 font-semibold">Finalidade do Arquivo</label>
                <select className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white text-sm outline-none cursor-pointer">
                  <option value="0">0 - Original</option>
                  <option value="1">1 - Retificador</option>
                  <option value="2">2 - Substituição</option>
                </select>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl mt-4">
              <p className="text-xs text-amber-300 font-mono">
                ⚠️ Alterações nas versões do SPED podem afetar a validação na RFB. 
                Verifique a obrigatoriedade antes de alterar.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'periodos' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white mb-4">Períodos de Apuração</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ECD */}
              <div className="bg-slate-950/60 border border-white/5 p-4 rounded-xl">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  ECD - Escrituração Contábil Digital
                </h4>
                <div className="mt-3 space-y-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block">Ano de Referência</label>
                    <input
                      type="number"
                      value={anoSelecionado}
                      onChange={e => setAnoSelecionado(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white text-sm outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-[10px] text-slate-400 block">Mês Início</label>
                      <select
                        value={config.periodos.ecd.dia_inicio}
                        onChange={e => setConfig({
                          ...config, 
                          periodos: {...config.periodos, ecd: {...config.periodos.ecd, dia_inicio: Number(e.target.value)}}
                        })}
                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white text-sm outline-none"
                      >
                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                          <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-slate-400 block">Mês Fim</label>
                      <select
                        value={config.periodos.ecd.dia_fim}
                        onChange={e => setConfig({
                          ...config, 
                          periodos: {...config.periodos, ecd: {...config.periodos.ecd, dia_fim: Number(e.target.value)}}
                        })}
                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white text-sm outline-none"
                      >
                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                          <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Período: {anoSelecionado}-{String(config.periodos.ecd.dia_inicio).padStart(2, '0')} a {anoSelecionado}-{String(config.periodos.ecd.dia_fim).padStart(2, '0')}
                  </div>
                </div>
              </div>

              {/* ECF */}
              <div className="bg-slate-950/60 border border-white/5 p-4 rounded-xl">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  ECF - Escrituração Contábil Fiscal
                </h4>
                <div className="mt-3 space-y-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block">Ano de Referência</label>
                    <input
                      type="number"
                      value={anoSelecionado}
                      onChange={e => setAnoSelecionado(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white text-sm outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-[10px] text-slate-400 block">Mês Início</label>
                      <select
                        value={config.periodos.ecf.dia_inicio}
                        onChange={e => setConfig({
                          ...config, 
                          periodos: {...config.periodos, ecf: {...config.periodos.ecf, dia_inicio: Number(e.target.value)}}
                        })}
                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white text-sm outline-none"
                      >
                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                          <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-slate-400 block">Mês Fim</label>
                      <select
                        value={config.periodos.ecf.dia_fim}
                        onChange={e => setConfig({
                          ...config, 
                          periodos: {...config.periodos, ecf: {...config.periodos.ecf, dia_fim: Number(e.target.value)}}
                        })}
                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white text-sm outline-none"
                      >
                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                          <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Período: {anoSelecionado}-{String(config.periodos.ecf.dia_inicio).padStart(2, '0')} a {anoSelecionado}-{String(config.periodos.ecf.dia_fim).padStart(2, '0')}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-white/5 p-4 rounded-xl mt-2">
              <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Período Atual de Apuração
              </h4>
              <div className="mt-2 grid grid-cols-3 gap-4 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 block">Início</span>
                  <span className="text-sm font-bold text-white">{periodo.data_inicio}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Fim</span>
                  <span className="text-sm font-bold text-white">{periodo.data_fim}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Dias</span>
                  <span className="text-sm font-bold text-cyan-400">
                    {Math.ceil((new Date(periodo.data_fim).getTime() - new Date(periodo.data_inicio).getTime()) / (1000 * 60 * 60 * 24)) + 1}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};