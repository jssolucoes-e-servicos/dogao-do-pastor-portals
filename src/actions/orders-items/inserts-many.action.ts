"use server";

import { OrderEntity } from "@/common/entities";
import { IOrderItemSend } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export const InsertsManyAction = async (orderId:string, orderItems:IOrderItemSend[]): Promise<OrderEntity> => {
  try {
    console.log('orderItems', orderItems)
    const data = await fetchApi(FetchCtx.CUSTOMER, `/orders-items/inserts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderId: orderId, orderItems: orderItems })
    });

    return data as OrderEntity;

  } catch (error: any) {
    if (error.message === 'NEXT_REDIRECT') throw error;
    console.error("Falha ao gravar itens: ", error);
    throw new Error('Falha ao gravar os itens. Tente novamante.')
    
  }
};