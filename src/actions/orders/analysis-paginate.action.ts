"use server"

import { OrderEntity } from "@/common/entities";
import { IPaginatedData, IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export async function OrdersAnalysisPaginateAction(
  page = 1, 
  search = ""
): Promise<IResponseObject<IPaginatedData<OrderEntity>>> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      perPage: "10"
    });

    if (search) params.append("search", search);
    
    // Usando o seu fetchApi configurado para o Contexto ERP
    const data = await fetchApi(FetchCtx.ERP, `/orders/pending-analysis?${params.toString()}`, {
      cache: "no-store"
    });

    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error(`Falha ao recuperar fila de análise: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Falha ao recuperar pedidos para análise",
    };
  }
}