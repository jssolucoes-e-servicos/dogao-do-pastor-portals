export class NumbersHelper {
  /**
   * Remove qualquer caractere que não seja número
   */
  static clean(value: string): string {
    return value.replace(/\D/g, "");
  }

  /**
   * Formata um número para Real Brasileiro (R$ 0,00)
   */
  static formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  /**
   * Máscara de CPF: 000.000.000-00
   */
  static maskCPF(v: string): string {
    v = this.clean(v);
    return v
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
      .slice(0, 14);
  }

  /**
   * Máscara de CNPJ: 00.000.000/0000-00
   */
  static maskCNPJ(v: string): string {
    v = this.clean(v);
    return v
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .slice(0, 18);
  }

  /**
   * Máscara de Telefone: (00) 00000-0000
   */
  static maskPhone(v: string): string {
    v = this.clean(v);
    if (v.length <= 10) {
      return v.replace(/^(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }
    return v.replace(/^(\d{2})(\d{5})(\d{4})/, "($1) $2-$3").slice(0, 15);
  }

  /**
   * Validação Real de CPF (Algoritmo de dígitos verificadores)
   */
  static isValidCPF(cpf: string): boolean {
    const cleanCPF = this.clean(cpf);
    if (cleanCPF.length !== 11 || !!cleanCPF.match(/(\d)\1{10}/)) return false;

    const digits = cleanCPF.split("").map(Number);
    
    const calculateDigit = (slice: number[], factor: number) => {
      const sum = slice.reduce((acc, num, idx) => acc + num * (factor - idx), 0);
      const result = (sum * 10) % 11;
      return result === 10 ? 0 : result;
    };

    if (calculateDigit(digits.slice(0, 9), 10) !== digits[9]) return false;
    if (calculateDigit(digits.slice(0, 10), 11) !== digits[10]) return false;

    return true;
  }

  /**
   * Validação Real de CNPJ (Algoritmo de dígitos verificadores)
   */
  static isValidCNPJ(cnpj: string): boolean {
    const cleanCNPJ = this.clean(cnpj);
    if (cleanCNPJ.length !== 14 || !!cleanCNPJ.match(/(\d)\1{13}/)) return false;

    const digits = cleanCNPJ.split("").map(Number);

    const calculateDigit = (slice: number[], weights: number[]) => {
      const sum = slice.reduce((acc, num, idx) => acc + num * weights[idx], 0);
      const result = sum % 11;
      return result < 2 ? 0 : 11 - result;
    };

    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    if (calculateDigit(digits.slice(0, 12), weights1) !== digits[12]) return false;
    if (calculateDigit(digits.slice(0, 13), weights2) !== digits[13]) return false;

    return true;
  }
}