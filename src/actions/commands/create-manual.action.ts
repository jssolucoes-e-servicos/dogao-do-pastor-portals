"use server"

import { CommandEntity } from "@/common/entities";
import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export interface CreateManualCommandDto {
  customerName: string;
  cpf?: string;
  phone: string;
  deliveryOption: string;
  scheduledTime?: string;
  sellerId?: string;
  sellerTag?: string;
  observation?: string;
  address?: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    complement?: string;
  };
  items: Array<{
    removedIngredients?: string[];
  }>;
}

export async function CreateManualCommandAction(dto: CreateManualCommandDto): Promise<IResponseObject<CommandEntity>> {
  try {
    const data = await fetchApi(FetchCtx.ERP, "/commands/manual", {
      method: "POST",
      body: JSON.stringify(dto),
    });
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erro ao criar comanda manual" 
    };
  }
}
