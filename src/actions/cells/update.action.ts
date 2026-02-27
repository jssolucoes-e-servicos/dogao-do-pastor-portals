// src/actions/orders/set-order-delivery.action.ts
"use server";

import { CellEntity } from "@/common/entities";
import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export const CellsUpdateAction = async (id: string, values: any): Promise<IResponseObject<CellEntity>> => {
  try {
    const data = await fetchApi(FetchCtx.ERP, `/cells/${id}`, {
      method: 'PUT',
      body: JSON.stringify(values)
    });
    return {
      success: true,
      data: data,
    }
  } catch (error) {
      console.error(`Falha ao atualizar rede ${id}: `, error);
      return { 
        success: false,
        error: error instanceof Error ? error.message : 'Falha ao atualizar a rede. Tente novamante.',
      }
      
    }
};