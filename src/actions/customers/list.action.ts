// src/actions/customer/list.action.ts
"use server"

import { CustomerEntity } from "@/common/entities";
import { IPaginatedData, IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export async function CustomersListAction(page = 1): Promise<IResponseObject<IPaginatedData<CustomerEntity>>> {
  try {
    const data = await fetchApi(FetchCtx.ERP, `/customers?page=${page}`, {
      cache: "no-store"
    })
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