import { Calendar, Settings } from "lucide-react";

// ── Configurações
export const MENU_CONFIGURATIONS = {
    title: "Configurações",
    icon: Settings,
    slug: "erp.settings",
    items: [
      { title: "Parâmetros", url: "/erp/configuracoes" },
      { title: "Ajuste de Sistema", url: "/erp/seguranca/sistema", slug: "erp.admin" },
      { title: "Edições", icon: Calendar, url: "/erp/edicoes", slug: "erp.editions" },
    ],
  };