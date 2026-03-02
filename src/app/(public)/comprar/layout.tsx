// src/app/layout.tsx
import { getActiveEdition } from "@/actions/editions/get-active.action";
import { INFORMATIONS } from "@/common/configs/info";
import { NumbersHelper } from "@/common/helpers/numbers-helper";
import { Toaster } from "@/components/ui/sonner";
import "@/styles/globals.css";
import type { Metadata } from "next";
import Image from "next/image";

// Cache de 30 minutos conforme sua necessidade
export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Dogão do Pastor",
  description: "Sistema de gestão desenvolvido por JS Soluções e Serviços",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const response = await getActiveEdition();
  const edition = response?.edition;

  // Lógica de Tempo (Server Side)
  const now = new Date();
  
  let canSell = false;
  let isWaiting = false;
  let startFormatted = "";

  if (edition && edition.active) {
    const start = new Date(edition.autoEnableDate);
    const end = new Date(edition.autoDisableDate);
    
    startFormatted = start.toLocaleString('pt-BR', { 
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    isWaiting = now < start;
    const isSaleOpen = now >= start && now <= end;
    const hasStock = edition.dogsSold < edition.limitSale;
    
    canSell = isSaleOpen && hasStock;
  }

  return (
    <html lang="pt-br" suppressHydrationWarning>
      <body className="h-full antialiased bg-background">
        <main className="flex min-h-screen flex-col items-center justify-center px-4 py-8 sm:p-24 bg-gray-50 text-slate-900">
          {/* HEADER AJUSTADO PARA CENTRALIZAÇÃO TOTAL */}
          <header className="z-10 w-full max-w-5xl flex items-center justify-center mb-8">
            <Image
              src="/assets/images/dogao-do-pastor.svg"
              alt="Dogão do Pastor Logo"
              width={150}
              height={150}
              // mx-auto garante a centralização, height: auto cala o erro do console
              className="mx-auto"
              style={{ height: 'auto', width: '150px' }} 
              priority
            />
          </header>

          <div className="relative flex place-items-center flex-col w-full">
            {canSell && edition ? (
              <>
                <h2 className="text-1xl font-black text-center mb-1 uppercase tracking-tighter text-slate-900">
                  Edição: {edition.name}
                </h2>
                <p className="text-center text-gray-600 mb-8 font-small italic">
                  Valor unitário: {NumbersHelper.formatCurrency(edition.dogPrice)}
                </p>
                <div className="w-full max-w-2xl px-4">
                  {children}
                </div>
              </>
            ) : (
              <div className="text-center space-y-4 py-12">
                <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">
                  {isWaiting ? 'Aguarde o início das vendas!' : 'Vendas encerradas!'}
                </h1>
                <p className="text-slate-500 max-w-md mx-auto font-medium">
                  {isWaiting 
                    ? `As vendas começam em ${startFormatted}` 
                    : 'A edição atual atingiu o limite ou o prazo expirou. Fique atento para a próxima!'}
                </p>
              </div>
            )}

            <Toaster richColors position="bottom-right" />
          </div>

          <footer className="z-10 w-full max-w-5xl items-center justify-center font-mono text-xs flex mt-16">
            <div className="flex flex-col items-center justify-center p-4 space-y-1">
              <span className="text-gray-400 uppercase font-bold text-[10px]">Um projeto da</span>
              <a
                href="https://igrejavivaemcelulas.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-orange-600 transition-colors font-bold"
              >
                Igreja Viva em Células
              </a>
              <span className="text-gray-300 font-mono text-[10px]">{`${INFORMATIONS.version} (${INFORMATIONS.build})`}</span>
            </div>
          </footer>
        </main>
      </body>
    </html>
  );
}