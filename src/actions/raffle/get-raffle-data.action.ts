"use server"

import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export type CustomerRaffleEntry = {
  customerId: string;
  customerName: string;
  tickets: number;
}

export type SellerRaffleEntry = {
  sellerId: string;
  sellerName: string;
  sellerTag: string;
  totalDogs: number;
  tickets: number;
}

export async function GetCustomerRaffleAction(editionId: string): Promise<IResponseObject<CustomerRaffleEntry[]>> {
  try {
    const data = await fetchApi(FetchCtx.ERP, `/reports/raffle/customers?editionId=${editionId}`, { cache: "no-store" });
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erro ao carregar dados" };
  }
}

export async function GetSellerRaffleAction(editionId: string): Promise<IResponseObject<SellerRaffleEntry[]>> {
  try {
    const data = await fetchApi(FetchCtx.ERP, `/reports/raffle/sellers?editionId=${editionId}`, { cache: "no-store" });
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erro ao carregar dados" };
  }
}
