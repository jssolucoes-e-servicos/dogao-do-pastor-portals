"use client"
import { OrdersSaleInitAction } from "@/actions/orders/sale-init.action";
import { NumbersHelper } from "@/common/helpers/numbers-helper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function OrderOnlineInitialStep({ sellerTag }: { sellerTag: string }) {
  const router = useRouter();
  const [cpf, setCpf] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState(false);

  // Garante que o componente só renderize no cliente após a hidratação
  useEffect(() => {
    console.log('sistema carregado');
    setIsMounted(true);
  }, []);

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

  // Se não estiver montado, retornamos um placeholder com as mesmas dimensões
  // Isso evita que o React tente comparar o formulário com o HTML do servidor prematuramente
  if (!isMounted) {
    return <div className="h-[300px] w-full flex items-center justify-center italic text-gray-400">Carregando formulário...</div>;
  }

  return (
    <form onSubmit={handleSaleInit} className="space-y-6 min-w-max animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-center">Inicie seu Pedido</h2>
      <div>
        <Label htmlFor="cpf" className='pb-2 text-slate-700'>Seu CPF</Label>
        <Input
          id="cpf"
          type="text"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          placeholder="Digite apenas números"
          disabled={isLoading}
          className="text-slate-900"
        />
      </div>
      <Button
        type="submit"
        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold"
        disabled={isLoading}
      >
        {isLoading ? 'Buscando...' : 'Iniciar Pedido'}
      </Button>
    </form>
  );
}