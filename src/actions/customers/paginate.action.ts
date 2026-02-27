// src/actions/customer/list.action.ts
"use server"

import { CustomerEntity } from "@/common/entities";
import { IPaginatedData, IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export async function CustomersPaginateAction(page = 1, search= ""): Promise<IResponseObject<IPaginatedData<CustomerEntity>>> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      perPage: "10"
    });

    if (search) params.append("search", search);
    const data = await fetchApi(FetchCtx.ERP, `/customers?${params.toString()}`, {
      cache: "no-store"
    });

    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error(`Falha ao recuperar cliente: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Falha ao recuperaar dados do cliente",
    };
  }
}