// src/actions/customer/update-in-orders.action.ts
"use server";

import { WhatsappIsValidAction } from "@/actions/whatsapp/is-valid.action";
import { CustomerEntity } from "@/common/entities";
import { ICustomerOrderPayload, IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export const UpdateCustomerInOrderAction = async (customerOr: CustomerEntity, loadData: ICustomerOrderPayload): Promise<IResponseObject<CustomerEntity>> => {
  try {  
    const {message: checkWpp} = await WhatsappIsValidAction(loadData.phone);
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

    const data = await fetchApi(FetchCtx.PUBLIC, `/customers/${customerOr.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        name: loadData.name,
        email: loadData.email?.trim() === "" ? undefined : loadData.email,
        phone: loadData.phone,
        knowsChurch: loadData.knowsChurch!,
        allowsChurch: loadData.allowsChurch!, 
      })
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