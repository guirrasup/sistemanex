// src/services/sped/SpedUtils.ts

export class SpedUtils {
  /**
   * Valida se um CPF/CNPJ é válido
   */
  static validarDocumento(doc: string): boolean {
    const clean = doc.replace(/\D/g, '');
    if (clean.length === 11) return this.validarCPF(clean);
    if (clean.length === 14) return this.validarCNPJ(clean);
    return false;
  }

  private static validarCPF(cpf: string): boolean {
    if (cpf.length !== 11) return false;
    if (/^(\d)\1+$/.test(cpf)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf[i]) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf[9])) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf[i]) * (11 - i);
    }
    resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf[10])) return false;

    return true;
  }

  private static validarCNPJ(cnpj: string): boolean {
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

  /**
   * Formata data para padrão SPED (AAAAMMDD)
   */
  static formatarDataSped(data: string): string {
    return data.replace(/-/g, '');
  }

  /**
   * Formata valor para padrão SPED (com 2 casas decimais, sem separador)
   */
  static formatarValorSped(valor: number): string {
    return valor.toFixed(2).replace('.', '');
  }

  /**
   * Remove caracteres especiais para padrão SPED
   */
  static limparTextoSped(texto: string): string {
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .substring(0, 255);
  }

  /**
   * Gera chave de acesso NF-e
   */
  static gerarChaveAcesso(cnpj: string, uf: string, ano: number, mes: number, numero: string): string {
    const cnpjClean = cnpj.replace(/\D/g, '');
    const ufCode = this.getUfCode(uf);
    const anoMes = `${ano}${String(mes).padStart(2, '0')}`;
    const cNF = String(numero).padStart(9, '0');
    const modelo = '55';
    const serie = '001';
    const tpEmis = '1'; // Normal

    const chaveBase = `${ufCode}${anoMes}${cnpjClean}${modelo}${serie}${cNF}${tpEmis}${this.gerarDvChaveAcesso(
      `${ufCode}${anoMes}${cnpjClean}${modelo}${serie}${cNF}${tpEmis}`
    )}`;

    return chaveBase;
  }

  private static getUfCode(uf: string): string {
    const codigos: Record<string, string> = {
      'AC': '12', 'AL': '27', 'AM': '13', 'AP': '16', 'BA': '29',
      'CE': '23', 'DF': '53', 'ES': '32', 'GO': '52', 'MA': '21',
      'MG': '31', 'MS': '50', 'MT': '51', 'PA': '15', 'PB': '25',
      'PE': '26', 'PI': '22', 'PR': '41', 'RJ': '33', 'RN': '24',
      'RO': '11', 'RR': '14', 'RS': '43', 'SC': '42', 'SE': '28',
      'SP': '35', 'TO': '17'
    };
    return codigos[uf] || '35';
  }

  private static gerarDvChaveAcesso(chaveBase: string): string {
    let soma = 0;
    let peso = 2;
    for (let i = chaveBase.length - 1; i >= 0; i--) {
      soma += parseInt(chaveBase[i]) * peso;
      peso = peso === 9 ? 2 : peso + 1;
    }
    const resto = soma % 11;
    return resto <= 1 ? '0' : String(11 - resto);
  }
}