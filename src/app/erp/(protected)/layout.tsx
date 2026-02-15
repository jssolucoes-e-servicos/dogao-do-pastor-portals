// src/app/(erp)/layout.tsx
import { ErpSidebar } from "@/components/erp/layout/erp-sidebar"
import { UserNav } from "@/components/erp/layout/user-nav"; // Componente de perfil/logout
import { ModeToggle } from "@/components/mode-toggle"; // Botão dark/light
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export default async function ErpLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SidebarProvider>
        <ErpSidebar />
        <SidebarInset>
          {/* Header Fixo */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 justify-between bg-background/95 backdrop-blur">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <div className="h-4 w-px bg-border mx-2" />
              <h1 className="text-sm font-medium">Dashboard Administrativo</h1>
            </div>
            <div className="flex items-center gap-4">
              <ModeToggle />
              <UserNav />
            </div>
          </header>

          {/* Conteúdo do ERP */}
          <main className="flex-1 p-6 overflow-y-auto bg-muted/30">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  )
}