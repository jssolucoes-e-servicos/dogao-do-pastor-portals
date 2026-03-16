"use client"

import { FetchCtx } from "@/common/enums"
import { useUser } from "./use-user"

export function usePermissions(initialUser?: any) {
  const { user: cookieUser, loading } = useUser(FetchCtx.ERP)
  const user = initialUser || cookieUser

  const hasRole = (role: string) => {
    if (!user) return false;
    const target = role.toUpperCase().trim();
    
    // 1. Array simples de strings (nomes e IDs)
    const rolesArray = user.roles || [];
    
    // 2. Objeto estruturado vindo do banco (se disponível)
    const userRoles = (user as any).userRoles || [];
    const roleNamesFromObj = userRoles.map((ur: any) => ur.role?.name?.toUpperCase());
    const roleIdsFromObj = userRoles.map((ur: any) => ur.roleId?.toUpperCase());

    const allRoles = [
      ...rolesArray.map((r: string) => r.toUpperCase()), 
      ...roleNamesFromObj, 
      ...roleIdsFromObj
    ].filter(Boolean);

    // Bypasses mestres: IT e ADMIN têm acesso a tudo
    const isMaster = allRoles.some((r: string) => 
      ["IT", "TI", "CLZ_ROLE_TI_001", "ADMIN", "ADMINISTRAÇÃO"].includes(r)
    );

    if (isMaster) return true;

    return allRoles.includes(target);
  }

  const hasAnyRole = (roles: string[]) => {
    return roles.some(role => hasRole(role))
  }

  const isIT = () => hasRole("IT")
  const isAdmin = () => hasRole("ADMIN")
  const isFinance = () => hasRole("FINANCE")
  const isSeller = () => hasRole("SELLER")
  const isDelivery = () => hasRole("DELIVERY")
  const isLeader = () => hasRole("LEADER")
  const isManager = () => hasRole("MANAGER")

  return {
    user,
    loading,
    hasRole,
    hasAnyRole,
    isIT,
    isAdmin,
    isFinance,
    isSeller,
    isDelivery,
    isLeader,
    isManager
  }
}
