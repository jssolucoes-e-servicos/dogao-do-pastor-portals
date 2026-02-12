"use server";

import { NumbersHelper } from "@/common/helpers/numbers-helper";
import { fetchApi, FetchCtx } from "@/lib/api";

export const WhatsappIsValidAction = async (phone: string): Promise<boolean> => {
  try {
    const cleanPhone = NumbersHelper.clean(phone);
    const response = await fetchApi(FetchCtx.CUSTOMER, "/whatsapp/check-number", {
      method: "POST",
      body: JSON.stringify({ phone: cleanPhone }),
    });

    if (Array.isArray(response) && response.length > 0) {
      return response[0].exists;
    }
    return false;
  } catch (error: any) {
    if (error.message === 'NEXT_REDIRECT') throw error;
    console.error("Erro ao verificar se é um whatsapp ativo:", error);
    throw new Error('Erro ao verificar se é um whatsapp ativo')
  }
};