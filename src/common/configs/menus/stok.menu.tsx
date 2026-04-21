import { PackageCheck } from "lucide-react";

// ── Controle de Estoque
export const MENU_STOK = {
    title: "Controle de Estoque",
    icon: PackageCheck,
    slug: "erp.stock",
    items: [
      { title: "Compras (Reposição)", url: "/erp/compras", slug: "erp.purchasing" },
      { title: "Manutenção (Baixas)", url: "/erp/estoque", slug: "erp.stock" },
    ],
  };