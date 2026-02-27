// src/actions/sellers/list.action.ts
"use server"

import { CellEntity, CellNetworkEntity } from "@/common/entities";
import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export async function CellsNEtworksListAllAction(): Promise<IResponseObject<CellNetworkEntity[]>> {
  try {
    const data = await fetchApi(FetchCtx.ERP, `/cells-networks/list-all`, {
      cache: "no-store"
    })
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error(`Falha ao recuperar lista todas as células: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Falha ao recuperar listar todas as células",
    };
  }
}