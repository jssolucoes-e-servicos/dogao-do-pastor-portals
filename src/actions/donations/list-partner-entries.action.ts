"use server"

import { IPaginatedData, IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export async function ListPartnerEntriesAction(
  partnerId: string,
  page: number = 1,
  perPage: number = 10
): Promise<IResponseObject<IPaginatedData<any>>> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      perPage: perPage.toString()
    });

    const res = await fetchApi(FetchCtx.ERP, `/donations/partner-entries/${partnerId}?${params.toString()}`, {
      cache: "no-store"
    });

    return {
      success: true,
      data: res
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Falha ao carregar histórico do parceiro",
    };
  }
}
