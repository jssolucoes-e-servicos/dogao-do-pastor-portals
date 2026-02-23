// src/actions/customers-adresses/create-address.action.ts
"use server";

import { CustomerAddressEntity } from "@/common/entities";
import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export const createAddressAction = async (payload: Partial<CustomerAddressEntity>): Promise<IResponseObject<CustomerAddressEntity>> => {
  try {
    const data = await fetchApi(FetchCtx.PUBLIC,`/customers-addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    return {
      success: true,
      data: data
    };
  }catch (error) {
    console.error("Falha ao gravar itens: ", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Falha ao buscar endereços.',
    }
  }
};