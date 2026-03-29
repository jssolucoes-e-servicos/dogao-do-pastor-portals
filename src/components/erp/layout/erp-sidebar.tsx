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
import {
  Building2,
  Calendar,
  ChevronRight,
  HandCoins,
  Heart,
  LayoutDashboard,
  PackageCheck,
  Settings,
  ShoppingCart,
  Ticket,
  Trophy,
  Truck,
  Users,
  UsersRound
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/erp" },
  { title: "PDV (Ponto de Venda)", url: "/erp/pdv", icon: ShoppingCart},
  {
    title: "Vendas & Clientes",
    icon: ShoppingCart,
    roles: ["IT", "ADMIN", "FINANCE", "SELLER", "RECEPTION"],
    items: [
       /*{ title: "PDV (Ponto de Venda)", url: "/erp/pdv" },*/
      { title: "Todos os Pedidos", url: "/erp/pedidos" }, 
      { title: "Clientes", url: "/erp/clientes", roles: ["IT", "ADMIN", "RECEPTION"] },
      { title: "Em análise", url: "/erp/pedidos/em-analise", roles: ["IT", "ADMIN", "RECEPTION"] },
    ],
  },
  
  {
    title: "Doações",
    icon: Heart,
    roles: ["IT", "ADMIN", "FINANCE", "RECEPTION"],
    items: [
      { title: "Painel de Doações", url: "/erp/doacoes" },
      { title: "Curadoria", url: "/erp/pedidos/doacoes-curadoria", roles: ["IT", "ADMIN", "FINANCE"] },
      { title: "Entidades Parceiras", url: "/erp/parceiros", roles: ["IT", "ADMIN", "FINANCE"] },
    ],
  },
  {
    title: "Recepção",
    icon: HandCoins,
    roles: ["IT", "ADMIN", "RECEPTION", "EXPEDITION"],
    items: [
      { title: "Fila de Retiradas", url: "/erp/retiradas/fila" },
    ],
  },
  {
    title: "Operação",
    icon: PackageCheck,
    roles: ["IT", "ADMIN", "RECEPTION", "EXPEDITION"],
    items: [
      { title: "Comandas", url: "/erp/comandas" },
      { title: "Produção (Cozinha)", url: "/erp/producao/cozinha" },
    ],
  },

  {
    title: "Logística Entregas",
    icon: Truck,
    roles: ["IT", "ADMIN", "EXPEDITION", "DELIVERY"],
    items: [
      { title: "Fila de Despacho", url: "/erp/entregas/fila" },
      /* { title: "Gerenciar Rotas", url: "/erp/entregas/rotas" }, */
      /* { title: "Rastreio Real-time", url: "/erp/entregas/rastreio" }, */
      /* { title: "Ocorrências", url: "/erp/entregas/chamados" }, */
    ],
  },

  {
    title: "Gestão Administrativa",
    icon: UsersRound,
    roles: ["IT", "ADMIN", "MANAGER", "LEADER"],
    items: [
      { title: "Colaboradores", url: "/erp/colaboradores", roles: ["IT", "ADMIN"] },
     /*  { title: "Venda por Ticket", url: "/erp/admin/venda-ticket", icon: Ticket }, */
      { title: "Painel de Usuários", url: "/erp/admin/perfis-usuarios", roles: ["IT", "ADMIN"] },
      { title: "Gestão de Perfis", url: "/erp/perfis", roles: ["IT", "ADMIN"] },
      { title: "Permissões & Acessos", url: "/erp/configuracoes/permissoes", roles: ["IT"] },
      { title: "Vendedores", url: "/erp/vendedores" },
      { title: "Células", url: "/erp/celulas" },
      { title: "Redes de células", url: "/erp/redes-de-celulas", roles: ["IT", "ADMIN", "MANAGER"] },
    ],
  },

  {
    title: "Configurações",
    icon: Settings,
    url: "/erp/configuracoes",
    roles: ["IT", "ADMIN"]
  },
  {
    title: "Edições",
    icon: Calendar,
    url: "/erp/edicoes",
    roles: ["IT", "ADMIN"]
  },
  {
    title: "Sorteios",
    icon: Trophy,
    url: "/erp/sorteio",
    roles: ["IT", "ADMIN"]
  }
]

export function ErpSidebar({ user: initialUser }: { user?: any }) {
  const { state } = useSidebar()
  const { hasAnyRole, isIT, isAdmin, loading, user } = usePermissions(initialUser)
  const isCollapsed = state === "collapsed"
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if ((loading && !initialUser) || !mounted) return null;

  const isMaster = isIT() || isAdmin();

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
            {menuItems.map((item) => {
              // TI vê tudo. Outros perfis precisam da role ou o item não ter roles.
              const canSeeItem = isMaster || !item.roles || hasAnyRole(item.roles);
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
                            // TI vê tudo. Outros perfis precisam da role ou o subitem não ter roles.
                            const canSeeSub = isMaster || !sub.roles || hasAnyRole(sub.roles);
                            if (!canSeeSub) return null;

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