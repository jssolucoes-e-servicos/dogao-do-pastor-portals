// src/actions/customers-adresses/create-address.actions.ts
"use server";

import { CustomerAddressEntity } from "@/common/entities";
import { fetchApi, FetchCtx } from "@/lib/api";

export const createAddressAction = async (payload: Partial<CustomerAddressEntity>): Promise<CustomerAddressEntity> => {
  try {
     const data = await fetchApi(FetchCtx.CUSTOMER,`/customers-addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
     return data as CustomerAddressEntity;
  }catch (error: any) {
    if (error.message === 'NEXT_REDIRECT') throw error;
    console.error("Falha ao gravar itens: ", error);
    throw new Error('Falha ao buscar endereços.')
    
  }
};