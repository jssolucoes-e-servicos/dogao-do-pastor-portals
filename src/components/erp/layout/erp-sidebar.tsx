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
import { ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { ERP_MENU, type MenuItem } from "@/common/configs/erp.menus"

export function ErpSidebar({ user: initialUser }: { user?: any }) {
  const { state } = useSidebar()
  const { isIT, isAdmin, canAccess, loading } = usePermissions(initialUser)
  const { isProductionDay } = useEdition()
  const isCollapsed = state === "collapsed"
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null

  const isMaster = isIT() || isAdmin()

  /** Verifica se o item pai deve aparecer — suporta slug como string ou string[] */
  const canSeeItem = (item: MenuItem): boolean => {
    if (isMaster) return true
    if (!item.slug) return true          // sem slug = sempre visível (Dashboard)
    if (loading) return false            // aguarda carregar permissões

    const slugs = Array.isArray(item.slug) ? item.slug : [item.slug]

    // PDV: fallback para dia de produção
    if (slugs.includes("erp.pos")) return canAccess("erp.pos") || isProductionDay

    // Aparece se tiver QUALQUER um dos slugs
    return slugs.some(s => canAccess(s))
  }

  /** Verifica se um sub-item deve aparecer — suporta slug como string ou string[] */
  const canSeeSubItem = (slug?: string | string[]): boolean => {
    if (isMaster) return true
    if (!slug) return true               // sem slug = sempre visível
    if (loading) return false
    const slugs = Array.isArray(slug) ? slug : [slug]
    return slugs.some(s => canAccess(s))
  }

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="h-16 flex items-center justify-center border-b transition-all duration-300">
        <Link href="/erp" className="flex items-center gap-3 font-bold transition-all">
          <Image
            src="/assets/images/dogao-do-pastor-nome.svg"
            alt="Dogão do Pastor Logo"
            width={isCollapsed ? 32 : 40}
            height={40}
            style={{ width: isCollapsed ? "32px" : "auto", height: isCollapsed ? "32px" : "40px" }}
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
            {/* Skeleton enquanto permissões carregam */}
            {loading && !isMaster && (
              Array.from({ length: 4 }).map((_, i) => (
                <SidebarMenuItem key={`skel-${i}`}>
                  <div className="flex items-center gap-3 px-3 py-2">
                    <div className="h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse shrink-0" />
                    {!isCollapsed && <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse flex-1" />}
                  </div>
                </SidebarMenuItem>
              ))
            )}

            {ERP_MENU.map((item) => {
              if (!canSeeItem(item)) return null

              // Item com sub-menu
              if (item.items) {
                const visibleSubs = item.items.filter(sub => canSeeSubItem(sub.slug))
                if (visibleSubs.length === 0) return null

                return (
                  <SidebarMenuItem key={item.title}>
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
                          {visibleSubs.map((sub) => (
                            <SidebarMenuSubItem key={sub.title}>
                              <SidebarMenuSubButton asChild>
                                <Link href={sub.url}>{sub.title}</Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  </SidebarMenuItem>
                )
              }

              // Item simples (link direto)
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link href={item.url!}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
