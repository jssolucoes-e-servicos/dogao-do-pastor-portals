"use server"

import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export async function SearchCustomerAction(params: { cpf?: string, phone?: string, search?: string }): Promise<IResponseObject<any>> {
  try {
    const query = new URLSearchParams();
    if (params.cpf) query.append("cpf", params.cpf);
    if (params.phone) query.append("phone", params.phone);
    if (params.search) query.append("search", params.search);

    const data = await fetchApi(FetchCtx.ERP, `/customers?${query.toString()}`, {
      method: "GET",
    });

    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error(`Falha ao buscar cliente: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Falha ao buscar cliente",
    };
  }
}
