// src/actions/sellers/list.action.ts
"use server"

import { SellerEntity } from "@/common/entities";
import { IPaginatedData, IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export async function SellersListAction(page = 1): Promise<IResponseObject<IPaginatedData<SellerEntity>>> {
  try {
    const data = await fetchApi(FetchCtx.ERP, `/sellers?page=${page}`, {
      cache: "no-store"
    })
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error(`Falha ao recuperar vendedores: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Falha ao recuperar lista de venedores",
    };
  }
}