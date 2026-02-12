"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Cookies from "js-cookie"
import { LogOut, PackageSearch, User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

const menuItems = [
  /* { name: "Home", href: "/portal-parceiro", icon: Home }, */
  { name: "Doações Recebidas", href: "/portal-parceiro/doacoes", icon: PackageSearch },
  { name: "Minha Conta", href: "/portal-parceiro/perfil", icon: User },
]

export function PartnerHeader() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    Cookies.remove("ddp-prt-00");
    Cookies.remove("ddp-prt-01");
    router.push("/portal-parceiro/acesso")
    router.refresh()
  }

  return (
    <header className="border-b bg-white w-full sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/portal-parceiro" className="flex items-center gap-2 font-bold text-xl text-orange-600">
          <Image
              src="/assets/images/dogao-do-pastor-nome.svg"
              alt="Dogão do Pastor Logo"
              width={56}
              height={12}
              priority
            />
          <span className="hidden sm:inline tracking-tighter uppercase font-black text-slate-800">
            Portal do Parceiro
          </span>
        </Link>
        
        {/* Navegação Central - O que tinha sumido */}
        <nav className="flex items-center gap-1 sm:gap-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-xs sm:text-sm font-medium transition-all flex items-center gap-2 px-3 py-2 rounded-lg",
                  isActive 
                    ? "text-orange-600 bg-orange-50" 
                    : "text-slate-500 hover:text-orange-600 hover:bg-slate-50"
                )}
              >
                <item.icon className="w-4 h-4" />
                <span className="hidden md:inline">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Botão Sair */}
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline font-bold text-xs">SAIR</span>
          </Button>
        </div>
      </div>
    </header>
  )
}