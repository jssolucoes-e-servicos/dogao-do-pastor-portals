// src/actions/customer/find-by-id.action.ts
"use server"

import { CustomerEntity } from "@/common/entities";
import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export async function CustomersByIdAction(customerId:string): Promise<IResponseObject<CustomerEntity>> {
  try {
    const data = await fetchApi(FetchCtx.ERP, `/customers/find/${customerId}`, {
      cache: "no-store"
    })
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error(`Falha ao listar clientes: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Falha ao listar clientes",
    };
  }
}