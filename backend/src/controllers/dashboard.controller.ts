// C:\emissornfe\backend\src\controllers\dashboard.controller.ts

import { Request, Response } from 'express';
import { NfeService } from '../services/nfe.service';
import { NfseService } from '../services/nfse.service';
import { FinanceiroService } from '../services/financeiro.service';
import { ProdutoService } from '../services/produto.service';
import { ClienteService } from '../services/cliente.service';

export class DashboardController {
  private nfeService: NfeService;
  private nfseService: NfseService;
  private financeiroService: FinanceiroService;
  private produtoService: ProdutoService;
  private clienteService: ClienteService;

  constructor() {
    this.nfeService = new NfeService();
    this.nfseService = new NfseService();
    this.financeiroService = new FinanceiroService();
    this.produtoService = new ProdutoService();
    this.clienteService = new ClienteService();
  }

  async getDashboard(req: Request, res: Response) {
    try {
      const empresaId = req.user?.empresaId;
      if (!empresaId) {
        return res.status(401).json({ sucesso: false, erro: 'Não autenticado' });
      }

      // Período: mês atual
      const hoje = new Date();
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

      // Busca dados em paralelo
      const [
        vendasNfe,
        faturamentoNfse,
        resumoFinanceiro,
        produtos,
        clientes,
        nfesMes,
        nfsesMes
      ] = await Promise.all([
        this.nfeService.getTotalVendas(empresaId, inicioMes, fimMes),
        this.nfseService.getTotalFaturado(empresaId, inicioMes, fimMes),
        this.financeiroService.resumo(empresaId),
        this.produtoService.listar(empresaId, 1, 5),
        this.clienteService.listar(empresaId, 1, 5),
        this.nfeService.listarNfes(empresaId, 1, 100),
        this.nfseService.listarNfses(empresaId, 1, 100),
      ]);

      // Calcula crescimento
      const mesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
      const fimMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
      
      const [vendasMesAnt] = await Promise.all([
        this.nfeService.getTotalVendas(empresaId, mesAnterior, fimMesAnterior),
      ]);

      const faturamentoTotal = vendasNfe.totalNota + (faturamentoNfse.totalServicos || 0);
      const faturamentoMesAnt = vendasMesAnt.totalNota + 0;
      const crescimento = faturamentoMesAnt > 0 
        ? ((faturamentoTotal - faturamentoMesAnt) / faturamentoMesAnt) * 100 
        : 0;

      return res.json({
        sucesso: true,
        dados: {
          faturamentoTotal,
          totalNfes: nfesMes.data.length + nfsesMes.data.length,
          totalClientes: clientes.data.length || 0,
          totalProdutos: produtos.data.length || 0,
          aReceber: resumoFinanceiro.totalAReceber || 0,
          aPagar: resumoFinanceiro.totalAPagar || 0,
          crescimento: Number(crescimento.toFixed(2)),
          nfesMes: nfesMes.data.length,
          faturamentoMes: faturamentoTotal,
          comparativoMes: faturamentoTotal - faturamentoMesAnt,
          ultimasNotas: [
            ...nfesMes.data.slice(0, 3),
            ...nfsesMes.data.slice(0, 3)
          ].sort((a, b) => 
            new Date(b.dataHoraEmissao).getTime() - new Date(a.dataHoraEmissao).getTime()
          ).slice(0, 5)
        }
      });

    } catch (error: any) {
      return res.status(500).json({ sucesso: false, erro: error.message });
    }
  }
}