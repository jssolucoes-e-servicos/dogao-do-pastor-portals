// src/actions/whatsapp/is-valid.action.ts
"use server";

import { NumbersHelper } from "@/common/helpers/numbers-helper";
import { IResponse } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export const WhatsappIsValidAction = async (phone: string): Promise<IResponse> => {
  try {
    const cleanPhone = NumbersHelper.clean(phone);
    const response = await fetchApi(FetchCtx.CUSTOMER, "/whatsapp/check-number", {
      method: "POST",
      body: JSON.stringify({ phone: cleanPhone }),
    });
    if (Array.isArray(response) && response.length > 0) {
      return {
        success: true,
        message: response[0].exists,
      }
    }
    return {
      success: true,
      message: 'false'
    };
  } catch (error) {
    console.error(`Erro ao verificar se é um whatsapp ativo: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao verificar se é um whatsapp ativo',
    }
  }
};