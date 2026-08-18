// src/services/sped/SpedValidator.ts

import { ValidacaoSped } from '../../types/contabil';

export class SpedValidator {
  validate(content: string, tipo: 'ecd' | 'ecf'): ValidacaoSped {
    const linhas = content.split('\n');
    const erros: ValidacaoSped['erros'] = [];
    const avisos: ValidacaoSped['avisos'] = [];
    const registros: string[] = [];
    const totalPorRegistro: Record<string, number> = {};

    const obrigatoriosECD = ['0000', '0001', 'I010', 'I050', 'I100', 'J005', 'J015', 'J020', 'J930', 'J935', '9990', '9999'];
    const obrigatoriosECF = ['0000', 'C001', 'C010', 'E001', 'E010', 'M001', 'M100', 'P001', 'P010', '9990', '9999'];
    const obrigatorios = tipo === 'ecd' ? obrigatoriosECD : obrigatoriosECF;

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

      if (campos.length < 2) {
        erros.push({
          linha: linhaNumero,
          registro: registro,
          campo: 'campos',
          erro: 'Linha com poucos campos',
          sugericao: 'Verifique separadores "|"',
        });
      }

      if (registro === '0000') {
        this.validarRegistro0000(campos, linhaNumero, erros);
      }

      if (tipo === 'ecd') {
        if (registro === 'I020') {
          this.validarRegistroI020(campos, linhaNumero, erros);
        }
        if (registro === 'J930') {
          this.validarRegistroJ930(campos, linhaNumero, erros);
        }
      }

      if (tipo === 'ecf') {
        if (registro === 'C100') {
          this.validarRegistroC100(campos, linhaNumero, erros);
        }
        if (registro === 'E100') {
          this.validarRegistroE100(campos, linhaNumero, erros);
        }
        if (registro === 'P010') {
          this.validarRegistroP010(campos, linhaNumero, erros);
        }
      }
    }

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

    if (linhas.length < 10) {
      avisos.push({
        linha: 0,
        registro: 'Geral',
        mensagem: 'Arquivo com poucas linhas. Verifique se todos os dados foram incluídos.',
      });
    }

    if (tipo === 'ecd' && !registros.includes('I020')) {
      erros.push({
        linha: 0,
        registro: 'I020',
        campo: 'registro',
        erro: 'Nenhum registro I020 encontrado (plano de contas)',
        sugericao: 'Adicione pelo menos uma conta contábil',
      });
    }

    if (tipo === 'ecf' && !registros.includes('C001')) {
      erros.push({
        linha: 0,
        registro: 'C001',
        campo: 'registro',
        erro: 'Registro C001 ausente (abertura do bloco C)',
        sugericao: 'Adicione o registro C001',
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

  // ===== VALIDAÇÃO REGISTRO 0000 (CORRIGIDA) =====

  private validarRegistro0000(campos: string[], linha: number, erros: any[]) {
    if (campos.length < 6) {
      erros.push({
        linha: linha,
        registro: '0000',
        campo: 'quantidade_campos',
        erro: 'Registro 0000 incompleto',
        sugericao: 'Verifique todos os campos obrigatórios do registro 0000',
      });
      return;
    }

    // CNPJ no índice 5
    const cnpj = campos[5];
    
    if (!cnpj) {
      erros.push({
        linha: linha,
        registro: '0000',
        campo: 'cnpj',
        erro: 'CNPJ não informado no registro 0000',
        sugericao: 'Preencha o CNPJ da empresa',
      });
      return;
    }

    const cnpjLimpo = cnpj.replace(/\D/g, '');
    
    if (cnpjLimpo.length !== 14) {
      erros.push({
        linha: linha,
        registro: '0000',
        campo: 'cnpj',
        erro: `CNPJ inválido: "${cnpj}" (${cnpjLimpo.length} dígitos)`,
        sugericao: 'CNPJ deve ter 14 dígitos numéricos',
      });
      return;
    }

    if (!this.validarCNPJ(cnpjLimpo)) {
      erros.push({
        linha: linha,
        registro: '0000',
        campo: 'cnpj',
        erro: `CNPJ com dígitos verificadores inválidos: ${cnpjLimpo}`,
        sugericao: 'Verifique se o CNPJ está correto',
      });
    }
  }

  // ===== VALIDAÇÃO CNPJ =====

  private validarCNPJ(cnpj: string): boolean {
    if (cnpj.length !== 14) return false;
    if (/^(\d)\1+$/.test(cnpj)) return false;

    let tamanho = 12;
    let soma = 0;
    let pos = 0;
    const pesos = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    for (let i = 0; i < tamanho; i++) {
      soma += parseInt(cnpj[i]) * pesos[pos];
      pos++;
    }

    let resto = soma % 11;
    let digito = resto < 2 ? 0 : 11 - resto;
    if (digito !== parseInt(cnpj[12])) return false;

    tamanho = 13;
    soma = 0;
    pos = 0;
    const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    for (let i = 0; i < tamanho; i++) {
      soma += parseInt(cnpj[i]) * pesos2[pos];
      pos++;
    }

    resto = soma % 11;
    digito = resto < 2 ? 0 : 11 - resto;
    if (digito !== parseInt(cnpj[13])) return false;

    return true;
  }

  // ===== OUTRAS VALIDAÇÕES =====

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
  }

  private validarRegistroC100(campos: string[], linha: number, erros: any[]) {
    if (campos.length < 11) {
      erros.push({
        linha: linha,
        registro: 'C100',
        campo: 'quantidade_campos',
        erro: 'Registro C100 incompleto',
        sugericao: 'Verifique os campos do registro C100',
      });
    }
  }

  private validarRegistroE100(campos: string[], linha: number, erros: any[]) {
    if (campos.length < 5) {
      erros.push({
        linha: linha,
        registro: 'E100',
        campo: 'quantidade_campos',
        erro: 'Registro E100 incompleto',
        sugericao: 'Verifique os campos do registro E100',
      });
    }
  }

  private validarRegistroP010(campos: string[], linha: number, erros: any[]) {
    if (campos.length < 8) {
      erros.push({
        linha: linha,
        registro: 'P010',
        campo: 'quantidade_campos',
        erro: 'Registro P010 incompleto',
        sugericao: 'Verifique os campos do registro P010',
      });
    }
  }
}