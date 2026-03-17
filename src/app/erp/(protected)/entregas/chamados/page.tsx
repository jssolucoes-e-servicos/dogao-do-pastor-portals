'use client'

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  AlertCircle, 
  LayoutDashboard,
  MessageSquare,
  Phone,
  Clock,
  Search,
  Truck,
  ShoppingCart
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";

export default function ChamadosPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line 
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <div className="bg-rose-600 p-3 rounded-2xl shadow-lg shadow-rose-600/20">
                <AlertCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white leading-none">
                Ocorrências & <span className="text-rose-600">Chamados</span>
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">
                Suporte de Entrega • Resolução de Problemas
              </p>
            </div>
        </div>
        
        <div className="flex items-center gap-3">
             <div className="relative group flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
                <Input placeholder="FILTRAR CHAMADO..." className="pl-10 h-10 font-bold text-[11px] uppercase border-slate-200 dark:border-slate-800 rounded-xl" />
             </div>
             <Link href="/erp">
                <Button variant="outline" size="sm" className="gap-2 h-10 font-bold text-[10px] uppercase tracking-widest border-slate-200 dark:border-slate-800">
                    <LayoutDashboard className="h-3.5 w-3.5" /> Painel
                </Button>
            </Link>
        </div>
      </div>

      <div className="grid gap-6">
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900 border-l-4 border-l-orange-500 overflow-hidden">
              <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                      <div className="flex-1 p-6 space-y-4">
                          <div className="flex items-center justify-between">
                                <Badge className="bg-orange-100 text-orange-600 border-none uppercase text-[9px] font-black">Em Aberto</Badge>
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                                    <Clock className="h-3.5 w-3.5" /> Aberto há 12 min
                                </div>
                          </div>
                          
                          <div className="space-y-1">
                              <h3 className="text-lg font-black uppercase text-slate-800 dark:text-white">Endereço não localizado</h3>
                              <p className="text-xs text-slate-500 font-medium italic">&quot;Estou na Rua das Flores mas o número 123 não existe nesta quadra.&quot;</p>
                          </div>

                          <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-50 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                        <Truck className="h-4 w-4 text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase text-slate-400 leading-none">Entregador</p>
                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Marcos Silva</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                        <ShoppingCart className="h-4 w-4 text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase text-slate-400 leading-none">Pedido</p>
                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">#DG-9942</p>
                                    </div>
                                </div>
                          </div>
                      </div>
                      
                      <div className="md:w-64 bg-slate-50 dark:bg-slate-800/50 p-6 flex flex-col gap-2 justify-center border-l dark:border-slate-800">
                           <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] tracking-widest gap-2 h-11 rounded-xl">
                               <Phone className="h-4 w-4" /> Ligar p/ Cliente
                           </Button>
                           <Button variant="outline" className="w-full border-slate-200 dark:border-slate-700 font-black uppercase text-[10px] tracking-widest h-11 rounded-xl">
                               <MessageSquare className="h-4 w-4 mr-2 text-rose-500" /> Responder
                           </Button>
                      </div>
                  </div>
              </CardContent>
          </Card>

          <div className="col-span-full py-24 flex flex-col items-center justify-center bg-rose-50/20 dark:bg-rose-950/5 rounded-[3rem] border-2 border-dashed border-rose-100 dark:border-rose-900/20">
              <MessageSquare className="h-16 w-16 text-rose-200 mb-6" />
              <p className="text-xl font-black text-rose-800/40 dark:text-rose-100/20 uppercase italic tracking-tighter">Nenhuma nova ocorrência de campo</p>
              <p className="text-[10px] font-bold text-rose-800/30 dark:text-rose-100/10 uppercase tracking-[0.4em] mt-2">Operação tranquila...</p>
          </div>
      </div>
    </div>
  );
}
