"use server";

import { CustomerEntity } from "@/common/entities";
import { ICustomerOrderPayload } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";
import { WhatsappIsValidAction } from "../whatsapp/is-valid.action";

export const UpdateCustomerInOrderAction = async (customerOr: CustomerEntity, loadData: ICustomerOrderPayload): Promise<CustomerEntity | { error: string}> => {
    const checkWpp = await WhatsappIsValidAction(loadData.phone);

    if (checkWpp === null) { 
      throw new Error("Ocorreu uma falha ao verificar se seu número é um whatsapp válido.");
    }

     if (checkWpp === false) {
      throw new Error("O número informado não possui um WhatsApp ativo. Informe outro");
    }

    const data = await fetchApi(FetchCtx.CUSTOMER, `/customers/${customerOr.id}`, {
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
    console.log('customer: ', data);
    return data as CustomerEntity;
};