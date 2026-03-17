'use client'

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Map, 
  RefreshCw,
  LayoutDashboard,
  Navigation,
  Activity,
  User
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function RastreioPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <div className="bg-emerald-600 p-3 rounded-2xl shadow-lg shadow-emerald-600/20">
                <Map className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white leading-none">
                Rastreio <span className="text-emerald-600">Real-time</span>
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">
                Logística Ativa • Acompanhamento de Entregadores
              </p>
            </div>
        </div>
        
        <div className="flex items-center gap-3">
             <Link href="/erp">
                <Button variant="outline" size="sm" className="gap-2 h-10 font-bold text-[10px] uppercase tracking-widest border-slate-200 dark:border-slate-800">
                    <LayoutDashboard className="h-3.5 w-3.5" /> Painel
                </Button>
            </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Active delivery mock */}
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900 border-l-4 border-l-emerald-500 overflow-hidden group">
              <CardHeader className="pb-2">
                  <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-1.5">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          <Badge className="bg-emerald-100 text-emerald-600 border-none uppercase text-[9px] font-black">Em Trânsito</Badge>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">#MOT-042</span>
                  </div>
                  <CardTitle className="text-lg font-black uppercase text-slate-800 dark:text-white flex items-center gap-2">
                     <User className="h-4 w-4 text-emerald-500" /> Ricardo Oliveira
                  </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                      <Navigation className="h-4 w-4 text-emerald-500" /> Rumo ao Centro - 2.4km
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-2">
                       <p className="text-[9px] font-black uppercase text-slate-400">Status Atual:</p>
                       <div className="flex items-center justify-between">
                            <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Entrega de 3 dogões</p>
                            <Badge variant="outline" className="text-[8px] font-black border-emerald-200 text-emerald-600">92% Bateria</Badge>
                       </div>
                  </div>
                  <Button variant="outline" className="w-full border-emerald-200 text-emerald-600 hover:bg-emerald-50 font-black uppercase text-[10px] tracking-widest h-10 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                      Abrir Monitoramento
                  </Button>
              </CardContent>
          </Card>

          <div className="col-span-full py-24 flex flex-col items-center justify-center bg-emerald-50/20 dark:bg-emerald-950/5 rounded-[3rem] border-2 border-dashed border-emerald-100 dark:border-emerald-900/20">
              <Activity className="h-16 w-16 text-emerald-200 mb-6 animate-pulse" />
              <p className="text-xl font-black text-emerald-800/40 dark:text-emerald-100/20 uppercase italic tracking-tighter">Aguardando coordenadas dos entregadores</p>
              <p className="text-[10px] font-bold text-emerald-800/30 dark:text-emerald-100/10 uppercase tracking-[0.4em] mt-2">Visão geral do campo...</p>
          </div>
      </div>
    </div>
  );
}
