'use client';

import { GetSystemConfigAction, SetSystemConfigAction } from "@/actions/system/get-config.action";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Settings2, ShoppingCart, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ConfigItem {
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  value: boolean;
  loading: boolean;
}

export default function SistemaConfigPage() {
  const [mounted, setMounted] = useState(false);
  const [pdvEnabled, setPdvEnabled] = useState(false);
  const [pdvLoading, setPdvLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    GetSystemConfigAction('pdv_enabled').then((r) => {
      setPdvEnabled(r.data?.value === 'true');
      setPdvLoading(false);
    });
  }, [mounted]);

  const togglePdv = async () => {
    setSaving(true);
    const newVal = !pdvEnabled;
    const r = await SetSystemConfigAction('pdv_enabled', String(newVal));
    if (r.success) {
      setPdvEnabled(newVal);
      toast.success(`PDV ${newVal ? 'habilitado' : 'desabilitado'}`);
    } else {
      toast.error(r.error || "Erro ao salvar");
    }
    setSaving(false);
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">
      <div className="flex items-center gap-4">
        <div className="bg-slate-900 dark:bg-white p-3 rounded-2xl shadow-lg">
          <Settings2 className="h-6 w-6 text-white dark:text-slate-900" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white leading-none">
            Configurações do <span className="text-orange-600">Sistema</span>
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">
            Flags e parâmetros globais da plataforma
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* PDV Enabled */}
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden">
          <CardContent className="p-6 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div className="bg-orange-100 dark:bg-orange-950 p-3 rounded-2xl">
                <ShoppingCart className="h-6 w-6 text-orange-600" />
              </div>
              {pdvLoading ? (
                <div className="h-8 w-16 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-full" />
              ) : (
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${pdvEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                  {pdvEnabled ? 'ATIVO' : 'INATIVO'}
                </div>
              )}
            </div>
            <div>
              <p className="font-black text-sm uppercase italic text-slate-900 dark:text-white">PDV — Ponto de Venda</p>
              <p className="text-[11px] font-bold text-slate-500 mt-1">
                Habilita ou desabilita o acesso ao módulo PDV para todos os usuários (exceto IT/ADMIN).
                Ative apenas no dia de produção.
              </p>
            </div>
            <Button
              onClick={togglePdv}
              disabled={saving || pdvLoading}
              className={`w-full h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest gap-2 transition-all ${
                pdvEnabled
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white'
              }`}
            >
              {saving && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
              {pdvEnabled ? 'Desabilitar PDV' : 'Habilitar PDV'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-6">
        <p className="text-xs font-black uppercase tracking-widest text-amber-700 dark:text-amber-400 mb-1">Atenção</p>
        <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
          Alterações nas configurações do sistema têm efeito imediato para todos os usuários conectados.
          Usuários IT e ADMIN sempre têm acesso independente das flags.
        </p>
      </div>
    </div>
  );
}
