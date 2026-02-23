// src/actions/orders/sale-init.action.ts
"use server";

import { IOrderInit, IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export const OrdersSaleInitAction = async (cpf:string,sellerTag:string): Promise<IResponseObject<IOrderInit>> => {
  try {
    const data = await fetchApi(FetchCtx.CUSTOMER, `/orders/init`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cpf, sellerTag })
    });

    return {
      success: false,
      data: data
    };
  } catch (error) {
    console.error(`Erro ao buscar CPF: ${error}`);
    return {
      success: false,
      error: 'Falha ao consultar cliente pelo CPF informado. Tente novamente',
    }
  }
};