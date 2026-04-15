import Link from "next/link";
import Image from "next/image";

const APK_URL = "https://minio-server.jssolucoeseservicos.com.br/apps/dogao-do-pastor-equipe.apk";

export default function DownloadsPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">

        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="bg-orange-600 w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-orange-600/40">
            <span className="text-4xl">🌭</span>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-black uppercase tracking-tighter text-white">
              Dogão do Pastor
            </h1>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">
              App da Equipe
            </p>
          </div>
        </div>

        {/* Card de download */}
        <div className="w-full bg-slate-900 rounded-[2rem] p-6 flex flex-col gap-5 border border-slate-800">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Versão Android</p>
            <p className="text-sm font-bold text-slate-300">
              Aplicativo exclusivo para a equipe de vendedores e líderes de célula.
            </p>
          </div>

          <div className="bg-amber-950/40 border border-amber-800/50 rounded-2xl p-4 space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">Atenção</p>
            <p className="text-xs font-bold text-amber-300/80">
              Ao instalar, permita a instalação de fontes desconhecidas nas configurações do Android.
            </p>
          </div>

          <a
            href={APK_URL}
            download="dogao-do-pastor-equipe.apk"
            className="w-full bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-black uppercase text-sm tracking-widest rounded-2xl py-4 flex items-center justify-center gap-3 transition-all shadow-lg shadow-orange-600/30"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Baixar APK
          </a>

          <div className="flex items-center gap-2 justify-center">
            <div className="h-px flex-1 bg-slate-800" />
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Instruções</p>
            <div className="h-px flex-1 bg-slate-800" />
          </div>

          <ol className="space-y-2">
            {[
              "Clique em Baixar APK acima",
              "Abra o arquivo baixado no Android",
              "Permita instalar de fontes desconhecidas se solicitado",
              "Instale e faça login com seu usuário",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="bg-orange-600/20 text-orange-500 font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-xs font-bold text-slate-400">{step}</p>
              </li>
            ))}
          </ol>
        </div>

        <p className="text-[10px] font-bold text-slate-600 text-center">
          Dogão do Pastor © {new Date().getFullYear()} · IVC
        </p>
      </div>
    </div>
  );
}
