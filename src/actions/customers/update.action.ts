// src/actions/customer/update-in-orders.action.ts
"use server";

import { WhatsappIsValidAction } from "@/actions/whatsapp/is-valid.action";
import { CustomerEntity } from "@/common/entities";
import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export const CustomersUpdateAction = async (customerId: string, values: any): Promise<IResponseObject<CustomerEntity>> => {
  try {  
    const {message: checkWpp} = await WhatsappIsValidAction(values?.phone);
    if (checkWpp === null) { 
      return {
        success: false,
        error: "Ocorreu uma falha ao verificar se seu número é um whatsapp válido.",
      }
    }

    if (checkWpp === 'false') {
      return {
        success: false,
        error: "O número informado não possui um WhatsApp ativo. Informe outro",
      }
    }

    const data = await fetchApi(FetchCtx.PUBLIC, `/customers/${customerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values)
    });
    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error(`Falha ao gravar dados do cliente: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Falha ao gravar dados do cliente',
    }
  }
};