"use client"

import { useUser } from "./use-user"
import { useEffect, useState } from "react"
import { FetchCtx } from "@/common/enums"
import { GetMyPermissionsAction } from "@/actions/permissions/get-my-permissions.action"

export type PermissionAction = 'create' | 'update' | 'delete' | 'report';

interface ModulePermission {
  access: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
  report: boolean;
}

interface EffectivePermissions {
  contributorId: string;
  isSuperuser: boolean;
  modules: Record<string, ModulePermission>;
  controls: string[];
  dashboardCards: string[];
}

export function usePermissions(initialUser?: any) {
  const { user: cookieUser, loading: userLoading } = useUser(FetchCtx.ERP)
  const user = initialUser || cookieUser
  const [effectivePerms, setEffectivePerms] = useState<EffectivePermissions | null>(null)
  const [permsLoading, setPermsLoading] = useState(false)

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    setPermsLoading(true);
    // Usa server action para ler o cookie httpOnly corretamente
    GetMyPermissionsAction()
      .then((r) => { if (!cancelled) setEffectivePerms(r.data); })
      .catch(() => { if (!cancelled) setEffectivePerms(null); })
      .finally(() => { if (!cancelled) setPermsLoading(false); });
    return () => { cancelled = true; };
  }, [user?.id]);

  const loading = userLoading || permsLoading;

  // ── Métodos legados (retrocompatibilidade) ─────────────────────────────

  const hasRole = (role: string) => {
    if (!user) return false;
    const target = role.toUpperCase().trim();

    const rolesArray = user.roles || [];
    const userRoles = (user as any).userRoles || [];
    const roleNamesFromObj = userRoles.map((ur: any) => ur.role?.name?.toUpperCase());
    const roleIdsFromObj = userRoles.map((ur: any) => ur.roleId?.toUpperCase());

    const allRoles = [
      ...rolesArray.map((r: string) => r.toUpperCase()),
      ...roleNamesFromObj,
      ...roleIdsFromObj,
    ].filter(Boolean);

    const isMaster = allRoles.some((r: string) =>
      ["IT", "TI", "CLZ_ROLE_TI_001", "ADMIN", "ADMINISTRAÇÃO"].includes(r)
    );
    if (isMaster) return true;

    // Match exato
    if (allRoles.includes(target)) return true;

    // Match sem acentos (ex: "Administração" bate com "ADMINISTRACAO")
    const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
    return allRoles.some((r: string) => norm(r) === norm(target));
  }

  const hasAnyRole = (roles: string[]) => roles.some(role => hasRole(role))
  const isIT      = () => hasRole("IT")
  const isAdmin   = () => hasRole("ADMIN")
  const isFinance = () => hasRole("FINANCE")
  const isSeller  = () => hasRole("SELLER")
  const isDelivery = () => hasRole("DELIVERY")
  const isLeader  = () => hasRole("LEADER")
  const isManager = () => hasRole("MANAGER")

  // ── Métodos dinâmicos ──────────────────────────────────────────────────

  const canAccess = (slug: string): boolean => {
    if (!effectivePerms) return false;
    if (effectivePerms.isSuperuser) return true;
    return effectivePerms.modules[slug]?.access === true;
  }

  const canDo = (moduleSlug: string, action: PermissionAction): boolean => {
    if (!effectivePerms) return false;
    if (effectivePerms.isSuperuser) return true;
    return effectivePerms.modules[moduleSlug]?.[action] === true;
  }

  const canControl = (controlSlug: string): boolean => {
    if (!effectivePerms) return false;
    if (effectivePerms.isSuperuser) return true;
    return effectivePerms.controls.includes(controlSlug);
  }

  const dashboardCards: string[] = effectivePerms?.dashboardCards ?? [];

  return {
    user,
    loading,
    // legado
    hasRole,
    hasAnyRole,
    isIT,
    isAdmin,
    isFinance,
    isSeller,
    isDelivery,
    isLeader,
    isManager,
    // dinâmico
    canAccess,
    canDo,
    canControl,
    dashboardCards,
  }
}
