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
import {
  Building2,
  ChevronRight,
  LayoutDashboard,
  Users,
  UsersRound
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/erp" },
  { title: "Clientes", icon: Users, url: "/erp/clientes" },
  { title: "Entidades Parceiras", icon: Building2, url: "/erp/parceiros" },

  {
    title: "Cadastros Auxiliares",
    icon: UsersRound,
    items: [
      { title: "Vendedores", url: "/erp/vendedores" },
      { title: "Células", url: "/erp/celulas" },
      { title: "Redes de Células", url: "/erp/redes-de-celulas" },
    ],
  },
  /* {
    title: "Vendas",
    icon: ShoppingCart,
    items: [
      { title: "Pedidos Online", url: "/erp/orders" },
      { title: "Relatórios", url: "/erp/sales-reports" },
    ],
  }, */
  /* {
    title: "Cadastros",
    icon: Store,
    items: [
      { title: "Parceiros (Doação)", url: "/erp/partners" },
      { title: "Produtos", url: "/erp/products" },
    ],
  }, */
  /* { title: "Configurações", icon: Settings, url: "/erp/settings" }, */
]

export function ErpSidebar() {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

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
            height={isCollapsed ? 32 : 40}
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
            {menuItems.map((item) => (
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
                        {item.items.map((sub) => (
                          <SidebarMenuSubItem key={sub.title}>
                            <SidebarMenuSubButton asChild>
                              <Link href={sub.url}>{sub.title}</Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
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
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}