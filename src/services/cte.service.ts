// C:\emissornfe\src\services\cte.service.ts

import api from './api';

export const cteService = {
  async listar(page: number = 1, limit: number = 50) {
    try {
      const response = await api.get('/cte', {
        params: { page, limit }
      });
      console.log('📡 CT-e response:', response.data);
      
      if (response.data && response.data.sucesso && response.data.dados) {
        return response.data.dados;
      }
      if (response.data && response.data.data) {
        return response.data;
      }
      return { data: [], total: 0, page, limit, totalPages: 0 };
    } catch (error) {
      console.error('❌ CT-e listar erro:', error);
      return { data: [], total: 0, page, limit, totalPages: 0 };
    }
  }
};