// src/components/RelatoriosContabeisView.tsx

import React, { useState } from 'react';
import { useContabil } from '../hooks/useContabil';
import { FileText, Download, Printer, Calendar, Building2, RefreshCw } from 'lucide-react';

export const RelatoriosContabeisView: React.FC = () => {
  const { loading, dre, balanco, fluxoCaixa, periodo, atualizarPeriodo, recarregar } = useContabil();
  const [tipoRelatorio, setTipoRelatorio] = useState<'dre' | 'balanco' | 'fluxo'>('dre');

  const handleExportar = () => {
    // Implementar exportação
    alert('Função de exportação em desenvolvimento');
  };

  const handleImprimir = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              Relatórios Contábeis
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              DRE, Balanço Patrimonial e Fluxo de Caixa
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setTipoRelatorio('dre')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  tipoRelatorio === 'dre' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                DRE
              </button>
              <button
                onClick={() => setTipoRelatorio('balanco')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  tipoRelatorio === 'balanco' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Balanço
              </button>
              <button
                onClick={() => setTipoRelatorio('fluxo')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  tipoRelatorio === 'fluxo' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Fluxo de Caixa
              </button>
            </div>

            <button
              onClick={recarregar}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={handleExportar}
              className="px-3 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>

            <button
              onClick={handleImprimir}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </button>
          </div>
        </div>
      </div>

      {/* Período */}
      <div className="bg-slate-900/60 border border-white/5 p-4 rounded-2xl flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400">Período:</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={periodo.data_inicio}
            onChange={(e) => atualizarPeriodo(e.target.value, periodo.data_fim)}
            className="bg-slate-950 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none"
          />
          <span className="text-slate-400">a</span>
          <input
            type="date"
            value={periodo.data_fim}
            onChange={(e) => atualizarPeriodo(periodo.data_inicio, e.target.value)}
            className="bg-slate-950 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none"
          />
        </div>
      </div>

      {/* Conteúdo do Relatório */}
      <div className="bg-white text-slate-900 rounded-2xl p-6 shadow-xl print:shadow-none">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
          </div>
        ) : (
          <>
            {tipoRelatorio === 'dre' && dre && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-center border-b border-slate-200 pb-4">
                  DEMONSTRAÇÃO DO RESULTADO DO EXERCÍCIO
                </h3>
                <p className="text-center text-sm text-slate-500">
                  Período: {new Date(dre.periodo.data_inicio).toLocaleDateString('pt-BR')} a {new Date(dre.periodo.data_fim).toLocaleDateString('pt-BR')}
                </p>

                <div className="max-w-2xl mx-auto space-y-1 font-mono text-sm">
                  <div className="flex justify-between py-2 border-b border-slate-200">
                    <span>RECEITA BRUTA</span>
                    <span className="font-bold">R$ {dre.receita_bruta.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between py-1 pl-4 text-slate-500">
                    <span>(-) ICMS</span>
                    <span>(R$ {dre.deducoes.icms.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})</span>
                  </div>
                  <div className="flex justify-between py-1 pl-4 text-slate-500">
                    <span>(-) PIS</span>
                    <span>(R$ {dre.deducoes.pis.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})</span>
                  </div>
                  <div className="flex justify-between py-1 pl-4 text-slate-500">
                    <span>(-) COFINS</span>
                    <span>(R$ {dre.deducoes.cofins.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})</span>
                  </div>
                  <div className="flex justify-between py-1 pl-4 text-slate-500">
                    <span>(-) CBS</span>
                    <span>(R$ {dre.deducoes.cbs.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})</span>
                  </div>
                  <div className="flex justify-between py-1 pl-4 text-slate-500">
                    <span>(-) IBS</span>
                    <span>(R$ {dre.deducoes.ibs.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-200 font-bold">
                    <span>RECEITA LÍQUIDA</span>
                    <span>R$ {dre.receita_liquida.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between py-1 pl-4 text-slate-500">
                    <span>(-) CMV</span>
                    <span>(R$ {dre.cmv.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-200 font-bold">
                    <span>LUCRO BRUTO</span>
                    <span className="text-emerald-600">R$ {dre.lucro_bruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between py-1 pl-4 text-slate-500">
                    <span>(-) Despesas Operacionais</span>
                    <span>(R$ {dre.despesas_operacionais.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-200 font-bold">
                    <span>LUCRO OPERACIONAL</span>
                    <span className="text-emerald-600">R$ {dre.lucro_operacional.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Resultado Financeiro</span>
                    <span className={dre.resultado_financeiro.total >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                      R$ {dre.resultado_financeiro.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, signDisplay: 'always' })}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-200 font-bold">
                    <span>LUCRO ANTES DO IR/CSLL</span>
                    <span>R$ {dre.lucro_antes_ir.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between py-1 pl-4 text-slate-500">
                    <span>(-) IRPJ</span>
                    <span>(R$ {dre.impostos.irpj.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})</span>
                  </div>
                  <div className="flex justify-between py-1 pl-4 text-slate-500">
                    <span>(-) CSLL</span>
                    <span>(R$ {dre.impostos.csll.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})</span>
                  </div>
                  <div className="flex justify-between py-3 border-t-2 border-slate-900 font-bold text-lg">
                    <span>LUCRO LÍQUIDO</span>
                    <span className={dre.lucro_liquido >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                      R$ {dre.lucro_liquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {tipoRelatorio === 'balanco' && balanco && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-center border-b border-slate-200 pb-4">
                  BALANÇO PATRIMONIAL
                </h3>
                <p className="text-center text-sm text-slate-500">
                  Em {new Date(balanco.periodo.data).toLocaleDateString('pt-BR')}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* ATIVO */}
                  <div>
                    <h4 className="font-bold text-cyan-700 border-b border-cyan-200 pb-2 mb-3">ATIVO</h4>
                    <div className="space-y-1 font-mono text-sm">
                      <div className="font-bold text-slate-700">CIRCULANTE</div>
                      <div className="flex justify-between pl-4">
                        <span>Disponível</span>
                        <span>R$ {balanco.ativo.circulante.disponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between pl-4">
                        <span>Clientes</span>
                        <span>R$ {balanco.ativo.circulante.clientes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between pl-4">
                        <span>Estoques</span>
                        <span>R$ {balanco.ativo.circulante.estoques.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between pl-4 border-t border-slate-200 pt-1 font-bold">
                        <span>Total Circulante</span>
                        <span>R$ {balanco.ativo.circulante.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>

                      <div className="mt-3 font-bold text-slate-700">NÃO CIRCULANTE</div>
                      <div className="flex justify-between pl-4">
                        <span>Imobilizado</span>
                        <span>R$ {balanco.ativo.nao_circulante.imobilizado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between pl-4 border-t border-slate-200 pt-1 font-bold">
                        <span>Total Não Circulante</span>
                        <span>R$ {balanco.ativo.nao_circulante.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>

                      <div className="flex justify-between pt-2 border-t-2 border-slate-700 font-bold text-base">
                        <span>TOTAL DO ATIVO</span>
                        <span>R$ {balanco.ativo.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>

                  {/* PASSIVO */}
                  <div>
                    <h4 className="font-bold text-rose-700 border-b border-rose-200 pb-2 mb-3">PASSIVO</h4>
                    <div className="space-y-1 font-mono text-sm">
                      <div className="font-bold text-slate-700">CIRCULANTE</div>
                      <div className="flex justify-between pl-4">
                        <span>Fornecedores</span>
                        <span>R$ {balanco.passivo.circulante.fornecedores.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between pl-4">
                        <span>Obrigações Fiscais</span>
                        <span>R$ {balanco.passivo.circulante.obrigacoes_fiscais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between pl-4 border-t border-slate-200 pt-1 font-bold">
                        <span>Total Circulante</span>
                        <span>R$ {balanco.passivo.circulante.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>

                      <div className="mt-3 font-bold text-slate-700">PATRIMÔNIO LÍQUIDO</div>
                      <div className="flex justify-between pl-4">
                        <span>Capital Social</span>
                        <span>R$ {balanco.passivo.patrimonio_liquido.capital_social.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between pl-4">
                        <span>Lucros Acumulados</span>
                        <span>R$ {balanco.passivo.patrimonio_liquido.lucros_acumulados.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between pl-4 border-t border-slate-200 pt-1 font-bold">
                        <span>Total PL</span>
                        <span>R$ {balanco.passivo.patrimonio_liquido.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>

                      <div className="flex justify-between pt-2 border-t-2 border-slate-700 font-bold text-base">
                        <span>TOTAL DO PASSIVO</span>
                        <span>R$ {balanco.passivo.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tipoRelatorio === 'fluxo' && fluxoCaixa && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-center border-b border-slate-200 pb-4">
                  DEMONSTRAÇÃO DO FLUXO DE CAIXA
                </h3>
                <p className="text-center text-sm text-slate-500">
                  Período: {new Date(fluxoCaixa.periodo.data_inicio).toLocaleDateString('pt-BR')} a {new Date(fluxoCaixa.periodo.data_fim).toLocaleDateString('pt-BR')}
                </p>

                <div className="max-w-2xl mx-auto space-y-1 font-mono text-sm">
                  <div className="font-bold text-slate-700 border-b border-slate-200 pb-2">ATIVIDADES OPERACIONAIS</div>
                  <div className="flex justify-between pl-4">
                    <span>Recebimentos de Clientes</span>
                    <span>R$ {fluxoCaixa.operacionais.recebimentos_clientes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between pl-4">
                    <span>Pagamentos a Fornecedores</span>
                    <span className="text-rose-600">(R$ {fluxoCaixa.operacionais.pagamentos_fornecedores.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})</span>
                  </div>
                  <div className="flex justify-between pl-4">
                    <span>Pagamentos de Impostos</span>
                    <span className="text-rose-600">(R$ {fluxoCaixa.operacionais.pagamentos_impostos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})</span>
                  </div>
                  <div className="flex justify-between pl-4 border-t border-slate-200 pt-1 font-bold">
                    <span>Caixa Líquido Operacional</span>
                    <span className={fluxoCaixa.operacionais.caixa_liquido_operacional >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                      R$ {fluxoCaixa.operacionais.caixa_liquido_operacional.toLocaleString('pt-BR', { minimumFractionDigits: 2, signDisplay: 'always' })}
                    </span>
                  </div>

                  <div className="mt-4 font-bold text-slate-700 border-b border-slate-200 pb-2">ATIVIDADES DE INVESTIMENTO</div>
                  <div className="flex justify-between pl-4 border-t border-slate-200 pt-1 font-bold">
                    <span>Caixa Líquido Investimento</span>
                    <span className={fluxoCaixa.investimento.caixa_liquido_investimento >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                      R$ {fluxoCaixa.investimento.caixa_liquido_investimento.toLocaleString('pt-BR', { minimumFractionDigits: 2, signDisplay: 'always' })}
                    </span>
                  </div>

                  <div className="mt-4 font-bold text-slate-700 border-b border-slate-200 pb-2">ATIVIDADES DE FINANCIAMENTO</div>
                  <div className="flex justify-between pl-4 border-t border-slate-200 pt-1 font-bold">
                    <span>Caixa Líquido Financiamento</span>
                    <span className={fluxoCaixa.financiamento.caixa_liquido_financiamento >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                      R$ {fluxoCaixa.financiamento.caixa_liquido_financiamento.toLocaleString('pt-BR', { minimumFractionDigits: 2, signDisplay: 'always' })}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t-2 border-slate-900">
                    <div className="flex justify-between font-bold">
                      <span>VARIAÇÃO DE CAIXA</span>
                      <span className={fluxoCaixa.variacao_caixa >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                        R$ {fluxoCaixa.variacao_caixa.toLocaleString('pt-BR', { minimumFractionDigits: 2, signDisplay: 'always' })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saldo Inicial</span>
                      <span>R$ {fluxoCaixa.saldo_inicial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>SALDO FINAL</span>
                      <span className={fluxoCaixa.saldo_final >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                        R$ {fluxoCaixa.saldo_final.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};