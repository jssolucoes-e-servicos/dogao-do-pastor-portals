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
  ShoppingCart,
  Users,
  UsersRound
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { usePermissions } from "@/hooks/use-permissions"

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/erp" },
  { 
    title: "Clientes", 
    icon: Users, 
    url: "/erp/clientes", 
    roles: ["IT", "ADMIN", "FINANCE", "RECEPTION"] 
  },
  { 
    title: "Entities & Partners", 
    icon: Building2, 
    url: "/erp/parceiros", 
    roles: ["IT", "ADMIN", "FINANCE"] 
  },

  {
    title: "Orders",
    icon: ShoppingCart,
    roles: ["IT", "ADMIN", "FINANCE", "SELLER", "RECEPTION"],
    items: [
      { title: "List All", url: "/erp/pedidos" },
      { 
        title: "Orders in Review", 
        url: "/erp/pedidos/em-analise", 
        roles: ["IT", "ADMIN", "RECEPTION"] 
      },
      { 
        title: "Donation Curation", 
        url: "/erp/pedidos/doacoes-curadoria", 
        roles: ["IT", "ADMIN", "FINANCE"] 
      },
    ],
  },

  {
    title: "Main Registries",
    icon: UsersRound,
    roles: ["IT", "ADMIN", "MANAGER", "LEADER"],
    items: [
      { 
        title: "Contributors", 
        url: "/erp/colaboradores", 
        roles: ["IT", "ADMIN"] 
      },
      { title: "Sellers", url: "/erp/vendedores" },
      { 
        title: "Cells", 
        url: "/erp/celulas", 
        roles: ["IT", "ADMIN", "MANAGER", "LEADER"] 
      },
      { 
        title: "Cell Networks", 
        url: "/erp/redes-de-celulas", 
        roles: ["IT", "ADMIN", "MANAGER"] 
      },
    ],
  },
]

export function ErpSidebar({ user: initialUser }: { user?: any }) {
  const { state } = useSidebar()
  const { hasAnyRole, isIT, loading, user } = usePermissions(initialUser)
  const isCollapsed = state === "collapsed"
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if ((loading && !initialUser) || !mounted) return null;

  const isMaster = isIT();
  
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
              SISTEMA ERP {isMaster && " (IT)"}
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