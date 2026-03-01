// src/components/public/sale-guard.tsx
"use client"

import { useEffect, useState } from "react";

interface SaleGuardProps {
  edition: any;
  dogPriceFormatted: string;
  children: React.ReactNode;
}

export function SaleGuard({ edition, dogPriceFormatted, children }: SaleGuardProps) {
  // Começamos como false para o Servidor renderizar apenas o "null" ou um loader simples
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ESSA É A CHAVE: O Servidor e o primeiro render do Cliente retornam a mesma coisa.
  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-600 border-t-transparent mb-4"></div>
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Sincronizando Edição...</p>
      </div>
    );
  }

  // A partir daqui, só o Cliente executa (após montado)
  const now = new Date();
  const start = new Date(edition.autoEnableDate);
  const end = new Date(edition.autoDisableDate);

  const isSaleOpen = edition.active && now >= start && now <= end;
  const hasStock = edition.dogsSold < edition.limitSale;
  const canSell = isSaleOpen && hasStock;

  if (!canSell) {
    return (
      <div className="text-center space-y-4 py-12 animate-in fade-in duration-500">
        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">
          {now < start ? 'Aguarde o início!' : 'Vendas encerradas!'}
        </h1>
        <p className="text-slate-500 max-w-md mx-auto font-medium text-sm px-6">
          {now < start
            ? `As vendas começam em ${start.toLocaleString('pt-BR')}`
            : 'A edição atual atingiu o limite ou o prazo expirou. Fique atento para a próxima!'}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center animate-in fade-in duration-500">
      <h2 className="text-1xl font-black text-center mb-1 uppercase tracking-tighter text-slate-900">
        Edição: {edition.name}
      </h2>
      <p className="text-center text-gray-600 mb-8 font-small italic">
        Valor unitário: {dogPriceFormatted}
      </p>
      <div className="w-full max-w-2xl px-4">
        {children}
      </div>
    </div>
  );
}