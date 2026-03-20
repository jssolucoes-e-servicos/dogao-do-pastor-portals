'use client';

import { usePermissions } from "@/hooks/use-permissions";
import { CreatePdvAction } from "@/actions/orders/create-pdv.action";
import { ValidateTicketAction } from "@/actions/tickets/validate-ticket.action";
import { getValidatedSaleStatus, SaleStatus } from "@/actions/editions/validate-sale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Trash2, 
  User, 
  Ticket, 
  CheckCircle2,
  UtensilsCrossed,
  Loader2,
  ArrowRight
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import useSWR, { useSWRConfig } from "swr";

export default function VendaTicketPage() {
  const { mutate } = useSWRConfig();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Sale State
  const [customer, setCustomer] = useState({ name: "", phone: "", cpf: "" });
  const [quantity, setQuantity] = useState(1);
  const [ticketNumbers, setTicketNumbers] = useState<string[]>([]);
  const [isValidated, setIsValidated] = useState<boolean[]>([]);

  const { data: statusRes, mutate: mutateStatus } = useSWR<SaleStatus>(
    'sale-status',
    () => getValidatedSaleStatus()
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setTicketNumbers(new Array(quantity).fill(""));
    setIsValidated(new Array(quantity).fill(false));
  }, [quantity]);

  const handleFinalize = async () => {
    if (!customer.name || !customer.phone) {
      toast.error("Identifique o cliente primeiro");
      return;
    }

    if (ticketNumbers.some(n => !n)) {
      toast.error("Preencha todos os números de ticket");
      return;
    }

    if (isValidated.some(v => !v)) {
      toast.error("Valide todos os tickets antes de finalizar");
      return;
    }

    setLoading(true);
    try {
      const dogPrice = statusRes?.edition?.dogPrice || 0;
      const dto = {
        customerName: customer.name,
        customerPhone: customer.phone,
        customerCpf: customer.cpf,
        paymentMethod: 'TICKET',
        deliveryOption: 'PICKUP',
        ticketNumbers: ticketNumbers,
        totalValue: dogPrice * quantity,
        items: new Array(quantity).fill({
          productId: "fixed-dogao",
          quantity: 1,
          removedIngredients: [],
        }),
      };

      const res = await CreatePdvAction(dto);
      if (res.success) {
        toast.success("Venda por ticket registrada com sucesso!");
        setCustomer({ name: "", phone: "", cpf: "" });
        setQuantity(1);
        setTicketNumbers([""]);
        setIsValidated([false]);
        mutateStatus();
        mutate('pickup-commands');
        mutate('checkin-orders');
      } else {
        toast.error(res.error || "Erro ao registrar venda");
      }
    } catch (err) {
      toast.error("Erro interno");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white leading-none">
            Registro de <span className="text-orange-600">Tickets</span>
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-2">
            Lançamento Administrativo de Vendas Físicas
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm bg-white rounded-[2.5rem] p-8 space-y-6">
          <CardTitle className="text-lg font-black uppercase italic flex items-center gap-2">
             <User className="h-5 w-5 text-orange-600" /> Identificação do Cliente
          </CardTitle>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">CPF (Opcional)</Label>
              <Input
                placeholder="000.000.000-00"
                value={customer.cpf}
                onChange={(e) => setCustomer({ ...customer, cpf: e.target.value })}
                className="h-12 rounded-xl border-none bg-slate-50 font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Telefone</Label>
              <Input
                placeholder="(00) 00000-0000"
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                className="h-12 rounded-xl border-none bg-slate-50 font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nome Completo</Label>
              <Input
                placeholder="NOME DO CLIENTE"
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value.toUpperCase() })}
                className="h-12 rounded-xl border-none bg-slate-50 font-bold"
              />
            </div>
          </div>
        </Card>

        <Card className="border-none shadow-sm bg-white rounded-[2.5rem] p-8 space-y-6">
          <CardTitle className="text-lg font-black uppercase italic flex items-center gap-2">
             <UtensilsCrossed className="h-5 w-5 text-orange-600" /> Quantidade de Dogões
          </CardTitle>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              className="h-16 w-16 rounded-2xl text-2xl font-black"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >-</Button>
            <div className="flex-1 text-center font-black text-4xl italic text-orange-600">{quantity}</div>
            <Button 
              variant="outline" 
              className="h-16 w-16 rounded-2xl text-2xl font-black"
              onClick={() => setQuantity(quantity + 1)}
            >+</Button>
          </div>
          <p className="text-[10px] font-bold uppercase text-center text-slate-400">Total a registrar: R$ {((statusRes?.edition?.dogPrice || 0) * quantity).toFixed(2)}</p>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-white rounded-[2.5rem] p-8 space-y-8">
        <CardHeader className="p-0 border-none">
          <CardTitle className="text-lg font-black uppercase italic flex items-center gap-2">
             <Ticket className="h-5 w-5 text-orange-600" /> Números dos Tickets
          </CardTitle>
          <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Insira e valide cada ticket vendido fisicamente</CardDescription>
        </CardHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ticketNumbers.map((num, idx) => (
            <div key={idx} className={`p-6 rounded-3xl border-2 transition-all ${isValidated[idx] ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-black uppercase text-slate-400">Dogão {idx + 1}</span>
                {isValidated[idx] && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
              </div>
              <div className="flex gap-2">
                <Input 
                  placeholder="Nº TICKET" 
                  value={num}
                  disabled={isValidated[idx]}
                  onChange={(e) => {
                    const newNums = [...ticketNumbers];
                    newNums[idx] = e.target.value;
                    setTicketNumbers(newNums);
                  }}
                  className="h-12 rounded-xl border-none bg-white font-bold"
                />
                {!isValidated[idx] ? (
                  <Button 
                    className="h-12 px-6 rounded-xl bg-slate-900 text-white font-black text-[10px]"
                    onClick={async () => {
                      if(!num) return;
                      const res = await ValidateTicketAction(num);
                      if(res.success) {
                        const newV = [...isValidated];
                        newV[idx] = true;
                        setIsValidated(newV);
                        toast.success(`Ticket #${num} validado!`);
                      } else {
                        toast.error(res.error || "Ticket inválido");
                      }
                    }}
                  >VALIDAR</Button>
                ) : (
                  <Button 
                    variant="ghost" 
                    className="h-12 w-12 p-0 text-slate-400 hover:text-red-500"
                    onClick={() => {
                      const newV = [...isValidated];
                      newV[idx] = false;
                      setIsValidated(newV);
                    }}
                  ><Trash2 className="h-4 w-4" /></Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <Button
           onClick={handleFinalize}
           disabled={loading || ticketNumbers.length === 0}
           className="w-full h-20 rounded-[2rem] bg-orange-600 hover:bg-orange-700 text-white font-black uppercase italic text-lg tracking-tighter shadow-2xl shadow-orange-600/20"
        >
           {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
             <span className="flex items-center gap-3">
               REGISTRAR VENDA POR TICKET <ArrowRight className="h-5 w-5" />
             </span>
           )}
        </Button>
      </Card>
    </div>
  );
}
