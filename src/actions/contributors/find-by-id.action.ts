// src/actions/contributors/find-by-id.action.ts
"use server"

import { ContributorEntity } from "@/common/entities";
import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export async function ContributorsByIdAction(id:string): Promise<IResponseObject<ContributorEntity>> {
  try {
    const data = await fetchApi(FetchCtx.ERP, `/contributors/show/${id}`, {
      cache: "no-store"
    })
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error(`Falha ao recuperar dados do colaborador: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Falha ao recuperar dados do colaboradpr",
    };
  }
}