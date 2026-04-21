import { Shield } from "lucide-react";

// ── Vendas pessoais
export const MENU_SECURITY = {
    title: "Segurança",
    icon: Shield,
    slug: "erp.security",
    items: [
      { title: "Perfis de Acesso", url: "/erp/seguranca/perfis" },
      { title: "Módulos do Sistema", url: "/erp/seguranca/modulos" },
      { title: "Permissões por Perfil", url: "/erp/seguranca/permissoes" },
      { title: "Perfis por Usuário", url: "/erp/seguranca/usuarios" },
    ],
  };