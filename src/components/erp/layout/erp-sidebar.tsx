// src/components/erp/layout/erp-sidebar.tsx
"use client"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { usePermissions } from "@/hooks/use-permissions"
import { useEdition } from "@/contexts/edition-context"
import {
  Calendar,
  ChevronRight,
  HandCoins,
  Heart,
  LayoutDashboard,
  PackageCheck,
  Settings,
  ShoppingCart,
  Shield,
  Trophy,
  Truck,
  UsersRound
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/erp" },
  { title: "PDV (Ponto de Venda)", url: "/erp/pdv", icon: ShoppingCart, slug: "erp.pos" },
  { title: "Minhas Vendas", url: "/erp/minhas-vendas", icon: ShoppingCart, slug: "erp.my-sales" },
  {
    title: "Vendas & Clientes",
    icon: ShoppingCart,
    slug: "erp.orders",
    items: [
      { title: "Todos os Pedidos", url: "/erp/pedidos" },
      { title: "Clientes", url: "/erp/clientes" },
      { title: "Em análise", url: "/erp/pedidos/em-analise" },
    ],
  },
  {
    title: "Doações",
    icon: Heart,
    slug: "erp.donations",
    items: [
      { title: "Painel de Doações", url: "/erp/doacoes" },
      { title: "Curadoria", url: "/erp/pedidos/doacoes-curadoria" },
      { title: "Entidades Parceiras", url: "/erp/parceiros" },
    ],
  },
  {
    title: "Recepção",
    icon: HandCoins,
    slug: "erp.reception",
    items: [
      { title: "Fila de Retiradas", url: "/erp/retiradas/fila" },
    ],
  },
  {
    title: "Operação",
    icon: PackageCheck,
    slug: "erp.production",
    items: [
      { title: "Comandas", url: "/erp/comandas" },
      { title: "Produção (Cozinha)", url: "/erp/producao/cozinha" },
    ],
  },
  {
    title: "Logística Entregas",
    icon: Truck,
    slug: "erp.delivery",
    items: [
      { title: "Fila de Despacho", url: "/erp/entregas/fila" },
    ],
  },
  {
    title: "Minha Célula",
    icon: UsersRound,
    slug: "erp.my-cell",
    items: [
      { title: "Visão Geral", url: "/erp/minha-celula" },
      { title: "Vendedores", url: "/erp/minha-celula/vendedores" },
      { title: "Colaboradores", url: "/erp/minha-celula/colaboradores" },
    ],
  },
  {
    title: "Minha Rede",
    icon: UsersRound,
    slug: "erp.my-network",
    items: [
      { title: "Visão Geral", url: "/erp/minha-rede" },
      { title: "Células da Rede", url: "/erp/minha-rede/celulas" },
    ],
  },
  {
    title: "Segurança",
    icon: Shield,
    slug: "erp.security",
    items: [
      { title: "Perfis de Acesso", url: "/erp/seguranca/perfis" },
      { title: "Módulos do Sistema", url: "/erp/seguranca/modulos" },
      { title: "Permissões por Perfil", url: "/erp/seguranca/permissoes" },
      { title: "Perfis por Usuário", url: "/erp/seguranca/usuarios" },
      { title: "Configurações do Sistema", url: "/erp/seguranca/sistema" },
    ],
  },
  {
    title: "Gestão Administrativa",
    icon: UsersRound,
    slug: "erp.admin",
    items: [
      { title: "Colaboradores", url: "/erp/colaboradores" },
      { title: "Painel de Usuários", url: "/erp/admin/perfis-usuarios" },
      { title: "Vendedores", url: "/erp/vendedores" },
      { title: "Células", url: "/erp/celulas" },
      { title: "Redes de células", url: "/erp/redes-de-celulas" },
    ],
  },
  { title: "Configurações", icon: Settings, url: "/erp/configuracoes", slug: "erp.settings" },
  { title: "Edições", icon: Calendar, url: "/erp/edicoes", slug: "erp.editions" },
  { title: "Sorteios", icon: Trophy, url: "/erp/sorteio", slug: "erp.raffle" },
  { title: "Compras", icon: ShoppingCart, url: "/erp/compras", slug: "erp.purchasing" },
  { title: "Estoque", icon: PackageCheck, url: "/erp/estoque", slug: "erp.stock" },
]

export function ErpSidebar({ user: initialUser }: { user?: any }) {
  const { state } = useSidebar()
  const { isIT, isAdmin, canAccess, loading } = usePermissions(initialUser)
  const { isProductionDay } = useEdition()
  const isCollapsed = state === "collapsed"
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null;

  const isMaster = isIT() || isAdmin();

  const canSeeMenuItem = (item: any): boolean => {
    if (isMaster) return true;
    if (!item.slug) return true; // Dashboard sempre visível
    if (loading) return false;   // Enquanto carrega, esconde tudo (evita piscar)
    return canAccess(item.slug);
  };

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="h-16 flex items-center justify-center border-b transition-all duration-300">
        <Link
          href="/erp"
          className="flex items-center gap-3 font-bold transition-all"
        >
          <Image
            src="/assets/images/dogao-do-pastor-nome.svg"
            alt="Dogão do Pastor Logo"
            width={isCollapsed ? 32 : 40}
            height={40} 
            style={{ width: isCollapsed ? '32px' : 'auto', height: isCollapsed ? '32px' : '40px' }}
            className="shrink-0 transition-all duration-300"
            priority
          />

          {!isCollapsed && (
            <span className="tracking-tighter uppercase font-black text-orange-600 whitespace-nowrap animate-in fade-in duration-500">
              SISTEMA ERP
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Administração</SidebarGroupLabel>
          <SidebarMenu>
            {/* Skeleton enquanto permissões carregam (não master) */}
            {loading && !isMaster && (
              <>
                {Array.from({ length: 4 }).map((_, i) => (
                  <SidebarMenuItem key={`skel-${i}`}>
                    <div className="flex items-center gap-3 px-3 py-2">
                      <div className="h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse shrink-0" />
                      {!isCollapsed && <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse flex-1" />}
                    </div>
                  </SidebarMenuItem>
                ))}
              </>
            )}
            {menuItems.map((item) => {
              const canSeeItem = canSeeMenuItem(item);
              // PDV: usa canAccess('erp.pdv') se disponível, senão fallback para isProductionDay
              if (item.url === '/erp/pdv' && !isMaster) {
                const pdvAllowed = canAccess('erp.pdv') || isProductionDay;
                if (!pdvAllowed) return null;
              }
              if (!canSeeItem) return null;

              return (
                <SidebarMenuItem key={item.title}>
                  {item.items ? (
                    <Collapsible className="group/collapsible">
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={item.title}>
                          <item.icon />
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((sub) => {
                            return (
                              <SidebarMenuSubItem key={sub.title}>
                                <SidebarMenuSubButton asChild>
                                  <Link href={sub.url}>{sub.title}</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <Link href={item.url!}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}