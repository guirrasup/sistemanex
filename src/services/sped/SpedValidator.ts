// src/services/sped/SpedValidator.ts

import { ValidacaoSped } from '../../types/contabil';

export class SpedValidator {
  validate(content: string, tipo: 'ecd' | 'ecf'): ValidacaoSped {
    const linhas = content.split('\n');
    const erros: ValidacaoSped['erros'] = [];
    const avisos: ValidacaoSped['avisos'] = [];
    const registros: string[] = [];
    const totalPorRegistro: Record<string, number> = {};

    // Registros obrigatórios por tipo
    const obrigatorios = tipo === 'ecd'
      ? ['0000', '0001', 'I010', 'I050', 'I100', 'J005', 'J015', 'J020', 'J930', 'J935', '9990', '9999']
      : ['0000', 'C001', 'C010', 'E001', 'E010', 'M001', 'M100', 'P001', 'P010', '9990', '9999'];

    let linhaNumero = 0;

    for (const linha of linhas) {
      linhaNumero++;
      if (!linha.trim()) continue;

      const campos = linha.split('|');
      const registro = campos[0];

      if (!registro) {
        erros.push({
          linha: linhaNumero,
          registro: 'N/A',
          campo: 'registro',
          erro: 'Registro não identificado',
          sugericao: 'Verifique o formato da linha',
        });
        continue;
      }

      registros.push(registro);
      totalPorRegistro[registro] = (totalPorRegistro[registro] || 0) + 1;

      // Validação básica de campos
      if (campos.length < 2) {
        erros.push({
          linha: linhaNumero,
          registro: registro,
          campo: 'campos',
          erro: 'Linha com poucos campos',
          sugericao: 'Verifique separadores "|"',
        });
      }

      // Validação de registros específicos
      if (registro === '0000') {
        this.validarRegistro0000(campos, linhaNumero, erros);
      }

      if (registro === 'I020' && tipo === 'ecd') {
        this.validarRegistroI020(campos, linhaNumero, erros);
      }

      if (registro === 'J930' && tipo === 'ecd') {
        this.validarRegistroJ930(campos, linhaNumero, erros);
      }
    }

    // Verifica registros obrigatórios
    for (const obrigatorio of obrigatorios) {
      if (!registros.includes(obrigatorio)) {
        erros.push({
          linha: 0,
          registro: obrigatorio,
          campo: 'registro',
          erro: `Registro obrigatório ausente: ${obrigatorio}`,
          sugericao: `Adicione o registro ${obrigatorio} ao arquivo`,
        });
      }
    }

    // Avisos
    if (linhas.length < 100) {
      avisos.push({
        linha: 0,
        registro: 'Geral',
        mensagem: 'Arquivo com poucas linhas. Verifique se todos os dados foram incluídos.',
      });
    }

    const valido = erros.length === 0;

    return {
      arquivo: `sped_${tipo}`,
      tipo: tipo,
      valido: valido,
      erros: erros,
      avisos: avisos,
      estatisticas: {
        total_linhas: linhas.length,
        registros_unicos: [...new Set(registros)],
        total_por_registro: totalPorRegistro,
      },
    };
  }

  private validarRegistro0000(campos: string[], linha: number, erros: any[]) {
    if (campos.length < 20) {
      erros.push({
        linha: linha,
        registro: '0000',
        campo: 'quantidade_campos',
        erro: 'Registro 0000 incompleto',
        sugericao: 'Verifique todos os campos obrigatórios do registro 0000',
      });
    }

    const cnpj = campos[4];
    if (cnpj && cnpj.length !== 14) {
      erros.push({
        linha: linha,
        registro: '0000',
        campo: 'cnpj',
        erro: 'CNPJ inválido no registro 0000',
        sugericao: 'CNPJ deve ter 14 dígitos numéricos',
      });
    }
  }

  private validarRegistroI020(campos: string[], linha: number, erros: any[]) {
    if (campos.length < 7) {
      erros.push({
        linha: linha,
        registro: 'I020',
        campo: 'quantidade_campos',
        erro: 'Registro I020 incompleto',
        sugericao: 'Verifique os campos do registro I020 (código, descrição, tipo, natureza, nível)',
      });
    }

    const tipoConta = campos[3];
    if (tipoConta && !['S', 'A'].includes(tipoConta)) {
      erros.push({
        linha: linha,
        registro: 'I020',
        campo: 'tipo_conta',
        erro: 'Tipo de conta inválido',
        sugericao: 'Use "S" para Sintética ou "A" para Analítica',
      });
    }

    const natureza = campos[4];
    if (natureza && !['D', 'C'].includes(natureza)) {
      erros.push({
        linha: linha,
        registro: 'I020',
        campo: 'natureza',
        erro: 'Natureza da conta inválida',
        sugericao: 'Use "D" para Débito ou "C" para Crédito',
      });
    }
  }

  private validarRegistroJ930(campos: string[], linha: number, erros: any[]) {
    if (campos.length < 6) {
      erros.push({
        linha: linha,
        registro: 'J930',
        campo: 'quantidade_campos',
        erro: 'Registro J930 incompleto',
        sugericao: 'Verifique nome, CPF e CRC do assinante',
      });
    }

    const cpf = campos[2];
    if (cpf && cpf.length !== 11) {
      erros.push({
        linha: linha,
        registro: 'J930',
        campo: 'cpf',
        erro: 'CPF do assinante inválido',
        sugericao: 'CPF deve ter 11 dígitos numéricos',
      });
    }
  }
}