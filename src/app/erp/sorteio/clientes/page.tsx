"use client"

import { GetCustomerRaffleAction, CustomerRaffleEntry } from "@/actions/raffle/get-raffle-data.action";
import { EditionSelector } from "@/components/raffle/edition-selector";
import { Button } from "@/components/ui/button";
import { launchConfetti, playWinSound, playRaffleMusic, stopRaffleMusic, saveToHistory, getHistory, clearHistory, RaffleHistoryEntry } from "@/lib/raffle-effects";
import { ArrowLeft, Clock, RefreshCw, Trash2, Trophy, Users, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, startTransition } from "react";

const SPIN_DURATION = 10000;

function buildPool(entries: CustomerRaffleEntry[]): string[] {
  const pool: string[] = [];
  for (const e of entries) {
    for (let i = 0; i < e.tickets; i++) pool.push(e.customerName);
  }
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}

export default function CustomerRafflePage() {
  const [entries, setEntries] = useState<CustomerRaffleEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [editionId, setEditionId] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [totalTickets, setTotalTickets] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<RaffleHistoryEntry[]>(() => getHistory("clientes"));

  // Ref para atualizar o DOM diretamente durante o spin — zero re-render
  const displayRef = useRef<HTMLParagraphElement>(null);
  const poolRef = useRef<string[]>([]);
  const rafRef = useRef<number | null>(null);
  const editionIdRef = useRef(editionId);

  useEffect(() => {
    editionIdRef.current = editionId;
    if (!editionId) return;
    let cancelled = false;
    startTransition(() => { setLoading(true); setWinner(null); });
    if (displayRef.current) displayRef.current.textContent = "";
    GetCustomerRaffleAction(editionId).then((res) => {
      if (cancelled) return;
      startTransition(() => {
        if (res.success && res.data) {
          setEntries(res.data);
          const pool = buildPool(res.data);
          poolRef.current = pool;
          setTotalTickets(pool.length);
        }
        setLoading(false);
      });
    });
    return () => { cancelled = true; };
  }, [editionId]);

  const reload = () => {
    if (!editionId || loading || spinning) return;
    startTransition(() => { setLoading(true); setWinner(null); });
    if (displayRef.current) displayRef.current.textContent = "";
    GetCustomerRaffleAction(editionId).then((res) => {
      startTransition(() => {
        if (res.success && res.data) {
          setEntries(res.data);
          const pool = buildPool(res.data);
          poolRef.current = pool;
          setTotalTickets(pool.length);
        }
        setLoading(false);
      });
    });
  };

  const startRaffle = () => {
    const pool = poolRef.current;
    if (spinning || pool.length === 0) return;
    setWinner(null);
    setSpinning(true);

    const winnerName = pool[Math.floor(Math.random() * pool.length)];
    const startTime = performance.now();
    let lastSwap = 0;

    playRaffleMusic();

    const frame = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / SPIN_DURATION, 1);
      const interval = 40 + 460 * (progress ** 3);

      if (now - lastSwap >= interval) {
        if (displayRef.current) {
          displayRef.current.textContent = pool[Math.floor(Math.random() * pool.length)];
        }
        lastSwap = now;
      }

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        if (displayRef.current) displayRef.current.textContent = winnerName;
        setWinner(winnerName);
        setSpinning(false);
        stopRaffleMusic();
        launchConfetti();
        playWinSound();
        const entry = { winner: winnerName, date: new Date().toLocaleString("pt-BR"), editionId: editionIdRef.current };
        saveToHistory("clientes", entry);
        setHistory(getHistory("clientes"));
      }
    };
    rafRef.current = requestAnimationFrame(frame);
  };

  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    stopRaffleMusic();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-orange-950/40 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-orange-600 via-yellow-400 to-orange-600" />

      <div className="absolute top-6 left-6">
        <Button variant="ghost" size="sm" asChild className="text-slate-400 hover:text-white gap-2">
          <Link href="/erp/sorteio"><ArrowLeft className="h-4 w-4" /> Voltar</Link>
        </Button>
      </div>
      <div className="absolute top-6 right-6 flex flex-wrap items-center gap-3 justify-end">
        <EditionSelector value={editionId} onChange={(id) => { setEditionId(id); setWinner(null); setEntries([]); setTotalTickets(0); if (displayRef.current) displayRef.current.textContent = ""; }} />
        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase">
          <Users className="h-4 w-4" /><span>{entries.length} clientes • {totalTickets} cupons</span>
        </div>
        <Button variant="ghost" size="icon" onClick={reload} disabled={loading || spinning || !editionId} className="text-slate-400 hover:text-white h-8 w-8">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="text-center mb-10 relative z-10">
        <p className="text-orange-500 font-black uppercase tracking-[0.3em] text-xs mb-3">Dogão do Pastor</p>
        <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-white leading-none">
          Sorteio de<br /><span className="text-orange-500">Clientes</span>
        </h1>
        <p className="text-slate-500 text-sm mt-4 font-bold uppercase tracking-widest">1 cupom por dog comprado</p>
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        <div className={`relative rounded-[2.5rem] border-2 p-12 text-center transition-all duration-700
          ${winner ? 'border-yellow-400 bg-yellow-950/30 shadow-[0_0_150px_rgba(234,179,8,0.5)] scale-[1.03]'
            : spinning ? 'border-orange-500/50 bg-orange-950/20' : 'border-slate-800 bg-slate-900/50'}`}>

          {winner && (
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 animate-bounce">
              <div className="bg-yellow-400 text-slate-900 font-black uppercase text-base px-8 py-2.5 rounded-full flex items-center gap-2 shadow-xl shadow-yellow-400/40">
                <Trophy className="h-5 w-5" /> 🎉 SORTEADO! 🎉
              </div>
            </div>
          )}

          <div className="min-h-[130px] flex items-center justify-center">
            {loading ? (
              <p className="text-slate-600 font-black uppercase text-sm animate-pulse">Carregando cupons...</p>
            ) : (
              <p
                ref={displayRef}
                className={`font-black uppercase italic leading-tight transition-colors duration-300
                  ${winner
                    ? 'text-4xl md:text-6xl text-yellow-400 drop-shadow-[0_0_40px_rgba(234,179,8,0.9)]'
                    : spinning ? 'text-base md:text-lg text-slate-500' : 'text-slate-600 text-sm'
                  }`}
              >
                {!spinning && !winner ? 'Pronto para sortear' : ''}
              </p>
            )}
          </div>

          {winner && entries.find(e => e.customerName === winner) && (
            <div className="mt-6 flex justify-center animate-in fade-in zoom-in duration-500">
              <span className="bg-orange-400/20 text-orange-300 border border-orange-400/30 rounded-full px-5 py-1.5 text-sm font-black uppercase">
                {entries.find(e => e.customerName === winner)?.tickets} cupons
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 relative z-10 w-full max-w-2xl">
        <Button onClick={startRaffle} disabled={spinning || loading || totalTickets === 0}
          className={`h-20 w-full rounded-[2rem] font-black uppercase italic text-xl tracking-tighter transition-all active:scale-95
            ${spinning ? 'bg-orange-800 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-500 shadow-2xl shadow-orange-600/30'}`}>
          {spinning ? <span className="flex items-center gap-3"><Zap className="h-6 w-6 animate-pulse" /> Sorteando...</span>
            : winner ? <span className="flex items-center gap-3"><RefreshCw className="h-6 w-6" /> Sortear Novamente</span>
            : <span className="flex items-center gap-3"><Zap className="h-6 w-6" /> Iniciar Sorteio</span>}
        </Button>
      </div>

      {!spinning && !winner && entries.length > 0 && (
        <div className="mt-10 relative z-10 w-full max-w-2xl">
          <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest text-center mb-4">Top participantes</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[...entries].sort((a, b) => b.tickets - a.tickets).slice(0, 9).map((e) => (
              <div key={e.customerId} className="bg-slate-900/50 border border-slate-800 rounded-2xl px-4 py-3 flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-300 truncate">{e.customerName}</span>
                <span className="text-orange-500 font-black text-xs shrink-0">{e.tickets}x</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10 relative z-10 w-full max-w-2xl flex justify-center">
        <button onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-2 text-slate-600 hover:text-slate-400 text-[10px] font-black uppercase tracking-widest transition-colors">
          <Clock className="h-3 w-3" /> Últimos sorteios
        </button>
      </div>

      {showHistory && (
        <div className="mt-3 relative z-10 w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Histórico</p>
            <button onClick={() => { clearHistory("clientes"); setHistory([]); }}
              className="flex items-center gap-1 text-red-500/60 hover:text-red-400 text-[9px] font-black uppercase transition-colors">
              <Trash2 className="h-3 w-3" /> Zerar
            </button>
          </div>
          {history.length === 0 ? (
            <p className="text-center text-slate-600 text-xs font-bold uppercase p-4">Nenhum sorteio realizado ainda</p>
          ) : history.map((h, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50 last:border-0">
              <div className="flex items-center gap-2">
                <Trophy className="h-3 w-3 text-yellow-500 shrink-0" />
                <span className="text-xs font-black text-white uppercase">{h.winner}</span>
              </div>
              <span className="text-[9px] text-slate-500 font-bold">{h.date}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
