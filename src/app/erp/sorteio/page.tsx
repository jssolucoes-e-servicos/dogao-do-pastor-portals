"use client"

import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy, Users, UtensilsCrossed } from "lucide-react";
import Link from "next/link";

export default function RaffleHomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-950/30 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-600 via-yellow-400 to-orange-600" />

      <div className="absolute top-6 left-6">
        <Button variant="ghost" size="sm" asChild className="text-slate-400 hover:text-white gap-2">
          <Link href="/erp"><ArrowLeft className="h-4 w-4" /> Voltar ao ERP</Link>
        </Button>
      </div>

      <div className="text-center mb-16 relative z-10">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Trophy className="h-10 w-10 text-yellow-400" />
        </div>
        <p className="text-orange-500 font-black uppercase tracking-[0.3em] text-xs mb-3">Dogão do Pastor</p>
        <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter text-white leading-none">
          Sorteios
        </h1>
        <p className="text-slate-500 text-sm mt-4 font-bold uppercase tracking-widest">
          Selecione o tipo de sorteio
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl relative z-10">
        <Link href="/erp/sorteio/clientes" className="group">
          <div className="h-56 rounded-[2.5rem] border-2 border-orange-900/50 bg-orange-950/20 hover:border-orange-500 hover:bg-orange-950/40 transition-all p-8 flex flex-col items-center justify-center gap-4 cursor-pointer">
            <div className="h-16 w-16 rounded-2xl bg-orange-600/20 border border-orange-600/30 flex items-center justify-center group-hover:bg-orange-600/30 transition-all">
              <Users className="h-8 w-8 text-orange-500" />
            </div>
            <div className="text-center">
              <p className="font-black uppercase italic text-2xl text-white">Clientes</p>
              <p className="text-slate-500 text-[10px] font-bold uppercase mt-1">1 cupom por dog comprado</p>
            </div>
          </div>
        </Link>

        <Link href="/erp/sorteio/vendedores" className="group">
          <div className="h-56 rounded-[2.5rem] border-2 border-blue-900/50 bg-blue-950/20 hover:border-blue-500 hover:bg-blue-950/40 transition-all p-8 flex flex-col items-center justify-center gap-4 cursor-pointer">
            <div className="h-16 w-16 rounded-2xl bg-blue-600/20 border border-blue-600/30 flex items-center justify-center group-hover:bg-blue-600/30 transition-all">
              <UtensilsCrossed className="h-8 w-8 text-blue-400" />
            </div>
            <div className="text-center">
              <p className="font-black uppercase italic text-2xl text-white">Vendedores</p>
              <p className="text-slate-500 text-[10px] font-bold uppercase mt-1">1 cupom a cada 25 dogs vendidos</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
