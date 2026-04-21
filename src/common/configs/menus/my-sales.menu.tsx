import { ShoppingCart } from "lucide-react";

// ── Vendas pessoais ─────────────────────────────────────────────────────────
export const MENU_MY_SALES = {
    title: "Minhas Vendas",
    icon: ShoppingCart,
    slug: "erp.my-sales",
    items: [
      {
        title: "Listagem de vendas",
        url: "/erp/minhas-vendas",
        slug: "erp.my-sales",
      },
      {
        title: "Meu Acerto Financeiro",
        url: "/erp/meu-acerto",
        slug: "erp.my-settlement",
      },
    ],
  };