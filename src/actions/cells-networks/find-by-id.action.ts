// src/actions/customer/find-by-id.action.ts
"use server"

import { CellNetworkEntity } from "@/common/entities";
import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export async function CellsNetworksByIdAction(networkId:string): Promise<IResponseObject<CellNetworkEntity>> {
  try {
    const data = await fetchApi(FetchCtx.ERP, `/cells-networks/show/${networkId}`, {
      cache: "no-store"
    })
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error(`Falha ao recuperar dados da rede: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Falha ao recuperar dados da rede",
    };
  }
}