// src/actions/orders-items/inserts-many.action.ts
"use server";

import { OrderEntity } from "@/common/entities";
import { IOrderItemSend, IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export const InsertsManyAction = async (orderId:string, orderItems:IOrderItemSend[]): Promise<IResponseObject<OrderEntity>> => {
  try {
    const data = await fetchApi(FetchCtx.CUSTOMER, `/orders-items/inserts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderId: orderId, orderItems: orderItems })
    });
    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error(`Falha ao gravar itens: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Falha ao gravar os itens. Tente novamante.',
    }
    
  }
};