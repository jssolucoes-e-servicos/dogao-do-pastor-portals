// src/actions/partners/send-invite.action.ts
"use server";

import { PartnerEntity } from "@/common/entities";
import { IResponse } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export const SendInviteAction = async (partner: PartnerEntity, destination: string): Promise<IResponse> => {
  try {
    // Chama o backend para criar um registro "seed-like" de um único parceiro
    const data = await fetchApi(FetchCtx.CUSTOMER, `/partners/invite/send-whatsapp`, {
      method: 'POST',
      body: JSON.stringify({
        destination: destination,
        inviteId: partner.id
      })
    });
    return {
      success: true,
      message: data
    };
  } catch (error) {
    console.error(`Falha ao enviar convite ao parceiro: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Falha ao enviar convite ao parceiro."
    } 
  }
};