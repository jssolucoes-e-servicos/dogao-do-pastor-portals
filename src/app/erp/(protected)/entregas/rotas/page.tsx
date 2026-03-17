'use client'

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  MapPin, 
  Truck, 
  RefreshCw,
  LayoutDashboard,
  Navigation,
  Plus
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function RotasPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <div className="bg-purple-600 p-3 rounded-2xl shadow-lg shadow-purple-600/20">
                <Truck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white leading-none">
                Gestão de <span className="text-purple-600">Rotas</span>
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">
                Logística & Entrega • Planejamento de percursos
              </p>
            </div>
        </div>
        
        <div className="flex items-center gap-3">
             <Button className="bg-purple-600 hover:bg-purple-700 text-white font-black uppercase tracking-widest text-[10px] gap-2 h-10 px-6 rounded-xl">
                <Plus className="h-4 w-4" /> Nova Rota
             </Button>
             <Link href="/erp">
                <Button variant="outline" size="sm" className="gap-2 h-10 font-bold text-[10px] uppercase tracking-widest border-slate-200 dark:border-slate-800">
                    <LayoutDashboard className="h-3.5 w-3.5" /> Painel
                </Button>
            </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Placeholder for real routes */}
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900 border-l-4 border-l-purple-500 overflow-hidden">
              <CardHeader className="pb-2">
                  <div className="flex justify-between items-center mb-1">
                      <Badge className="bg-purple-100 text-purple-600 border-none uppercase text-[9px] font-black">Em Preparação</Badge>
                      <span className="text-[10px] font-bold text-slate-400">#ROTA-001</span>
                  </div>
                  <CardTitle className="text-lg font-black uppercase text-slate-800 dark:text-white">Rota Zona Norte</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                      <MapPin className="h-4 w-4 text-purple-500" /> 5 Entregas Pendentes
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-2">
                       <p className="text-[9px] font-black uppercase text-slate-400">Próximos Pontos:</p>
                       <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">• Rua das Flores, 123</p>
                       <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">• Av. Principal, 500</p>
                  </div>
                  <Button variant="outline" className="w-full border-purple-200 text-purple-600 hover:bg-purple-50 font-black uppercase text-[10px] tracking-widest h-10">
                      Visualizar no Mapa
                  </Button>
              </CardContent>
          </Card>

          <div className="col-span-full py-20 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900/20 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
              <Navigation className="h-12 w-12 text-slate-200 mb-4" />
              <p className="text-lg font-black text-slate-400 uppercase italic tracking-tighter">Funcionalidade de Roteirização em Desenvolvimento</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2 opacity-60">Aguardando integração com API de Mapas...</p>
          </div>
      </div>
    </div>
  );
}
