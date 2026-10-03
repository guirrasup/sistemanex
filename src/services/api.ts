// src/services/api.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';

// Disparado quando o backend recusa a sessão; o App volta para a tela de login.
export const EVENTO_SESSAO_EXPIRADA = 'sup:sessao-expirada';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 35000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 🔥 CONTADOR DE REQUISIÇÕES PARA RATE LIMITING
let requestCount = 0;
let requestWindowStart = Date.now();
const MAX_REQUESTS_PER_SECOND = 8;

// 🔥 INTERCEPTOR DE REQUISIÇÃO - CORRIGIDO
api.interceptors.request.use(
  (config) => {
    // 1. Coloca o token PRIMEIRO (antes de qualquer rate limit)
    const token = localStorage.getItem('@sup:token') || localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

        
    // 2. Rate limiting (agora o token já está no config)
    const now = Date.now();
    if (now - requestWindowStart > 1000) {
      requestCount = 0;
      requestWindowStart = now;
    }

    if (requestCount >= MAX_REQUESTS_PER_SECOND) {
      return new Promise((resolve) => {
        setTimeout(() => {
          requestCount = 0;
          requestWindowStart = Date.now();
          resolve(config); // agora o config já tem o Authorization
        }, 120);
      });
    }

    requestCount++;
    return config;
  },
  (error) => {
    console.error('❌ Erro no interceptor de requisição:', error);
    return Promise.reject(error);
  }
);

// 🔥 INTERCEPTOR DE RESPOSTA - SIMPLIFICADO (SEM 401)
api.interceptors.response.use(
  (response) => {
        return response;
  },
  async (error) => {
    // 🔥 TRATAMENTO PARA 429 (Too Many Requests)
    if (error.response?.status === 429) {
      console.warn('⚠️ Rate limit excedido (429). Aguardando retry...');
      
      const config = error.config;
      config.__retryCount = config.__retryCount || 0;
      
      if (config.__retryCount >= 3) {
        console.error('❌ Máximo de retries atingido para 429');
        return Promise.reject(error);
      }
      
      config.__retryCount++;
      
      const delay = Math.pow(2, config.__retryCount - 1) * 1000;
            
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return api.request(config);
    }
    
    // Sessão expirada/inválida: só quando o middleware de autenticação diz isso
    // explicitamente (codigo SESSAO_INVALIDA). Outros 401 — ex.: senha errada no
    // login — não derrubam a sessão. Antes o token morto era mantido e toda
    // chamada seguinte falhava com "Token inválido" sem o usuário saber o motivo.
    if (error.response?.status === 401 && error.response?.data?.codigo === 'SESSAO_INVALIDA') {
      localStorage.removeItem('@sup:token');
      localStorage.removeItem('token');
      localStorage.removeItem('@sup:user');
      window.dispatchEvent(new CustomEvent(EVENTO_SESSAO_EXPIRADA));
    }
    
    console.error('❌ Erro na resposta:', error.response?.status, error.config?.url);
    return Promise.reject(error);
  }
);

export default api;