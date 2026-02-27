// src/components/erp/cells/cell-viewer.tsx
"use client"

import { CellEntity, SellerEntity } from "@/common/entities";
import { NumbersHelper } from "@/common/helpers/numbers-helper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Crown,
  ExternalLink,
  Info,
  Shield,
  ShoppingBag,
  Smartphone,
  User,
  Users
} from "lucide-react";
import Link from "next/link";

interface Props {
  cell: CellEntity;
}

export function CellViewer({ cell }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* COLUNA 1: DADOS DA UNIDADE E REDE */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="shadow-sm border-blue-200/20 dark:border-blue-900/30 overflow-hidden">
          <CardHeader className="bg-blue-50/80 dark:bg-blue-950/20 border-b p-5">
            <CardTitle className="text-sm font-black uppercase flex items-center gap-2 text-blue-700 dark:text-blue-400">
              <Users className="h-4 w-4" /> Unidade Celular
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Identificação</label>
              <p className="font-black text-xl text-foreground uppercase leading-tight">{cell.name}</p>
              <Badge variant={cell.active ? "default" : "secondary"} className="mt-2 text-[9px] uppercase font-black">
                {cell.active ? 'Célula Ativa' : 'Inativa'}
              </Badge>
            </div>
            
            <div className="pt-4 border-t dark:border-slate-800">
              <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-2 block">Rede Ministerial</label>
              {cell.network ? (
                <Link href={`/erp/redes-de-celulas/${cell.network.id}`} className="group flex items-center justify-between p-3 rounded border bg-orange-50/50 dark:bg-orange-950/10 hover:border-orange-300 transition-all">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-orange-600" />
                    <span className="text-xs font-black uppercase text-orange-800 dark:text-orange-300">{cell.network.name}</span>
                  </div>
                  <ExternalLink className="h-3 w-3 text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ) : <span className="text-xs italic text-muted-foreground">Sem rede vinculada</span>}
            </div>
          </CardContent>
        </Card>

        {/* CARD DO LÍDER (OBJETO ÚNICO) */}
        <Card className="shadow-sm border-muted">
          <CardHeader className="border-b p-5 bg-slate-50/50 dark:bg-slate-900/20">
            <CardTitle className="text-sm font-black uppercase flex items-center gap-2 text-foreground">
              <Shield className="h-4 w-4 text-blue-600" /> Liderança Responsável
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {cell.leader ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900/40 p-2.5 rounded-full">
                    <User className="h-5 w-5 text-blue-700 dark:text-blue-400" />
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="font-bold text-base uppercase text-foreground">{cell.leader.name}</span>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">@{cell.leader.username}</span>
                  </div>
                </div>

                <div className="bg-muted/30 dark:bg-slate-900/40 p-3 rounded-lg border border-dashed">
                  <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest block mb-1">Contato do Líder</label>
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <Smartphone className="h-3.5 w-3.5 text-blue-500" />
                    {cell.leader.phone ? NumbersHelper.maskPhone(cell.leader.phone) : "Sem telefone"}
                  </div>
                </div>

                <Button variant="outline" size="sm" asChild className="w-full text-xs font-bold uppercase gap-2">
                  <Link href={`/erp/colaboradores/${cell.leader.id}`}>
                    <ExternalLink className="h-3.5 w-3.5" /> Ver Perfil Completo
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-muted-foreground italic p-4 border border-dashed rounded-lg">
                <Info className="h-4 w-4" /> Unidade sem líder vinculado.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* COLUNA 2 & 3: VENDEDORES DA CÉLULA */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="shadow-sm border-emerald-200/20 dark:border-emerald-900/30 overflow-hidden">
          <CardHeader className="bg-emerald-50/50 dark:bg-emerald-950/20 border-b p-5 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-black uppercase text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" /> Vendedores Gerados (Dogão)
            </CardTitle>
            <Badge className="bg-emerald-600 font-black">{cell.sellers?.length || 0}</Badge>
          </CardHeader>
          <CardContent className="p-0">
            {cell.sellers && cell.sellers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:gap-px bg-muted/20">
                {cell.sellers.map((seller: SellerEntity) => (
                  <Link 
                    key={seller.id} 
                    href={`/erp/vendedores/${seller.id}`}
                    className="flex items-center justify-between p-4 bg-card hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all group border-b md:border-r dark:border-slate-800"
                  >
                    <div className="flex flex-col leading-tight">
                      {/* O vendedor geralmente tem um link com o contributor para pegar o nome real */}
                      <span className="font-bold text-sm uppercase text-foreground group-hover:text-emerald-600 transition-colors">
                        {seller.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium uppercase mt-0.5">Vendedor Ativo</span>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center flex flex-col items-center gap-3">
                <ShoppingBag className="h-8 w-8 text-muted-foreground opacity-20" />
                <p className="text-xs text-muted-foreground italic max-w-[200px]">
                  Esta célula ainda não possui vendedores vinculados ao projeto Dogão.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* NOTA ESTATÍSTICA */}
        <div className="p-4 rounded-lg bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/40 flex gap-3 items-start">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-black uppercase text-blue-800 dark:text-blue-400 tracking-widest">Resumo Administrativo</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic">
              Os dados desta célula são utilizados para o cálculo de performance da rede ministerial e expansão da malha de vendas do Dogão. Alterações de liderança devem ser reportadas à supervisão da rede.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}