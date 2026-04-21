import { Heart } from "lucide-react";

// ── Doações
export const MENU_DONATIONS = {
    title: "Doações",
    icon: Heart,
    slug: "erp.donations",
    items: [
      { title: "Painel de Doações", url: "/erp/doacoes" },
      { title: "Curadoria", url: "/erp/pedidos/doacoes-curadoria" },
      { title: "Entidades Parceiras", url: "/erp/parceiros" },
    ],
  };