import { PackageCheck } from "lucide-react";

 // ── Operação / Produção
export const MENU_OPERATION = {
  title: "Operação (Produção)",
  icon: PackageCheck,
  slug: ["erp.production", "erp.delivery", "erp.reception"],
  items: [
    { title: "Comandas", url: "/erp/comandas", slug: ["erp.delivery", "erp.reception"]},
    { title: "Produção (Cozinha)", url: "/erp/producao/cozinha", slug: "erp.production"},
  ],
}