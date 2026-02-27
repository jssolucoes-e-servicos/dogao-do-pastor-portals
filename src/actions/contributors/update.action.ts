// src/actions/orders/set-order-delivery.action.ts
"use server";

import { ContributorEntity } from "@/common/entities";
import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export const ContributorsUpdateAction = async (id: string, values: any): Promise<IResponseObject<ContributorEntity>> => {
  try {
    const data = await fetchApi(FetchCtx.ERP, `/contributors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(values)
    });
    return {
      success: true,
      data: data,
    }
  } catch (error) {
      console.error(`Falha ao atualizar colaborador ${id}: `, error);
      return { 
        success: false,
        error: error instanceof Error ? error.message : 'Falha ao atualizar o colaborador. Tente novamante.',
      }
      
    }
};