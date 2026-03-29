"use server"

import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";
import { EditionEntity } from "./paginate-editions.action";

export async function UpsertEditionAction(
  isEdit: boolean,
  id: string | null,
  payload: unknown
): Promise<IResponseObject<EditionEntity>> {
  try {
    const endpoint = isEdit && id ? `/editions/${id}` : `/editions`;
    const data = await fetchApi(FetchCtx.ERP, endpoint, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Falha ao salvar edição" };
  }
}
