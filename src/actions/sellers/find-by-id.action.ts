// src/actions/sellers/find-by-id.action.ts
"use server"

import { SellerEntity } from "@/common/entities";
import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

interface ISellerEntityWhithStats {
  seller: SellerEntity;
  stats: {
    paidItems: number;
    pendingItems: number;
    totalValue: number;
  }
}

export async function SellersByIdAction(sellerId:string): Promise<IResponseObject<ISellerEntityWhithStats>> {
  try {
    const data = await fetchApi(FetchCtx.ERP, `/sellers/${sellerId}`, {
      cache: "no-store"
    })
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error(`Falha ao recuperar dados do vendedor: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Falha ao recuperar dados do vendedor",
    };
  }
}