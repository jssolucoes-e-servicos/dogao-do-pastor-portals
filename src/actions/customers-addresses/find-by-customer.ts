// src/actions/customers-adresses/find-by-customer.action.ts
"use server";

import { CustomerAddressEntity } from "@/common/entities";
import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export const findAddressAction = async (id: string): Promise<IResponseObject<CustomerAddressEntity[]>> => {
  try {
    const data = await fetchApi(FetchCtx.PUBLIC,`/customers-addresses/by-customer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customerId: id })
    });
    return {
      success: true,
      data: data,
    };
  }catch (error) {
    console.error("Falha ao buscar enderecos: ", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Falha ao buscar endereços.',
    }
  }
};