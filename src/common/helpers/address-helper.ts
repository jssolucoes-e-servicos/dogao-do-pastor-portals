export interface ViaCepResponse {
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export class AddressHelper {
  /**
   * Busca dados de endereço via CEP
   */
  static async fetchAddressByCep(cep: string): Promise<ViaCepResponse | null> {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) return null;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (data.erro) return null;
      return data;
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      return null;
    }
  }

  /**
   * Gera a string de endereço formatada (AddressInline)
   */
  static formatAddressInline(data: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    complement?: string | null;
  }): string {
    const { street, number, neighborhood, city, state, complement } = data;
    const comp = complement ? ` - ${complement}` : "";
    return `${street}, ${number}${comp} - ${neighborhood}, ${city}/${state}`;
  }

  /**
   * Remove caracteres não numéricos de CPF, CNPJ ou CEP
   */
  static cleanNumericString(value: string): string {
    return value.replace(/\D/g, "");
  }
}