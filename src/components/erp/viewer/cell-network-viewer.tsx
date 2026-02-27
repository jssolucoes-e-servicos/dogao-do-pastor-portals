// src/components/erp/cell-networks/cell-network-viewer.tsx
"use client"

import { CellEntity, CellNetworkEntity } from "@/common/entities";
import { NumbersHelper } from "@/common/helpers/numbers-helper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Crown, ExternalLink,
  Layers,
  ShieldCheck,
  Smartphone,
  User, Users
} from "lucide-react";
import Link from "next/link";

interface Props {
  network: CellNetworkEntity;
}

export function CellNetworkViewer({ network }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* COLUNA 1: INFO BÁSICA E SUPERVISOR */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="shadow-sm border-orange-200/20 dark:border-orange-900/30 overflow-hidden">
          <CardHeader className="bg-orange-50/80 dark:bg-orange-950/20 border-b p-5">
            <CardTitle className="text-sm font-black uppercase flex items-center gap-2 text-orange-700 dark:text-orange-400">
              <Layers className="h-4 w-4" /> Informações da Rede
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Nome da Rede Ministerial</label>
              <p className="font-black text-xl text-foreground dark:text-orange-300 leading-tight uppercase tracking-tight">
                {network.name}
              </p>
            </div>
            <div className="pt-2">
              <Badge className="bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 hover:bg-orange-100 border-orange-200 dark:border-orange-900/50 uppercase font-black text-[10px] tracking-widest p-1.5 px-3">
                <Crown className="h-3.5 w-3.5 mr-1.5" /> Rede Ministerial Ativa
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Card do Supervisor */}
        <Card className="shadow-sm border-muted dark:border-slate-800">
          <CardHeader className="border-b p-5 bg-card">
            <CardTitle className="text-sm font-black uppercase flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <ShieldCheck className="h-4 w-4 text-orange-600 dark:text-orange-400" /> Supervisor de Rede
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {network.supervisor ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                    <User className="h-5 w-5 text-orange-700 dark:text-orange-400" />
                    <div className="flex flex-col leading-none">
                      <span className="font-bold text-base text-foreground uppercase leading-tight">
                        {network.supervisor.name}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-medium mt-1">
                        @{network.supervisor.username}
                      </span>
                    </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Contato Ministerial</label>
                  <div className="flex items-center gap-2 text-foreground font-bold text-sm mt-1">
                    <Smartphone className="h-3.5 w-3.5 text-orange-500" />
                    {network.supervisor.phone ? NumbersHelper.maskPhone(network.supervisor.phone) : "Não informado"}
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild className="w-full text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900/50 gap-2 hover:bg-orange-100 dark:hover:bg-orange-950/40 transition-colors mt-2">
                    <Link href={`/erp/colaboradores/${network.supervisor.id}`} className="group">
                      <ExternalLink className="h-4 w-4" />
                      Visualizar Perfil Completo
                    </Link>
                </Button>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic tracking-tight py-4">Nenhum supervisor ministerial vinculado.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* COLUNA 2 & 3: CÉLULAS COMPONENTES */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* LISTA DE CÉLULAS */}
        <Card className="shadow-sm border-muted dark:border-slate-800 overflow-hidden">
          <CardHeader className="border-b p-5 bg-card">
            <CardTitle className="text-sm font-black uppercase flex items-center gap-2 text-foreground">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" /> Células Componentes da Rede
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {network.cells?.length > 0 ? (
              <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800/60">
                {network.cells.map((cell: CellEntity) => (
                  <Link 
                    key={cell.id} 
                    href={`/erp/celulas/${cell.id}`}
                    className="flex items-center justify-between p-4 px-6 text-sm hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors group"
                  >
                    <div className="flex flex-colleading-tight">
                        <span className="font-bold text-foreground dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-1.5 uppercase tracking-tight">
                            {cell.name}
                            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium mt-1">
                            Líder: {cell.leader ? cell.leader.name : 'Não informado'}
                        </span>
                    </div>
                    <Badge variant="outline" className="uppercase text-[9px] font-bold border-muted dark:border-slate-800 tracking-wider">Célula</Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center flex flex-col items-center gap-3">
                 <div className="bg-slate-100 dark:bg-slate-900 p-3 rounded-full border">
                    <Users className="h-6 w-6 text-muted-foreground opacity-50" />
                 </div>
                 <p className="text-xs text-muted-foreground italic tracking-tight max-w-xs">Nenhuma célula ministerial está vinculada a esta rede até o momento.</p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}