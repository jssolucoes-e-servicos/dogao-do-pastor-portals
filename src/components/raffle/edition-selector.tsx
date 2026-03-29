"use client"

import { ListEditionsAction, EditionItem } from "@/actions/editions/list-editions.action";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  value: string;
  onChange: (id: string) => void;
}

export function EditionSelector({ value, onChange }: Props) {
  const [editions, setEditions] = useState<EditionItem[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    ListEditionsAction().then((data) => {
      setEditions(data);
      if (!value && data.length > 0) {
        const active = data.find((e) => e.active) ?? data[0];
        onChange(active.id);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = editions.find((e) => e.id === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 bg-slate-900/80 border border-slate-700 hover:border-slate-500 rounded-2xl px-4 py-2.5 transition-all min-w-[260px]"
      >
        <Calendar className="h-4 w-4 text-orange-500 shrink-0" />
        <div className="flex-1 text-left min-w-0">
          {selected ? (
            <>
              <p className="text-xs font-black uppercase text-white truncate">{selected.name}</p>
              <p className="text-[9px] text-slate-500 font-bold uppercase">
                {new Date(selected.productionDate).toLocaleDateString("pt-BR")}
              </p>
            </>
          ) : (
            <p className="text-xs font-bold text-slate-500 uppercase">Selecionar edição...</p>
          )}
        </div>
        {selected && (
          <Badge className={`text-[8px] font-black uppercase shrink-0 ${selected.active ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-slate-700 text-slate-400 border-slate-600'}`}>
            {selected.active ? 'Ativa' : 'Inativa'}
          </Badge>
        )}
        <ChevronDown className={`h-3.5 w-3.5 text-slate-500 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 w-full bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl z-50">
          {editions.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => { onChange(e.id); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-800 transition-colors border-b border-slate-800 last:border-0
                ${e.id === value ? 'bg-slate-800' : ''}
              `}
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black uppercase text-white truncate">{e.name}</p>
                <p className="text-[9px] text-slate-500 font-bold uppercase">
                  Produção: {new Date(e.productionDate).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <Badge className={`text-[8px] font-black uppercase shrink-0 ${e.active ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-slate-700 text-slate-400 border-slate-600'}`}>
                {e.active ? 'Ativa' : 'Inativa'}
              </Badge>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
