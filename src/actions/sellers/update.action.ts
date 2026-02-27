// src/actions/orders/set-order-delivery.action.ts
"use server";

import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";
import { SellerEntity } from '../../common/entities/seller.entity';

export const SellerUpdateAction = async (id: string, cellId: string, name:string): Promise<IResponseObject<SellerEntity>> => {
  try {
    const data = await fetchApi(FetchCtx.ERP, `/sellers/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        cellId: cellId,
        name: name
      })
    });
    return {
      success: true,
      data: data,
    }
  } catch (error) {
      console.error(`Falha ao atualizar vendedor ${id}: `, error);
      return { 
        success: false,
        error: error instanceof Error ? error.message : 'Falha ao atualizar o vendedor. Tente novamante.',
      }
      
    }
};