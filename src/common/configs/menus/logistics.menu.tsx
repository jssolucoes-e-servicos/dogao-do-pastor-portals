import { HandCoins } from "lucide-react";

// ── Logística / Retiradas
export const MENU_LOGISTICS = {
  title: "Logística",
  icon: HandCoins,
  slug: ["erp.delivery", "erp.reception"],
  items: [
    { title: "Fila de Despacho", url: "/erp/entregas/fila", slug: ["erp.delivery"]},
    { title: "Fila de Retiradas", url: "/erp/retiradas/fila", slug: ["erp.reception", "erp.delivery"]},
  ],
}