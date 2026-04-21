import { UsersRound } from "lucide-react";

// ── Gestão Administrativa
export const MENU_MANAGEMENT_ADMIN = {
    title: "Gestão Administrativa",
    icon: UsersRound,
    slug: "erp.admin",
    items: [
      { title: "Colaboradores", url: "/erp/colaboradores" },
      { title: "Painel de Usuários", url: "/erp/admin/perfis-usuarios" },
      { title: "Vendedores", url: "/erp/vendedores" },
      { title: "Células", url: "/erp/celulas" },
      { title: "Redes de Células", url: "/erp/redes-de-celulas" },
    ],
  };