"use client"

import { GetSellerRaffleAction, SellerRaffleEntry } from "@/actions/raffle/get-raffle-data.action";
import { EditionSelector } from "@/components/raffle/edition-selector";
import { Button } from "@/components/ui/button";
import { launchConfetti, playWinSound, playRaffleMusic, stopRaffleMusic, saveToHistory, getHistory, clearHistory, RaffleHistoryEntry } from "@/lib/raffle-effects";
import { ArrowLeft, Clock, Pencil, RefreshCw, Save, Trash2, Trophy, Users, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, startTransition } from "react";

const SPIN_DURATION = 10000;
const DOGS_PER_TICKET = 25;

type EditableSeller = SellerRaffleEntry & { customDogs?: number };

function buildPool(sellers: EditableSeller[]): string[] {
  const pool: string[] = [];
  for (const s of sellers) {
    const dogs = s.customDogs ?? s.totalDogs;
    const tickets = Math.floor(dogs / DOGS_PER_TICKET);
    for (let i = 0; i < tickets; i++) pool.push(s.sellerName);
  }
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}

export default function SellerRafflePage() {
  const [sellers, setSellers] = useState<EditableSeller[]>([]);
  const [loading, setLoading] = useState(false);
  const [editionId, setEditionId] = useState("");
  const [editing, setEditing] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<RaffleHistoryEntry[]>(() => getHistory("vendedores"));

  // Ref para atualizar o DOM diretamente durante o spin — sem re-render do React
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
    GetSellerRaffleAction(editionId).then((res) => {
      if (cancelled) return;
      startTransition(() => {
        if (res.success && res.data) setSellers(res.data.map(s => ({ ...s, customDogs: undefined })));
        setLoading(false);
      });
    });
    return () => { cancelled = true; };
  }, [editionId]);

  useEffect(() => { poolRef.current = buildPool(sellers); }, [sellers]);

  const reload = () => {
    if (!editionId || loading || spinning) return;
    startTransition(() => { setLoading(true); setWinner(null); });
    if (displayRef.current) displayRef.current.textContent = "";
    GetSellerRaffleAction(editionId).then((res) => {
      startTransition(() => {
        if (res.success && res.data) setSellers(res.data.map(s => ({ ...s, customDogs: undefined })));
        setLoading(false);
      });
    });
  };

  const totalTickets = sellers.reduce((acc, s) => acc + Math.floor((s.customDogs ?? s.totalDogs) / DOGS_PER_TICKET), 0);

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
      // Intervalo cresce de 40ms → 500ms com easing cúbico
      const interval = 40 + 460 * (progress ** 3);

      if (now - lastSwap >= interval) {
        // Atualiza DOM diretamente — zero re-render do React
        if (displayRef.current) {
          displayRef.current.textContent = pool[Math.floor(Math.random() * pool.length)];
        }
        lastSwap = now;
      }

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        // Só agora atualiza o React state
        if (displayRef.current) displayRef.current.textContent = winnerName;
        setWinner(winnerName);
        setSpinning(false);
        stopRaffleMusic();
        launchConfetti();
        playWinSound();
        const entry = { winner: winnerName, date: new Date().toLocaleString("pt-BR"), editionId: editionIdRef.current };
        saveToHistory("vendedores", entry);
        setHistory(getHistory("vendedores"));
      }
    };

    rafRef.current = requestAnimationFrame(frame);
  };

  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    stopRaffleMusic();
  }, []);

  const updateDogs = (sellerId: string, value: string) => {
    setSellers(prev => prev.map(s => s.sellerId === sellerId ? { ...s, customDogs: parseInt(value) || 0 } : s));
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-blue-950/40 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-600 via-cyan-400 to-blue-600" />

      {/* Header */}
      <div className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-3 mb-8 relative z-10">
        <Button variant="ghost" size="sm" asChild className="text-slate-400 hover:text-white gap-2">
          <Link href="/erp/sorteio"><ArrowLeft className="h-4 w-4" /> Voltar</Link>
        </Button>
        <EditionSelector value={editionId} onChange={(id) => { setEditionId(id); setWinner(null); setSellers([]); if (displayRef.current) displayRef.current.textContent = ""; }} />
        <div className="flex items-center gap-3 text-slate-400 text-xs font-bold uppercase">
          <Users className="h-4 w-4" />
          <span>{sellers.length} vendedores • {totalTickets} cupons</span>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setEditing(!editing)} disabled={spinning}
            className={`gap-2 text-xs font-black uppercase ${editing ? 'text-green-400' : 'text-slate-400 hover:text-white'}`}>
            {editing ? <><Save className="h-3.5 w-3.5" /> Salvar</> : <><Pencil className="h-3.5 w-3.5" /> Ajustar Dogs</>}
          </Button>
          <Button variant="ghost" size="icon" onClick={reload} disabled={loading || spinning || !editionId} className="text-slate-400 hover:text-white h-8 w-8">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Título */}
      <div className="text-center mb-8 relative z-10">
        <p className="text-blue-500 font-black uppercase tracking-[0.3em] text-xs mb-2">Dogão do Pastor</p>
        <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-white leading-none">
          Sorteio de<br /><span className="text-blue-400">Vendedores</span>
        </h1>
      </div>

      <div className="w-full max-w-5xl relative z-10 flex flex-col lg:flex-row gap-6 items-start">
        {/* Display + botão */}
        <div className="flex-1 flex flex-col items-center gap-5">
          <div className={`w-full relative rounded-[2.5rem] border-2 p-10 text-center transition-all duration-700
            ${winner
              ? 'border-yellow-400 bg-yellow-950/30 shadow-[0_0_150px_rgba(234,179,8,0.5)] scale-[1.03]'
              : spinning ? 'border-blue-500/50 bg-blue-950/20' : 'border-slate-800 bg-slate-900/50'}`}>

            {winner && (
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 animate-bounce">
                <div className="bg-yellow-400 text-slate-900 font-black uppercase text-base px-8 py-2.5 rounded-full flex items-center gap-2 shadow-xl shadow-yellow-400/40">
                  <Trophy className="h-5 w-5" /> 🎉 SORTEADO! 🎉
                </div>
              </div>
            )}

            <div className="min-h-[130px] flex items-center justify-center">
              {loading ? (
                <p className="text-slate-600 font-black uppercase text-sm animate-pulse">Carregando...</p>
              ) : (
                <p
                  ref={displayRef}
                  className={`font-black uppercase italic leading-tight transition-colors duration-300
                    ${winner
                      ? 'text-5xl md:text-7xl text-yellow-400 drop-shadow-[0_0_40px_rgba(234,179,8,0.9)]'
                      : spinning ? 'text-base md:text-lg text-slate-500' : 'text-slate-600 text-sm'
                    }`}
                >
                  {!spinning && !winner ? 'Pronto para sortear' : ''}
                </p>
              )}
            </div>

            {winner && (() => {
              const ws = sellers.find(s => s.sellerName === winner);
              const dogs = ws ? (ws.customDogs ?? ws.totalDogs) : 0;
              return (
                <div className="mt-6 flex justify-center gap-3 flex-wrap animate-in fade-in zoom-in duration-500">
                  <span className="bg-blue-400/20 text-blue-300 border border-blue-400/30 rounded-full px-5 py-1.5 text-sm font-black uppercase">{dogs} dogs vendidos</span>
                  <span className="bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 rounded-full px-5 py-1.5 text-sm font-black uppercase">{Math.floor(dogs / DOGS_PER_TICKET)} cupons</span>
                </div>
              );
            })()}
          </div>

          <Button onClick={startRaffle} disabled={spinning || loading || totalTickets === 0}
            className={`h-20 px-16 rounded-[2rem] font-black uppercase italic text-xl tracking-tighter transition-all active:scale-95 w-full
              ${spinning ? 'bg-blue-800 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 shadow-2xl shadow-blue-600/30'}`}>
            {spinning ? <span className="flex items-center gap-3"><Zap className="h-6 w-6 animate-pulse" /> Sorteando...</span>
              : winner ? <span className="flex items-center gap-3"><RefreshCw className="h-6 w-6" /> Sortear Novamente</span>
              : <span className="flex items-center gap-3"><Zap className="h-6 w-6" /> Iniciar Sorteio</span>}
          </Button>
        </div>

        {/* Lista de vendedores */}
        <div className="w-full lg:w-80 bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              {editing ? 'Ajuste os dogs por vendedor' : 'Vendedores participantes'}
            </p>
          </div>
          <div className="overflow-y-auto max-h-[420px]">
            {sellers.map((s) => {
              const dogs = s.customDogs ?? s.totalDogs;
              const tickets = Math.floor(dogs / DOGS_PER_TICKET);
              const isModified = s.customDogs !== undefined && s.customDogs !== s.totalDogs;
              const isWinner = winner === s.sellerName;
              return (
                <div key={s.sellerId} className={`flex items-center gap-3 px-4 py-3 border-b border-slate-800/50 transition-colors ${isWinner ? 'bg-yellow-950/40' : 'hover:bg-slate-800/30'}`}>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-black uppercase truncate ${isWinner ? 'text-yellow-400' : isModified ? 'text-yellow-400' : 'text-slate-200'}`}>
                      {isWinner && '🏆 '}{s.sellerName}
                    </p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase">{s.sellerTag}</p>
                  </div>
                  {editing ? (
                    <input type="number" min="0" value={dogs} onChange={(e) => updateDogs(s.sellerId, e.target.value)}
                      className="w-16 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs font-black text-center text-white focus:outline-none focus:border-blue-500" />
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400 shrink-0">{dogs}🌭</span>
                  )}
                  <span className={`text-[10px] font-black shrink-0 ${tickets > 0 ? 'text-blue-400' : 'text-slate-600'}`}>{tickets}x</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Rodapé — histórico */}
      <div className="mt-8 relative z-10 w-full max-w-5xl flex justify-center">
        <button onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-2 text-slate-600 hover:text-slate-400 text-[10px] font-black uppercase tracking-widest transition-colors">
          <Clock className="h-3 w-3" /> Últimos sorteios
        </button>
      </div>

      {showHistory && (
        <div className="mt-3 relative z-10 w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Histórico</p>
            <button onClick={() => { clearHistory("vendedores"); setHistory([]); }}
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
