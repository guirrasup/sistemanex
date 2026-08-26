// C:\emissornfe\src\services\api.ts

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';

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

    console.log('🔑 Token:', token ? `✅ Presente (${token.substring(0, 20)}...)` : '❌ Ausente');
    console.log('📡 Requisição:', config.method?.toUpperCase(), config.url);

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
    console.log('✅ Resposta:', response.status, response.config.url);
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
      console.log(`⏳ Aguardando ${delay}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return api.request(config);
    }
    
    // 🔥 LOG DE ERROS MAS NÃO REMOVE O TOKEN
    if (error.response?.status === 401) {
      console.warn('⚠️ Erro 401 na rota:', error.config?.url);
      console.warn('⚠️ O token pode estar inválido, mas NÃO vamos removê-lo automaticamente.');
      // 🔥 NÃO REMOVE O TOKEN - DEIXA O USUÁRIO DECIDIR
    }
    
    console.error('❌ Erro na resposta:', error.response?.status, error.config?.url);
    return Promise.reject(error);
  }
);

export default api;