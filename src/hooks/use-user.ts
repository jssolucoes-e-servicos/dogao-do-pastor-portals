"use client"

import { useEffect, useState } from "react"
import Cookies from "js-cookie"
import { FetchCtx } from "@/common/enums"

export interface UserSession {
  id: string
  name: string
  email?: string
  roles?: string[]
  sellerId?: string | null
  deliveryPersonId?: string | null
  leaderCellId?: string | null
  supervisorNetworkId?: string | null
}

export function useUser(ctx: FetchCtx = FetchCtx.ERP) {
  const [user, setUser] = useState<UserSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cookieName = ctx === FetchCtx.ERP ? "ddp-ctb-01" : 
                       ctx === FetchCtx.PARTNER ? "ddp-prt-01" : "ddp-ctm-01"
    
    const cookieData = Cookies.get(cookieName)
    console.log(`[useUser] Cookie ${cookieName}:`, cookieData ? 'Encontrado' : 'Não encontrado');
    
    if (cookieData) {
      try {
        // Tenta decode primeiro, se falhar tenta parse direto
        let rawData = cookieData;
        try {
          rawData = decodeURIComponent(cookieData);
        } catch (e) {
          console.warn("[useUser] Falha no decodeURIComponent, tentando parse direto");
        }

        const parsed = JSON.parse(rawData)
        console.log(`[useUser] Usuário carregado:`, parsed.name, 'Roles:', parsed.roles);
        setUser(parsed)
      } catch (e) {
        console.error("[useUser] Erro crítico ao parsear cookie de usuário:", e)
      }
    }
    
    setLoading(false)
  }, [ctx])

  return { user, loading }
}
