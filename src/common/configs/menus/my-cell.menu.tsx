import { UsersRound } from "lucide-react";

  // ── Líder de Célula ──────────────────────────────────────────────────────────────────
  export const MENU_MY_CELL = {
    title: "Minha Célula",
    icon: UsersRound,
    slug: "erp.my-cell",
    items: [
      { title: "Visão Geral", url: "/erp/minha-celula" },
      { title: "Acertos da Célula", url: "/erp/acertos-celula" },
    ],
  };