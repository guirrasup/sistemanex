// src/components/SpedValidatorView.tsx

import React, { useState } from 'react';
import { SpedValidator } from '../services/sped/SpedValidator';
import { CheckCircle2, XCircle, AlertTriangle, FileCheck, Upload, RefreshCw } from 'lucide-react';

export const SpedValidatorView: React.FC = () => {
  const [content, setContent] = useState('');
  const [resultado, setResultado] = useState<any>(null);
  const [tipo, setTipo] = useState<'ecd' | 'ecf'>('ecd');
  const [loading, setLoading] = useState(false);

  const handleValidate = () => {
    if (!content.trim()) {
      alert('Cole o conteúdo do arquivo SPED para validar');
      return;
    }

    setLoading(true);
    try {
      const validator = new SpedValidator();
      const result = validator.validate(content, tipo);
      setResultado(result);
    } catch (err: any) {
      alert(`Erro na validação: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setContent(event.target?.result as string);
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    setContent('');
    setResultado(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-cyan-400" />
              Validador de Arquivos SPED
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Validação sintática e semântica de arquivos ECD e ECF
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1 font-semibold">Tipo de SPED</label>
            <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setTipo('ecd')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  tipo === 'ecd' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                ECD
              </button>
              <button
                onClick={() => setTipo('ecf')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  tipo === 'ecf' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                ECF
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1 font-semibold">Upload do Arquivo</label>
            <div className="flex items-center gap-2">
              <label className="flex-1 px-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-slate-400 cursor-pointer hover:border-cyan-500/30 transition-all text-center">
                <Upload className="w-4 h-4 inline mr-2" />
                Selecionar arquivo
                <input
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={handleValidate}
              disabled={loading || !content.trim()}
              className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Validando...
                </>
              ) : (
                <>
                  <FileCheck className="w-4 h-4" />
                  Validar
                </>
              )}
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm"
            >
              Limpar
            </button>
          </div>
        </div>
      </div>

      {/* Content Input */}
      <div>
        <label className="text-xs text-slate-400 block mb-1 font-semibold">Conteúdo do Arquivo SPED</label>
        <textarea
          rows={10}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Cole aqui o conteúdo do arquivo SPED (formato TXT) para validação..."
          className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-xs font-mono text-slate-300 outline-none focus:border-cyan-500"
        />
      </div>

      {/* Resultado */}
      {resultado && (
        <div className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {resultado.valido ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              ) : (
                <XCircle className="w-8 h-8 text-rose-400" />
              )}
              <div>
                <h3 className={`text-lg font-bold ${resultado.valido ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {resultado.valido ? 'Arquivo Válido!' : 'Arquivo com Erros'}
                </h3>
                <p className="text-xs text-slate-400">
                  {resultado.estatisticas.total_linhas} linhas • {Object.keys(resultado.estatisticas.total_por_registro).length} tipos de registros
                </p>
              </div>
            </div>

            <span className="text-xs bg-slate-950 px-3 py-1 rounded-full border border-white/10 font-mono">
              {tipo.toUpperCase()} v{resultado.tipo === 'ecd' ? '9.0' : '9.0'}
            </span>
          </div>

          {/* Erros */}
          {resultado.erros.length > 0 && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4">
              <h4 className="text-xs font-bold text-rose-400 mb-2 flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                {resultado.erros.length} erro(s) encontrado(s)
              </h4>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {resultado.erros.map((erro: any, idx: number) => (
                  <div key={idx} className="text-xs font-mono text-rose-300 bg-rose-950/50 p-2 rounded">
                    <span className="text-rose-500">Linha {erro.linha}</span>
                    {' • '}
                    <span className="font-bold">{erro.registro}</span>
                    {erro.campo && <span> • Campo: {erro.campo}</span>}
                    <br />
                    <span className="text-rose-400">{erro.erro}</span>
                    {erro.sugericao && (
                      <span className="text-rose-400/70 block text-[10px] ml-2">
                        💡 {erro.sugericao}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Avisos */}
          {resultado.avisos.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
              <h4 className="text-xs font-bold text-amber-400 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {resultado.avisos.length} aviso(s)
              </h4>
              <div className="space-y-1">
                {resultado.avisos.map((aviso: any, idx: number) => (
                  <div key={idx} className="text-xs text-amber-300">
                    {aviso.mensagem}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Estatísticas */}
          <div className="bg-slate-950/60 border border-white/5 rounded-xl p-4">
            <h4 className="text-xs font-bold text-slate-400 mb-2">📊 Estatísticas do Arquivo</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-slate-500 block">Total de Linhas</span>
                <span className="text-white font-bold font-mono">{resultado.estatisticas.total_linhas}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Registros Únicos</span>
                <span className="text-white font-bold font-mono">{resultado.estatisticas.registros_unicos.length}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Registro mais frequente</span>
                <span className="text-cyan-400 font-bold font-mono">
                  {(Object.entries(resultado.estatisticas.total_por_registro) as [string, number][])
                    .sort((a, b) => b[1] - a[1])[0]?.[0] || '-'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Frequência</span>
                <span className="text-emerald-400 font-bold font-mono">
                  {(Object.values(resultado.estatisticas.total_por_registro) as number[])
                    .sort((a, b) => b - a)[0] || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(resultado, null, 2));
                alert('Relatório copiado para a área de transferência');
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs flex items-center gap-1.5"
            >
              📋 Copiar Relatório
            </button>
            {resultado.valido && (
              <button
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                ✅ Enviar para RFB
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};