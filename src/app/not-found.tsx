'use client';

import { Button } from "@/components/ui/button";
import { Home, MoveLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="relative">
          <div className="absolute inset-0 blur-3xl opacity-20 bg-orange-500 rounded-full" />
          <h1 className="text-[12rem] font-black leading-none tracking-tighter text-slate-900 dark:text-white relative">
            404
          </h1>
        </div>

        <div className="space-y-4 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-widest border border-orange-200 dark:border-orange-800">
            <AlertCircle className="h-3 w-3" /> Página não encontrada
          </div>
          
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight italic">
            Ops! Você se perdeu no <span className="text-orange-600">caminho</span>?
          </h2>
          
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium max-w-xs mx-auto">
            A página que você está procurando não existe ou foi movida para outro lugar.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Button 
            onClick={() => router.back()}
            variant="outline" 
            className="w-full sm:w-auto h-12 px-8 font-bold text-[11px] uppercase tracking-widest border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-2xl gap-2 group"
          >
            <MoveLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Voltar Agora
          </Button>
          
          <Link href="/" className="w-full sm:w-auto">
            <Button className="w-full h-12 px-8 font-black text-[11px] uppercase tracking-widest bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-orange-600 dark:hover:bg-orange-500 rounded-2xl gap-2 shadow-xl shadow-slate-900/10 dark:shadow-none transition-all active:scale-95">
              <Home className="h-4 w-4" />
              Início
            </Button>
          </Link>
        </div>

        <div className="pt-12">
          <div className="h-px w-12 bg-slate-200 dark:bg-slate-800 mx-auto mb-4" />
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em]">
            DOGÃO DO PASTOR • SISTEMA DE GESTÃO
          </p>
        </div>
      </div>
    </div>
  );
}
