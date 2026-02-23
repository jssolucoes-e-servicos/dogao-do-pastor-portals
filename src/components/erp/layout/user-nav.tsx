// src/components/erp/layout/user-nav.tsx
"use client"

import { AuthContributorLogoutAction } from "@/actions/auth/contributor-login.action"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function UserNav() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email?: string } | null>(null);

  useEffect(() => {
    const userData = Cookies.get("ddp-ctb-01");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error("Erro ao ler dados do usuário: ", e);
      }
    }
  }, []);

  const initials = user?.name?.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) || "SF";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-orange-100 bg-orange-50/50">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-orange-600 text-white font-bold">{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-bold leading-none">{user?.name || "Colaborador"}</p>
            <p className="text-xs leading-none text-muted-foreground">{user?.email || "Igreja Viva em Cálulas"}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="cursor-pointer">Minha Conta</DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">Alterar Senha</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={async () => await AuthContributorLogoutAction()} className="text-red-600 focus:text-red-600 cursor-pointer font-bold">
          Sair do Sistema
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}