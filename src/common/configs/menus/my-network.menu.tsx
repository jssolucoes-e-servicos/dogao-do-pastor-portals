import { UsersRound } from "lucide-react";

// ── Minha Rede ────────────────────────────────────────────────────────────────────
  export const MENU_MY_NETWORK ={
    title: "Minha Rede",
    icon: UsersRound,
    slug: "erp.my-network",
    items: [
      { title: "Visão Geral", url: "/erp/minha-rede" },
      { title: "Células da Rede", url: "/erp/minha-rede/celulas" },
      { title: "Vendas da Rede", url: "/erp/minha-rede/vendas" },
      { title: "Acertos da Rede", url: "/erp/minha-rede/acertos" },
    ],
  };
