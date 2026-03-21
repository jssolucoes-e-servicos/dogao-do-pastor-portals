"use server"

import { IPaginatedData, IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";
import { CommandEntity } from "@/common/entities";

export async function CommandsPaginateAction(
  page: number = 1,
  limit: number = 20,
  search?: string,
  status?: string | string[],
  deliveryOption?: string
): Promise<IResponseObject<IPaginatedData<CommandEntity>>> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      perPage: limit.toString(),
    });

    if (search) params.append("search", search);
    if (deliveryOption) params.append("deliveryOption", deliveryOption);
    
    if (status) {
      if (Array.isArray(status)) {
        status.forEach(s => params.append("status", s));
      } else {
        params.append("status", status);
      }
    }

    const res = await fetchApi(FetchCtx.ERP, `/commands?${params.toString()}`, {
      cache: "no-store"
    });

    return {
      success: true,
      data: res
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Falha ao carregar comandas",
    };
  }
}
