
export class StringsHelper {
// Exemplo: 123.456.789-00 -> 123.***.***-00 ou ***.456.789-**
  static maskSecureCPF(cpf: string): string {
    const clean = cpf.replace(/\D/g, "");
    if (clean.length !== 11) return cpf;
    // Exibe os 3 primeiros e os 2 últimos, mascarando o meio
    return `${clean.substring(0, 3)}.***.***-${clean.substring(9)}`;
  };

  static smallId(id: string): string {
    return id.substring(id.length - 6)
  }

  formatPhone = (phone: string | undefined | null) => {
  if (!phone) return "N/A";

  // Remove tudo que não for número
  const clean = phone.replace(/\D/g, "");

  // Celular: (51) 982.488.374 (11 dígitos)
  if (clean.length === 11) {
    return `(${clean.substring(0, 2)}) ${clean.substring(2, 5)}.${clean.substring(5, 8)}.${clean.substring(8)}`;
  }

  // Fixo: (51) 3261.0337 (10 dígitos)
  if (clean.length === 10) {
    return `(${clean.substring(0, 2)}) ${clean.substring(2, 6)}.${clean.substring(6)}`;
  }

  // Retorna o original se não encaixar nos padrões acima
  return phone;
};
}