"use client"
import { OrdersSaleInitAction } from "@/actions/orders/sale-init.action";
import { NumbersHelper } from "@/common/helpers/numbers-helper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function OrderOnlineInitialStep({ sellerTag }: { sellerTag: string }) {
  const router = useRouter();
  const [cpf, setCpf] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSaleInit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const cpfNumbersOnly = NumbersHelper.clean(cpf);
    if (!NumbersHelper.isValidCPF(cpfNumbersOnly)) {
      toast.error('CPF Inválido. Por favor, digite um CPF válido.');
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await OrdersSaleInitAction(cpfNumbersOnly, sellerTag)
      setIsLoading(false);
      router.replace(`/comprar/${data?.order.id}`);
    } catch (error: any) {
      setIsLoading(false);
      console.error('Erro na requisição:', error);
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={handleSaleInit} className="space-y-6 min-w-max">
      <h2 className="text-2xl font-bold text-center">Inicie seu Pedido</h2>
      <div>
        <Label htmlFor="cpf" className='pb-2'>Seu CPF</Label>
        <Input
          id="cpf"
          type="text"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          placeholder="Digite apenas números"
          disabled={isLoading}
        />
      </div>
      <Button
        type="submit"
        className="w-full bg-orange-600 hover:bg-orange-700"
        disabled={isLoading}
      >
        {isLoading ? 'Buscando...' : 'Iniciar Pedido'}
      </Button>
    </form>
  );
}
