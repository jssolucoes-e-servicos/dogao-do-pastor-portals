"use server"

import { ModuleEntity } from "@/common/entities/module.entity";
import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export async function ModulesListAllAction(): Promise<IResponseObject<ModuleEntity[]>> {
  try {
    const data = await fetchApi(FetchCtx.ERP, `/modules/all`, {
      cache: "no-store"
    });

    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error(`Falha ao recuperar módulos: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Falha ao recuperar lista de módulos",
    };
  }
}
