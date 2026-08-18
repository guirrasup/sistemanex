// src/components/SpedView.tsx

import React, { useState, useEffect } from 'react';
import { store } from '../services/store';
import { 
  FileText, Download, Printer, Calendar, 
  Building2, CheckCircle2, AlertCircle, 
  Sparkles, Eye, FileArchive, Check
} from 'lucide-react';
import { SpedEcdGenerator } from '../services/sped/SpedEcdGenerator';
import { SpedEcfGenerator } from '../services/sped/SpedEcfGenerator';
import { getPeriodoAtual, PeriodoConfig } from '../config/periodo.config';
import { getContabilConfig } from '../config/contabil.config';

export const SpedView: React.FC = () => {
  const [, setTick] = useState(0);
  useEffect(() => {
    return store.subscribe(() => setTick(t => t + 1));
  }, []);

  const [tipoSped, setTipoSped] = useState<'ecd' | 'ecf'>('ecd');
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [conteudo, setConteudo] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [empresaSelecionada, setEmpresaSelecionada] = useState<string>(store.activeCompanyId);
  const [periodo, setPeriodo] = useState<PeriodoConfig>(getPeriodoAtual('ecd'));
  const [showPreview, setShowPreview] = useState(false);

  const empresas = store.companies || [];
  const config = getContabilConfig();

  const handleGerar = async () => {
    setLoading(true);
    setError(null);
    setGenerated(false);
    setConteudo('');

    try {
      let generator: SpedEcdGenerator | SpedEcfGenerator;

      if (tipoSped === 'ecd') {
        generator = new SpedEcdGenerator({
          companyId: empresaSelecionada,
          periodo: periodo,
          ambiente: config.sped.ambiente,
        });
      } else {
        const company = empresas.find(c => c.id === empresaSelecionada);
        generator = new SpedEcfGenerator({
          companyId: empresaSelecionada,
          periodo: periodo,
          ambiente: config.sped.ambiente,
          regimeTributario: company?.tax_regime || 'actual_profit',
        });
      }

      const content = generator.generate();
      setConteudo(content);
      setGenerated(true);

      // Salvar no localStorage para preview
      localStorage.setItem(`nex_sped_${tipoSped}_${empresaSelecionada}`, content);

    } catch (err: any) {
      setError(err.message || 'Erro ao gerar arquivo SPED');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!conteudo) return;

    const blob = new Blob([conteudo], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    const empresa = empresas.find(c => c.id === empresaSelecionada);
    const cnpj = empresa?.cnpj.replace(/\D/g, '') || '00000000000000';
    const ano = periodo.ano;
    const mes = String(periodo.mes_fim).padStart(2, '0');
    
    a.href = url;
    a.download = `${tipoSped.toUpperCase()}_${cnpj}_${ano}${mes}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImprimir = () => {
    if (!conteudo) return;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`<pre style="font-family: monospace; font-size: 11px;">${conteudo}</pre>`);
      win.document.close();
      win.print();
    }
  };

  const handleValidar = () => {
    if (!conteudo) return;

    // Validação simples: verificar registros obrigatórios
    const linhas = conteudo.split('\n');
    const registros = linhas.map(l => l.split('|')[0]);

    const obrigatorios = ['0000', '0001', '9990', '9999'];
    const faltando = obrigatorios.filter(r => !registros.includes(r));

    if (faltando.length > 0) {
      alert(`⚠️ Registros obrigatórios ausentes: ${faltando.join(', ')}`);
    } else {
      alert(`✅ Arquivo SPED válido! ${linhas.length} linhas geradas.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileArchive className="w-5 h-5 text-cyan-400" />
              Gerador SPED - ECD / ECF
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Escrituração Contábil Digital e Fiscal - Layout RFB
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className={`px-2.5 py-1 rounded-full font-bold ${
              config.sped.ambiente === 'producao' 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              {config.sped.ambiente === 'producao' ? '🔒 Produção' : '🧪 Homologação'}
            </span>
            <span className="text-slate-400 font-mono">v{config.sped.versao}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Empresa */}
          <div>
            <label className="text-xs text-slate-400 block mb-1 font-semibold">Empresa</label>
            <select
              value={empresaSelecionada}
              onChange={e => setEmpresaSelecionada(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white text-sm outline-none cursor-pointer"
            >
              {empresas.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.trade_name || emp.legal_name}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo */}
          <div>
            <label className="text-xs text-slate-400 block mb-1 font-semibold">Tipo de SPED</label>
            <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setTipoSped('ecd')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  tipoSped === 'ecd' 
                    ? 'bg-cyan-500 text-slate-950' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ECD
              </button>
              <button
                onClick={() => setTipoSped('ecf')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  tipoSped === 'ecf' 
                    ? 'bg-emerald-500 text-slate-950' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ECF
              </button>
            </div>
          </div>

          {/* Ano */}
          <div>
            <label className="text-xs text-slate-400 block mb-1 font-semibold">Ano de Referência</label>
            <input
              type="number"
              value={periodo.ano}
              onChange={e => setPeriodo({...periodo, ano: Number(e.target.value)})}
              className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white text-sm outline-none"
              min={2020}
              max={2030}
            />
          </div>

          {/* Ações */}
          <div className="flex items-end gap-2">
            <button
              onClick={handleGerar}
              disabled={loading}
              className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Gerar {tipoSped.toUpperCase()}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-2xl text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-400" />
          {error}
        </div>
      )}

      {/* Success */}
      {generated && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl text-emerald-300 text-sm flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Arquivo {tipoSped.toUpperCase()} gerado com sucesso!</span>
            <span className="text-[10px] text-emerald-400/70 font-mono">
              {conteudo.split('\n').length} linhas
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              {showPreview ? 'Ocultar' : 'Preview'}
            </button>
            <button
              onClick={handleValidar}
              className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg text-xs flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Validar
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
            <button
              onClick={handleImprimir}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir
            </button>
          </div>
        </div>
      )}

      {/* Preview */}
      {showPreview && generated && conteudo && (
        <div className="bg-slate-950/80 border border-white/10 rounded-2xl overflow-hidden">
          <div className="bg-slate-950/60 px-4 py-2 border-b border-white/5 flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono">📄 Preview do Arquivo {tipoSped.toUpperCase()}</span>
            <span className="font-mono text-[10px]">UTF-8 • Layout Fixo</span>
          </div>
          <pre className="p-4 text-[10px] font-mono text-slate-300 overflow-x-auto max-h-[500px] overflow-y-auto">
            {conteudo.split('\n').slice(0, 100).join('\n')}
            {conteudo.split('\n').length > 100 && (
              <div className="text-slate-500 mt-2">... e mais {conteudo.split('\n').length - 100} linhas</div>
            )}
          </pre>
        </div>
      )}

      {/* Informações */}
      <div className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block">📋 Empresa</span>
            <span className="text-white font-bold">
              {empresas.find(e => e.id === empresaSelecionada)?.trade_name || 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">📅 Período</span>
            <span className="text-white font-mono">
              {periodo.data_inicio} a {periodo.data_fim}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">🔢 Total de Linhas</span>
            <span className="text-cyan-400 font-mono font-bold">
              {generated ? conteudo.split('\n').length : 'Aguardando geração'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};