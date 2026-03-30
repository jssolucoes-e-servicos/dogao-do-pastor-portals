"use server"
import { EditionEntity } from "@/common/entities";
import { getActiveEdition } from "./get-active.action";

export interface SaleStatus {
  edition: EditionEntity | null;
  canSell: boolean;
  isWaiting: boolean;
  startFormatted: string;
}

export async function getValidatedSaleStatus(): Promise<SaleStatus> {
  const response = await getActiveEdition();
  const edition = response?.edition;

  // Lógica de tempo estritamente no servidor
  const now = new Date();
  
  let canSell = false;
  let isWaiting = false;
  let startFormatted = "";

  if (edition && edition.active) {
    const start = new Date(edition.autoEnableDate);
    const end = new Date(edition.autoDisableDate);
    
    // Fuso fixo para evitar que o servidor em UTC divirja do Brasil
    startFormatted = start.toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    isWaiting = now < start;
    const isSaleOpen = now >= start && now <= end;
    const hasStock = edition.dogsSold < edition.limitSale;
    
    canSell = isSaleOpen && hasStock;
  }

  return {
    edition,
    canSell,
    isWaiting,
    startFormatted
  };
}