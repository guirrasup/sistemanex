// src/main.tsx
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import '@fontsource-variable/inter';
import '@fontsource-variable/plus-jakarta-sans';
import '@fontsource-variable/jetbrains-mono';
import '@fontsource-variable/manrope';
import '@fontsource-variable/dm-sans';
import './index.css';
import { aplicarTema, carregarTema } from './utils/tema';

// Tema salvo em Configurações → Aparência, aplicado antes do primeiro render.
aplicarTema(carregarTema());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary variante="tela">
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
