"use server"

import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export type EditionSummary = {
  edition: {
    id: string;
    name: string;
    code: string;
    productionDate: string;
    dogPrice: number;
    limitSale: number;
  };
  generatedAt: string;
  totals: {
    orders: number;
    dogs: number;
    revenue: number;
    byOrigin: {
      site: { orders: number; dogs: number; revenue: number };
      pdv:  { orders: number; dogs: number; revenue: number };
    };
  };
  deliverySummary: {
    pickup:   { orders: number; dogs: number };
    delivery: { orders: number; dogs: number };
    donate:   { orders: number; dogs: number };
  };
  rankingBySeller: {
    position: number;
    tag: string;
    name: string;
    orders: number;
    dogs: number;
    revenue: number;
  }[];
};

export async function GetEditionSummaryAction(
  editionId: string,
): Promise<IResponseObject<EditionSummary>> {
  try {
    const data = await fetchApi(FetchCtx.ERP, `/reports/edition/${editionId}/summary`, {
      cache: "no-store",
    });
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao carregar relatório",
    };
  }
}
