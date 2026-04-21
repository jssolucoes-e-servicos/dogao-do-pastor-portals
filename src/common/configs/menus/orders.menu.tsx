import { ShoppingCart } from "lucide-react";

// ── Gestão de vendas
export const MENU_ORDERS = {
    title: "Pedidos & Clientes",
    icon: ShoppingCart,
    slug: ["erp.orders","erp.customers"],
    items: [
      { title: "Todos os Pedidos", url: "/erp/pedidos", slug: "erp.orders" },
      { title: "Clientes", url: "/erp/clientes", slug: "erp.customers" },
      { title: "Em Análise", url: "/erp/pedidos/em-analise", slug: "erp.orders" },
    ],
  }