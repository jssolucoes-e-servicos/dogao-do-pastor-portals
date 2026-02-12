// src/actions/customers-adresses/find-by-customer.actions.ts
"use server";

import { CustomerAddressEntity } from "@/common/entities";
import { fetchApi, FetchCtx } from "@/lib/api";

export const findAddressAction = async (id: string): Promise<CustomerAddressEntity[]> => {
  try {
     const data = await fetchApi(FetchCtx.CUSTOMER,`/customers-addresses/by-customer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customerId: id })
    });
     return data as CustomerAddressEntity[];
  }catch (error: any) {
    if (error.message === 'NEXT_REDIRECT') throw error;
    console.error("Falha ao buscar enderecos: ", error);
    throw new Error('Falha ao buscar endereços.')
    
  }
};