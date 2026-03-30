"use client"

import { useEdition } from "@/contexts/edition-context";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronDown } from "lucide-react";
import { useState } from "react";

export function EditionHeaderSelector() {
  const { editions, selectedId, selected, setSelectedId } = useEdition();
  const [open, setOpen] = useState(false);

  if (editions.length === 0) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-muted/60 hover:bg-muted border border-border rounded-xl px-3 py-1.5 transition-all text-sm"
      >
        <Calendar className="h-3.5 w-3.5 text-orange-500 shrink-0" />
        <span className="font-bold text-xs uppercase truncate max-w-[160px]">
          {selected?.name ?? "Selecionar edição"}
        </span>
        {selected && (
          <Badge className={`text-[8px] font-black uppercase shrink-0 px-1.5 py-0 h-4 ${selected.active ? 'bg-green-500/20 text-green-600 border-green-500/30' : 'bg-slate-200 text-slate-500 border-slate-300'}`}>
            {selected.active ? 'Ativa' : 'Inativa'}
          </Badge>
        )}
        <ChevronDown className={`h-3 w-3 text-muted-foreground shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-1 right-0 w-72 bg-background border border-border rounded-2xl overflow-hidden shadow-xl z-50">
            {editions.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => { setSelectedId(e.id); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted transition-colors border-b border-border last:border-0 ${e.id === selectedId ? 'bg-muted' : ''}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black uppercase truncate">{e.name}</p>
                  <p className="text-[9px] text-muted-foreground font-bold uppercase">
                    {new Date(e.productionDate).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <Badge className={`text-[8px] font-black uppercase shrink-0 ${e.active ? 'bg-green-500/20 text-green-600 border-green-500/30' : 'bg-slate-200 text-slate-500 border-slate-300'}`}>
                  {e.active ? 'Ativa' : 'Inativa'}
                </Badge>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
