// C:\emissornfe\backend\src\controllers\cnpj.controller.ts

import { Request, Response } from 'express';
import { ConectaGovService } from '../services/conectagov.service';

export class CnpjController {
  private conectaGovService: ConectaGovService;

  constructor() {
    this.conectaGovService = ConectaGovService.getInstance();
  }

  /**
   * 🔥 CONSULTA CNPJ - SUPORTE A DATASETS
   * GET /api/cnpj/consultar/:cnpj?datasets=receita,rntrc
   */
  async consultar(req: Request, res: Response) {
    try {
      const { cnpj } = req.params;
      const datasets = (req.query.datasets as string)?.split(',') || ['receita'];
      const cpfUsuario = req.headers['x-cpf-usuario'] as string || req.user?.cpf;

      // 🔥 VALIDA CNPJ
      const cnpjLimpo = cnpj.replace(/\D/g, '');
      if (cnpjLimpo.length !== 14) {
        return res.status(400).json({
          sucesso: false,
          erro: 'CNPJ inválido. Digite 14 dígitos.'
        });
      }

      // 🔥 CONSULTA CONECTAGOV
      const data = await this.conectaGovService.consultarCnpj(cnpjLimpo, cpfUsuario);

      // 🔥 MAPEIA DADOS
      return res.json({
        sucesso: true,
        dados: {
          cnpj: data.ni || cnpjLimpo,
          razaoSocial: data.nomeEmpresarial || '',
          nomeFantasia: data.nomeFantasia || '',
          situacaoCadastral: data.situacaoCadastral?.codigo || '',
          situacaoCadastralDescricao: data.situacaoCadastral?.motivo || '',
          dataSituacaoCadastral: data.situacaoCadastral?.data || '',
          naturezaJuridica: data.naturezaJuridica?.descricao || '',
          naturezaJuridicaCodigo: data.naturezaJuridica?.codigo || '',
          dataAbertura: data.dataAbertura || '',
          cnaePrincipal: data.cnaePrincipal?.codigo || '',
          cnaePrincipalDescricao: data.cnaePrincipal?.descricao || '',
          cnaeSecundarios: data.cnaeSecundarias?.map((c: any) => ({
            codigo: c.codigo || '',
            descricao: c.descricao || ''
          })) || [],
          endereco: {
            tipoLogradouro: data.endereco?.tipoLogradouro || '',
            logradouro: data.endereco?.logradouro || '',
            numero: data.endereco?.numero || 'S/N',
            complemento: data.endereco?.complemento || '',
            bairro: data.endereco?.bairro || '',
            cep: data.endereco?.cep || '',
            municipio: data.endereco?.municipio?.descricao || '',
            codigoMunicipio: data.endereco?.municipio?.codigo || '',
            uf: data.endereco?.uf || '',
            pais: data.endereco?.pais?.descricao || 'BRASIL',
            codigoPais: data.endereco?.pais?.codigo || '1058',
          },
          telefone: data.telefone?.map((t: any) => ({
            ddd: t.ddd || '',
            numero: t.numero || ''
          })) || [],
          email: data.correioEletronico || '',
          capitalSocial: data.capitalSocial ? parseFloat(data.capitalSocial) / 100 : 0,
          porte: data.porte || '',
          situacaoEspecial: data.situacaoEspecial || '',
          dataSituacaoEspecial: data.dataSituacaoEspecial || '',
          optanteSimples: data.informacoesAdicionais?.optanteSimples === 'S',
          optanteMEI: data.informacoesAdicionais?.optanteMei === 'S',
          socios: data.socios?.map((s: any) => ({
            tipo: s.tipoSocio || '',
            cpf: s.cpf || '',
            nome: s.nome || '',
            qualificacao: s.qualificacao || '',
            dataInclusao: s.dataInclusao || '',
          })) || [],
          // 🔥 ADICIONA DATASETS SOLICITADOS
          datasets: {
            receita: datasets.includes('receita'),
            rntrc: datasets.includes('rntrc'),
            cno: datasets.includes('cno'),
            ceis: datasets.includes('ceis'),
            cnep: datasets.includes('cnep'),
          }
        }
      });

    } catch (error: any) {
      console.error('Erro na consulta CNPJ:', error);
      
      let mensagem = error.message || 'Erro desconhecido';
      let status = 500;

      if (mensagem.includes('CNPJ inválido')) {
        status = 400;
      } else if (mensagem.includes('não encontrado') || mensagem.includes('404')) {
        status = 404;
        mensagem = 'CNPJ não encontrado na base da Receita Federal';
      } else if (mensagem.includes('credenciais') || mensagem.includes('autenticação')) {
        status = 401;
        mensagem = 'Credenciais do ConectaGov inválidas. Verifique o arquivo .env';
      } else if (mensagem.includes('timeout') || mensagem.includes('504')) {
        status = 504;
        mensagem = 'Tempo limite excedido. O serviço da Receita Federal está lento.';
      }

      return res.status(status).json({
        sucesso: false,
        erro: mensagem
      });
    }
  }

  /**
   * 🔥 CONSULTA CNPJ COM DATASETS PERSONALIZADOS
   * GET /api/cnpj/consultar-completo/:cnpj
   */
  async consultarCompleto(req: Request, res: Response) {
    try {
      const { cnpj } = req.params;
      const cpfUsuario = req.headers['x-cpf-usuario'] as string || req.user?.cpf;

      const cnpjLimpo = cnpj.replace(/\D/g, '');
      if (cnpjLimpo.length !== 14) {
        return res.status(400).json({
          sucesso: false,
          erro: 'CNPJ inválido. Digite 14 dígitos.'
        });
      }

      // Busca dados com todos os datasets
      const data = await this.conectaGovService.consultarCnpjCompleto(cnpjLimpo, cpfUsuario);

      return res.json({
        sucesso: true,
        dados: data
      });

    } catch (error: any) {
      console.error('Erro na consulta completa:', error);
      return res.status(500).json({
        sucesso: false,
        erro: error.message || 'Erro na consulta'
      });
    }
  }
}