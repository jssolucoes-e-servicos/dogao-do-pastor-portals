// src/components/erp/layout/user-nav.tsx
"use client"

import { AuthContributorLogoutAction } from "@/actions/auth/contributor-login.action"
import { UserTypesEnum } from "@/common/enums"
import { ChangePasswordModal } from "@/components/security/change-password-modal"
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
import { Fragment, useState } from "react"

interface UserNavProps {
  user: {
    id: string;
    name: string;
    email?: string;
  };
}

export function UserNav({ user }: UserNavProps) {
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  const initials = user.name
    .split(" ")
    .filter(Boolean)
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2) || "CT";

  return (
    <Fragment>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-orange-100 bg-orange-50/50">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-orange-600 text-white font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-bold leading-none">{user.name || "Colaborador"}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.email || "Igreja Viva em Células"}</p>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuGroup>
            <DropdownMenuItem className="cursor-pointer">
              Minha Conta
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="cursor-pointer" 
              onClick={() => setIsPasswordOpen(true)}
            >
              Alterar Senha
            </DropdownMenuItem>
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={async () => await AuthContributorLogoutAction()} 
            className="text-red-600 focus:text-red-600 cursor-pointer font-bold"
          >
            Sair do Sistema
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ChangePasswordModal 
        isOpen={isPasswordOpen} 
        onClose={() => setIsPasswordOpen(false)} 
        userId={user.id}
        typeUser={UserTypesEnum.CONTRIBUTOR} // Alterado para CONTRIBUTOR conforme o contexto do ERP
      />
    </Fragment>
  )
}