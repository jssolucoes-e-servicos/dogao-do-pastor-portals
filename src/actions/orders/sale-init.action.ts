"use server";

import { IOrderInit } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export const OrdersSaleInitAction = async (cpf:string,sellerTag:string): Promise<IOrderInit> => {
  try {
    const data = await fetchApi(FetchCtx.CUSTOMER, `/orders/init`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cpf, sellerTag })
    });

    return data as IOrderInit;
  } catch (error: any) {
    if (error.message === 'NEXT_REDIRECT') throw error;
    console.error("Erro ao buscar CPF:", error);
    throw new Error('Falha ao consultar cliente pelo CPF informado. Tente novamente');
  }
};