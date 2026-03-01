// src/components/erp/layout/user-nav.tsx
"use client"

import { AuthContributorLogoutAction } from "@/actions/auth/contributor-login.action"
import { UserTypesEnum } from "@/common/enums"
import { ChangePasswordModal } from "@/components/security/change-password-modal"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { User } from "lucide-react"
import Link from "next/link"
import { Fragment, useState } from "react"

interface UserNavProps {
  user: {
    id: string;
    name: string;
    email?: string;
    photo?: string;
  };
}

export function UserNav({ user }: UserNavProps) {
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  return (
    <Fragment>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-orange-100 bg-orange-50/50">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.photo} alt={user.name} className="object-cover" />
              <AvatarFallback className="bg-orange-600 text-white font-bold">
                {user.name.charAt(0).toUpperCase() || <User size={40} />}
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
              <Link href="/erp/perfil">Minha Conta</Link>
              
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