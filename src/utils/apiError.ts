// src/utils/apiError.ts
import axios from 'axios';

export function getApiErrorMessage(error: unknown, fallback = 'Erro inesperado'): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.erro || error.response?.data?.mensagem || error.response?.data?.message || error.message || fallback;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}
