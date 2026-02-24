// src/app/(erp)/layout.tsx
import { ErpSidebar } from "@/components/erp/layout/erp-sidebar";
import { UserNav } from "@/components/erp/layout/user-nav";
import { ModeToggle } from "@/components/mode-toggle";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function ErpLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const userDataCookie = cookieStore.get("ddp-ctb-01")?.value;
  
  if (!userDataCookie) {
    redirect("/login"); // Garante que se não houver cookie, ele sai do layout
  }

  let user;
  try {
    user = JSON.parse(decodeURIComponent(userDataCookie));
  } catch (e) {
    redirect("/login"); // Se o cookie estiver corrompido, redireciona
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SidebarProvider>
        <ErpSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 justify-between bg-background/95 backdrop-blur">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <div className="h-4 w-px bg-border mx-2" />
              <h1 className="text-sm font-medium">Dashboard Administrativo</h1>
            </div>
            <div className="flex items-center gap-4">
              <ModeToggle />
              {/* Aqui o user é garantidamente não-nulo */}
              <UserNav user={user} />
            </div>
          </header>

          <main className="flex-1 p-6 overflow-y-auto bg-muted/30">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  )
}