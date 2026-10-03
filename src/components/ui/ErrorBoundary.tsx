// src/components/ui/ErrorBoundary.tsx
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  // Tela cheia (raiz do app) ou cartão dentro da área de conteúdo.
  variante?: 'tela' | 'secao';
  onVoltar?: () => void;
}

interface ErrorBoundaryState {
  erro: Error | null;
}

// Captura erros de renderização dos filhos para que uma falha em uma tela não
// derrube o app inteiro (sem boundary, o React desmonta a árvore toda).
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { erro: null };

  static getDerivedStateFromError(erro: Error): ErrorBoundaryState {
    return { erro };
  }

  componentDidCatch(erro: Error, info: React.ErrorInfo) {
    console.error('❌ Erro de renderização capturado pelo ErrorBoundary:', erro, info.componentStack);
  }

  private tentarNovamente = () => {
    this.setState({ erro: null });
  };

  render() {
    const { erro } = this.state;
    if (!erro) return this.props.children;

    const { variante = 'secao', onVoltar } = this.props;
    const telaCheia = variante === 'tela';

    return (
      <div className={telaCheia ? 'min-h-screen flex items-center justify-center bg-slate-50 p-4' : 'py-12 flex justify-center'}>
        <div role="alert" className="bg-white border border-rose-200 rounded-2xl shadow-sm p-6 max-w-lg w-full text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Algo deu errado nesta tela</h2>
            <p className="text-sm text-slate-500 mt-1">
              {telaCheia
                ? 'Ocorreu um erro inesperado. Recarregue a página para continuar.'
                : 'Ocorreu um erro inesperado. Os demais módulos continuam funcionando.'}
            </p>
          </div>
          <pre className="text-left text-[11px] text-rose-700 bg-rose-50 border border-rose-100 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-words">
            {erro.message}
          </pre>
          <div className="flex items-center justify-center gap-2">
            {telaCheia ? (
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Recarregar página
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={this.tentarNovamente}
                  className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  Tentar novamente
                </button>
                {onVoltar && (
                  <button
                    type="button"
                    onClick={onVoltar}
                    className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer"
                  >
                    Voltar ao painel
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
}
