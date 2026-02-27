// src/actions/customer/find-by-id.action.ts
"use server"

import { CellEntity } from "@/common/entities";
import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export async function CellsByIdAction(cellId:string): Promise<IResponseObject<CellEntity>> {
  try {
    const data = await fetchApi(FetchCtx.ERP, `/cells/show/${cellId}`, {
      cache: "no-store"
    })
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error(`Falha ao recuperar dados da célula: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Falha ao recuperar dados da célula",
    };
  }
}