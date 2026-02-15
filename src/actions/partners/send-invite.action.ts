// src/actions/partners/generate-invite.action.ts
"use server";

import { PartnerEntity } from "@/common/entities";
import { fetchApi, FetchCtx } from "@/lib/api";

export const SendInviteAction = async (partner: PartnerEntity, destination: string): Promise<boolean> => {
  try {
    // Chama o backend para criar um registro "seed-like" de um único parceiro
    const data = await fetchApi(FetchCtx.CUSTOMER, `/partners/invite/send-whatsapp`, {
      method: 'POST',
      body: JSON.stringify({
        destination: destination,
        inviteId: partner.id
      })
    });
    return data;
  } catch (error: any) {
    throw new Error("Falha ao enviar convite ao parceiro.");
  }
};