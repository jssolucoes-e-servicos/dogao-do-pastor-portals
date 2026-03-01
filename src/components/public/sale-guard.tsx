"use client"

import { useEffect, useState } from "react";

interface SaleGuardProps {
  edition: any;
  dogPriceFormatted: string;
  children: React.ReactNode;
}

export function SaleGuard({ edition, dogPriceFormatted, children }: SaleGuardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // No servidor, renderizamos um esqueleto ou nada para evitar o erro 418
  if (!mounted) return <div className="h-40 flex items-center justify-center font-mono text-[10px] uppercase text-slate-400 animate-pulse">Sincronizando...</div>;

  const now = new Date();
  const start = new Date(edition.autoEnableDate);
  const end = new Date(edition.autoDisableDate);

  const isSaleOpen = edition.active && now >= start && now <= end;
  const hasStock = edition.dogsSold < edition.limitSale;
  const canSell = isSaleOpen && hasStock;

  if (!canSell) {
    return (
      <div className="text-center space-y-4 py-12">
        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">
          {now < start ? 'Aguarde o início!' : 'Vendas encerradas!'}
        </h1>
        <p className="text-slate-500 max-w-md mx-auto font-medium text-sm px-6">
          {now < start
            ? `As vendas começam em ${start.toLocaleString('pt-BR')}`
            : 'A edição atual atingiu o limite ou o prazo expirou.'}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
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