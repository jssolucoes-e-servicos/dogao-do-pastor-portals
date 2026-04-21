import {
  Calendar, HandCoins, Heart, LayoutDashboard,
  PackageCheck, Settings, Shield, ShoppingCart,
  Trophy, Truck, UsersRound, type LucideIcon,
} from "lucide-react";
import { IMenuItem } from "@/common/interfaces";
import { MENU_MY_SALES } from "./menus/my-sales.menu";
import { MENU_MY_CELL } from "./menus/my-cell.menu";
import { MENU_MY_NETWORK } from "./menus/my-network.menu";
import { MENU_SECURITY } from "./menus/security.menu";
import { MENU_CONFIGURATIONS } from "./menus/configurations.menu";
import { MENU_RAFFLE } from "./menus/raffle.menu";
import { MENU_MANAGEMENT_ADMIN } from "./menus/management-admin.menu";
import { MENU_PDV } from "./menus/pdv.menu";
import { MENU_OPERATION } from "./menus/operation.menu";
import { MENU_STOK } from "./menus/stok.menu";
import { MENU_LOGISTICS } from "./menus/logistics.menu";
import { MENU_FINANCIAL } from "./menus/financial.menu";
import { MENU_ORDERS } from "./menus/orders.menu";
import { MENU_DONATIONS } from "./menus/donations.menu";

export const ERP_MENU: IMenuItem[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    url: "/erp",
  },
  MENU_PDV, // ── PDV
  MENU_MY_SALES, // ── Vendas pessoais
  MENU_MY_CELL, // ── Líder de Célula
  MENU_MY_NETWORK, // ── Minha Rede
  MENU_ORDERS, // ── Gestão de vendas
  MENU_DONATIONS, // ── Doações
  MENU_FINANCIAL, // ── Financeiro
  MENU_LOGISTICS, // ── Logística / Retiradas
  MENU_OPERATION,// ── Operação / Produção
  MENU_MANAGEMENT_ADMIN, // ── Gestão Administrativa
  MENU_STOK, // ── Controle de Estoque
  MENU_SECURITY, // ── Vendas pessoais
  MENU_CONFIGURATIONS, // ── Configurações
  MENU_RAFFLE, // ── Sorteios
];

