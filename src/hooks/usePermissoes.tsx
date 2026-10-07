// src/hooks/usePermissoes.tsx
// Contexto com as permissões do usuário logado, para qualquer componente
// esconder telas/botões sem precisar receber props do App.
import React, { createContext, useContext } from 'react';
import { UsuarioAuth } from '../types/erp';
import { podeVerView, primeiraViewPermitida } from '../utils/permissoes';

export interface PermissoesContexto {
  isAdmin: boolean;
  /** true se o usuário tiver a permissão. */
  pode: (chave: string) => boolean;
  /** true se o usuário tiver pelo menos uma das permissões. */
  podeAlguma: (...chaves: string[]) => boolean;
  podeVerView: (view: string) => boolean;
  /** Primeira tela que o usuário pode abrir (null = nenhuma). */
  primeiraView: () => string | null;
}

// Sem provider (ex.: telas fora do app logado) nada é permitido.
const Contexto = createContext<PermissoesContexto>({
  isAdmin: false,
  pode: () => false,
  podeAlguma: () => false,
  podeVerView: () => false,
  primeiraView: () => null,
});

export function criarPermissoes(usuario: UsuarioAuth | null): PermissoesContexto {
  const isAdmin = usuario?.perfil === 'ADMIN';
  const conjunto = new Set(usuario?.permissoes ?? []);
  const pode = (chave: string) => isAdmin || conjunto.has(chave);
  return {
    isAdmin,
    pode,
    podeAlguma: (...chaves) => chaves.some(pode),
    podeVerView: (view) => podeVerView(view, conjunto, isAdmin),
    primeiraView: () => primeiraViewPermitida(conjunto, isAdmin),
  };
}

// O App calcula o valor (com useMemo) porque também o usa fora da árvore.
export const PermissoesProvider: React.FC<{ valor: PermissoesContexto; children: React.ReactNode }> = ({ valor, children }) => (
  <Contexto.Provider value={valor}>{children}</Contexto.Provider>
);

export const usePermissoes = () => useContext(Contexto);
