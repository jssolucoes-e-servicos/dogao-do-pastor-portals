// src/components/erp/layout/erp-sidebar.tsx
"use client"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from "@/components/ui/sidebar"
import { ChevronRight, LayoutDashboard, Settings, ShoppingCart, Store, Users } from "lucide-react"

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/erp" },
  {
    title: "Vendas",
    icon: ShoppingCart,
    items: [
      { title: "Pedidos Online", url: "/erp/orders" },
      { title: "Relatórios", url: "/erp/sales-reports" },
    ],
  },
  {
    title: "Cadastros",
    icon: Store,
    items: [
      { title: "Parceiros (Doação)", url: "/erp/partners" },
      { title: "Produtos", url: "/erp/products" },
    ],
  },
  { title: "Clientes", icon: Users, url: "/erp/customers" },
  { title: "Configurações", icon: Settings, url: "/erp/settings" },
]

export function ErpSidebar() {
  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="h-16 flex items-center justify-center border-b">
        <span className="font-black text-orange-600">DOGÃO ERP</span>
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
                              <a href={sub.url}>{sub.title}</a>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
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