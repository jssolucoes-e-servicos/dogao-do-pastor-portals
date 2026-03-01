import { getActiveEdition } from "@/actions/editions/get-active.action";
import { INFORMATIONS } from "@/common/configs/info";
import { NumbersHelper } from "@/common/helpers/numbers-helper";
import { SaleGuard } from "@/components/public/sale-guard";
import { Toaster } from "@/components/ui/sonner";
import "@/styles/globals.css";
import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Dogão do Pastor",
  description: "Sistema de gestão desenvolvido por JS Soluções e Serviços",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Busca a edição no Servidor (Seguro e rápido)
  const response = await getActiveEdition();
  const edition = response?.edition;

  return (
    <html lang="pt-br" suppressHydrationWarning>
      <body className="antialiased">
        <main className="flex min-h-screen flex-col items-center justify-center px-4 py-8 sm:p-24 bg-gray-50">
          <header className="z-10 w-full max-w-5xl items-center justify-center font-mono text-sm lg:flex mb-8">
            <Image
              src="/assets/images/dogao-do-pastor.svg"
              alt="Dogão do Pastor Logo"
              width={150}
              height={150}
              priority
            />
          </header>

          <div className="relative flex place-items-center flex-col w-full">
            {edition ? (
              <SaleGuard 
                edition={JSON.parse(JSON.stringify(edition))} // Garante que datas virem strings para o client
                dogPriceFormatted={NumbersHelper.formatCurrency(edition.dogPrice)}
              >
                {children}
              </SaleGuard>
            ) : (
              <div className="text-center py-12 italic text-gray-400">
                Nenhuma edição ativa encontrada.
              </div>
            )}

            <Toaster richColors position="bottom-right" />
          </div>

          <footer className="z-10 w-full max-w-5xl items-center justify-center font-mono text-xs flex mt-16">
            <div className="flex flex-col items-center justify-center p-4 space-y-1">
              <span className="text-gray-400 uppercase font-bold text-[9px]">Um projeto da</span>
              <a href="https://igrejavivaemcelulas.com.br" target="_blank" className="text-gray-500 font-bold">
                Igreja Viva em Células
              </a>
              <span className="text-gray-300 font-mono text-[10px]">{INFORMATIONS.version}</span>
            </div>
          </footer>
        </main>
      </body>
    </html>
  );
} 