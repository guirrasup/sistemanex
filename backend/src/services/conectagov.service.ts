// C:\emissornfe\backend\src\services\conectagov.service.ts

import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { ConectaGovTokenResponse, ConectaGovEmpresaResponse } from '../types/cnpj.js';

/**
 * 🔥 SERVIÇO DE AUTENTICAÇÃO CONECTAGOV
 * Obtém token JWT para acessar as APIs
 */
export class ConectaGovService {
  private static instance: ConectaGovService;
  private token: string | null = null;
  private tokenExpiresAt: number = 0;

  static getInstance(): ConectaGovService {
    if (!ConectaGovService.instance) {
      ConectaGovService.instance = new ConectaGovService();
    }
    return ConectaGovService.instance;
  }

  /**
   * 🔥 OBTÉM TOKEN JWT DO CONECTAGOV VIA OAUTH2
   */
  async getToken(): Promise<string> {
    if (this.token && this.tokenExpiresAt > Date.now() + 60000) {
      return this.token;
    }

    const clientId = process.env.CONECTAGOV_CLIENT_ID || '';
    const clientSecret = process.env.CONECTAGOV_CLIENT_SECRET || '';
    const cpfUsuario = process.env.CONECTAGOV_CPF_USUARIO || '';

    if (!clientId || !clientSecret) {
      throw new Error('Credenciais do ConectaGov não configuradas. Configure CONECTAGOV_CLIENT_ID e CONECTAGOV_CLIENT_SECRET');
    }

    if (!cpfUsuario || cpfUsuario.length < 11) {
      throw new Error('CPF do usuário não configurado. Configure CONECTAGOV_CPF_USUARIO');
    }

    try {
      console.log('🔑 Obtendo token do ConectaGov...');

      const tokenUrl = process.env.NODE_ENV === 'production'
        ? 'https://apigateway.conectagov.estaleiro.serpro.gov.br/oauth2/jwt-token'
        : 'https://h-apigateway.conectagov.np.estaleiro.serpro.gov.br/oauth2/jwt-token';

      // 🔥 GERA JWT PARA AUTENTICAÇÃO (client_assertion)
      const clientAssertion = this.generateClientAssertion(clientId);

      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');
      params.append('client_id', clientId);
      params.append('client_secret', clientSecret);
      params.append('client_assertion_type', 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer');
      params.append('client_assertion', clientAssertion);
      params.append('scope', 'api-cnpj-v1');

      const response = await axios.post<ConectaGovTokenResponse>(tokenUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 30000,
      });

      this.token = response.data.access_token;
      this.tokenExpiresAt = Date.now() + (response.data.expires_in * 1000);

      console.log('✅ Token ConectaGov obtido com sucesso!');
      return this.token;
    } catch (error: any) {
      console.error('❌ Erro ao obter token ConectaGov:', error.response?.data || error.message);
      throw new Error(`Erro na autenticação ConectaGov: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * 🔥 GERA CLIENT ASSERTION (JWT) PARA AUTENTICAÇÃO
   */
  private generateClientAssertion(clientId: string): string {
    const now = Math.floor(Date.now() / 1000);
    const jti = randomBytes(16).toString('hex');

    const payload = {
      iss: clientId,
      sub: clientId,
      aud: 'https://apigateway.conectagov.estaleiro.serpro.gov.br/oauth2/jwt-token',
      jti: jti,
      iat: now,
      exp: now + 300,
    };

    const privateKey = process.env.CONECTAGOV_PRIVATE_KEY || '';
    
    if (!privateKey) {
      throw new Error('Chave privada do ConectaGov não configurada. Configure CONECTAGOV_PRIVATE_KEY');
    }

    return jwt.sign(payload, privateKey, { algorithm: 'RS256' });
  }

  /**
   * 🔥 CONSULTA CNPJ NA API CONECTAGOV
   */
  async consultarCnpj(cnpj: string, cpfUsuario?: string): Promise<ConectaGovEmpresaResponse> {
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    
    if (cnpjLimpo.length !== 14) {
      throw new Error('CNPJ inválido. Digite 14 dígitos.');
    }

    const token = await this.getToken();
    const cpf = cpfUsuario || process.env.CONECTAGOV_CPF_USUARIO || '';

    if (!cpf || cpf.length < 11) {
      throw new Error('CPF do usuário não configurado');
    }

    try {
      console.log(`🔍 Consultando ConectaGov para CNPJ: ${cnpjLimpo}`);

      const baseUrl = process.env.NODE_ENV === 'production'
        ? 'https://apigateway.conectagov.estaleiro.serpro.gov.br'
        : 'https://h-apigateway.conectagov.np.estaleiro.serpro.gov.br';

      const url = `${baseUrl}/api-cnpj-basica/v2/basica/${cnpjLimpo}`;

      const response = await axios.get<ConectaGovEmpresaResponse>(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-cpf-usuario': cpf,
          'Accept': 'application/json',
        },
        timeout: 30000,
      });

      console.log('✅ Dados obtidos do ConectaGov');
      return response.data;

    } catch (error: any) {
      console.error('❌ Erro ao consultar ConectaGov:', error.response?.data || error.message);

      if (error.response?.status === 401) {
        this.token = null;
        this.tokenExpiresAt = 0;
        return this.consultarCnpj(cnpj, cpfUsuario);
      }

      throw new Error(error.response?.data?.message || error.message || 'Erro na consulta');
    }
  }
}