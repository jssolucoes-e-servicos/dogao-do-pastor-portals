"use server"

import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";
import { EditionEntity } from "./paginate-editions.action";

export async function GetEditionByIdAction(id: string): Promise<IResponseObject<EditionEntity>> {
  try {
    const data = await fetchApi(FetchCtx.ERP, `/editions/${id}`, { cache: "no-store" });
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Falha ao buscar edição" };
  }
}
