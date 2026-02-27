// src/components/erp/viwers/contributor-viewer.tsx
"use client"

import { CellEntity, CellNetworkEntity, ContributorEntity, DeliveryPersonEntity, SellerEntity } from "@/common/entities";
import { NumbersHelper } from "@/common/helpers/numbers-helper";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Crown,
  ExternalLink,
  Lock,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Truck,
  User,
  Users
} from "lucide-react";
import Link from "next/link";

interface Props {
  contributor: ContributorEntity;
}

export function ContributorViewer({ contributor }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* COLUNA 1: INFO BÁSICA E ACESSO */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="shadow-sm border-orange-200/20 dark:border-orange-900/30 overflow-hidden">
          <CardHeader className="bg-orange-50/80 dark:bg-orange-950/20 border-b p-5">
            <CardTitle className="text-sm font-black uppercase flex items-center gap-2 text-orange-700 dark:text-orange-400">
              <User className="h-4 w-4" /> Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Nome Completo</label>
              <p className="font-bold text-lg text-foreground leading-tight">{contributor.name}</p>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Username</label>
              <p className="font-medium text-muted-foreground">@{contributor.username}</p>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Telefone</label>
              <div className="flex items-center gap-2 text-foreground font-bold">
                <Smartphone className="h-4 w-4 text-orange-500" />
                {contributor.phone ? NumbersHelper.maskPhone(contributor.phone) : "Não informado"}
              </div>
            </div>
            <div className="pt-2">
              <Badge className="bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 hover:bg-green-100 border-green-200 dark:border-green-900/50 uppercase font-black text-[10px]">
                Conta Ativa
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 dark:border-slate-800 opacity-80 grayscale-[0.2]">
          <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b p-5">
            <CardTitle className="text-sm font-black uppercase flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Lock className="h-4 w-4" /> Permissões de Módulo
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            <p className="text-[11px] text-muted-foreground italic mb-4">
              Módulos que o usuário pode acessar no ERP. (Gestão em breve)
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="uppercase text-[9px] font-bold">Dashboard</Badge>
              <Badge variant="outline" className="uppercase text-[9px] font-bold">Vendas</Badge>
              <Badge variant="outline" className="uppercase text-[9px] font-bold">Expedição</Badge>
              <Badge variant="outline" className="uppercase text-[9px] font-bold">Financeiro</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* COLUNA 2 & 3: VÍNCULOS E OPERAÇÃO */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* HIERARQUIA CELULAR */}
        <Card className="shadow-sm border-muted">
          <CardHeader className="border-b p-5">
            <CardTitle className="text-sm font-black uppercase flex items-center gap-2 text-foreground">
              <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" /> Hierarquia Espiritual / Celular
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* REDES */}
              <div className="p-4 rounded-lg border bg-orange-50/30 dark:bg-orange-950/10 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                  <Crown className="h-4 w-4" />
                  <span className="text-[11px] font-black uppercase tracking-wider">Supervisor de Rede</span>
                </div>
                <div className="flex flex-col gap-2">
                  {contributor.cellNetworks && contributor.cellNetworks.length > 0 ? (
                    contributor.cellNetworks.map((net: CellNetworkEntity) => (
                      <Link 
                        key={net.id} 
                        href={`/erp/redes-de-celulas/${net.id}`}
                        className="font-bold text-sm uppercase text-orange-900 dark:text-orange-200 hover:text-orange-600 dark:hover:text-orange-400 hover:underline flex items-center gap-1 group transition-colors"
                      >
                        {net.name}
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    ))
                  ) : <span className="text-xs italic text-muted-foreground">Nenhuma rede vinculada</span>}
                </div>
              </div>

              {/* CÉLULAS */}
              <div className="p-4 rounded-lg border bg-blue-50/30 dark:bg-blue-950/10 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                  <Users className="h-4 w-4" />
                  <span className="text-[11px] font-black uppercase tracking-wider">Líder de Célula</span>
                </div>
                <div className="flex flex-col gap-2">
                  {contributor.cells && contributor.cells.length > 0 ? (
                    contributor.cells.map((cell: CellEntity) => (
                      <Link 
                        key={cell.id} 
                        href={`/erp/celulas/${cell.id}`}
                        className="font-bold text-sm uppercase text-blue-900 dark:text-blue-200 hover:text-blue-600 dark:hover:text-blue-400 hover:underline flex items-center gap-1 group transition-colors"
                      >
                        {cell.name}
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    ))
                  ) : <span className="text-xs italic text-muted-foreground">Nenhuma célula vinculada</span>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* VÍNCULOS OPERACIONAIS (ENTREGADORES E VENDEDORES) */}
        <Card className="shadow-sm border-blue-200/20 dark:border-blue-900/30 overflow-hidden">
          <CardHeader className="bg-blue-50/50 dark:bg-blue-950/20 border-b p-5">
            <CardTitle className="text-sm font-black uppercase text-blue-800 dark:text-blue-400">
              Vínculos Operacionais (Dogão)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* ENTREGADORES */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Perfil Entregador</span>
              </div>
              <div className="space-y-2">
                {contributor.deliveryPersons && contributor.deliveryPersons.length > 0 ? (
                  contributor.deliveryPersons.map((dev: DeliveryPersonEntity) => (
                    <Link 
                      key={dev.id} 
                      href={`/erp/entregadores/${dev.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card text-xs hover:border-blue-400 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-all group"
                    >
                      <div className="flex flex-col leading-tight">
                        <span className="font-bold uppercase flex items-center gap-2 text-foreground">
                          {contributor.name}
                          <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </span>
                        <span className="text-[9px] text-muted-foreground uppercase font-bold mt-0.5">Operacional Ativo</span>
                      </div>
                      <Badge variant={dev.active ? "default" : "secondary"} className="text-[9px] uppercase font-black">
                        {dev.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </Link>
                  ))
                ) : (
                  <div className="p-4 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center">
                    <p className="text-[10px] text-muted-foreground italic uppercase font-bold tracking-tighter">Não possui perfil de entregador</p>
                  </div>
                )}
              </div>
            </div>

            {/* VENDEDORES / AFILIADOS */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Perfil Vendedor</span>
              </div>
              <div className="space-y-2">
                {contributor.sellers && contributor.sellers.length > 0 ? (
                  contributor.sellers.map((seller: SellerEntity) => (
                    <Link 
                      key={seller.id} 
                      href={`/erp/vendedores/${seller.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card text-xs hover:border-emerald-400 dark:hover:border-emerald-700 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 transition-all group"
                    >
                      <div className="flex flex-col leading-tight">
                        <span className="font-bold uppercase flex items-center gap-2 text-foreground">
                          {contributor.name}
                          <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </span>
                        <span className="text-[9px] text-muted-foreground uppercase font-bold mt-0.5">Vendas e Afiliados</span>
                      </div>
                      <span className="text-emerald-600 dark:text-emerald-400 font-black text-[10px] uppercase tracking-tighter">Vinculado</span>
                    </Link>
                  ))
                ) : (
                  <div className="p-4 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center">
                    <p className="text-[10px] text-muted-foreground italic uppercase font-bold tracking-tighter">Não possui perfil de vendedor</p>
                  </div>
                )}
              </div>
            </div>

          </CardContent>
        </Card>

      </div>
    </div>
  );
}