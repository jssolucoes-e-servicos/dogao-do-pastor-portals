
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

static getOrderStatus(status: string) {
    const statuses: Record<string, { label: string, color: string }> = {
      DIGITATION: { label: 'Digitação', color: 'bg-slate-500' },
      PENDING_PAYMENT: { label: 'Aguard. Pagamento', color: 'bg-amber-500' },
      PAID: { label: 'Pago / Pronto', color: 'bg-emerald-500' },
      QUEUE: { label: 'Na Fila', color: 'bg-blue-500' },
      PRODUCTION: { label: 'Cozinha', color: 'bg-orange-500' },
      EXPEDITION: { label: 'Expedição', color: 'bg-purple-500' },
      DELIVERING: { label: 'Em Rota', color: 'bg-cyan-500' },
      DELIVERED: { label: 'Entregue', color: 'bg-green-600' },
      CANCELLED: { label: 'Cancelado', color: 'bg-red-600' },
      REJECTED: { label: 'Rejeitado', color: 'bg-zinc-800' },
    };
    return statuses[status] || { label: status, color: 'bg-slate-400' };
  }

  static getPaymentStatus(status: string) {
    const statuses: Record<string, { label: string, color: string }> = {
      PENDING: { label: 'Pendente', color: 'border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/20' },
      PAID: { label: 'Aprovado', color: 'border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20' },
      FAILED: { label: 'Falhou', color: 'border-red-500 text-red-600 bg-red-50 dark:bg-red-950/20' },
      CANCELLED: { label: 'Cancelado', color: 'border-slate-500 text-slate-600 bg-slate-50 dark:bg-slate-900/20' },
      REFUNDED: { label: 'Estornado', color: 'border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-950/20' },
    };
    return statuses[status] || { label: status, color: 'border-slate-300' };
  }
}