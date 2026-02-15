// src/app/erp/(auth)/layout.tsx
import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Dogão do Pastor | ERP smartFoods",
  description: "Painel Administrativo",
};

export default function ErpAuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen flex-col md:flex-row">
      {/* LADO ESQUERDO: BRANDING */}
      <div className="hidden md:flex md:w-1/2 lg:w-2/3 bg-slate-950 items-center justify-center p-12 relative overflow-hidden">
        {/* Background Decorativo */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-900 rounded-full blur-[120px]" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center">
          <Image
            src="/assets/images/dogao-do-pastor.svg"
            alt="Dogão do Pastor Logo"
            width={300}
            height={300}
            className="drop-shadow-2xl"
            priority
          />
          <div className="mt-8 text-center">
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
              smart <span className="text-orange-600">Foods</span>
            </h1>
            <p className="text-slate-400 mt-2 text-lg">Gestão de pedidos</p>
          </div>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center p-8 bg-background">
        <div className="w-full max-w-[400px] space-y-8">
        {children}
        <p className="text-center text-xs text-muted-foreground px-8">
            Acesso restrito a colaboradores autorizados. Todas as ações são monitoradas.
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}