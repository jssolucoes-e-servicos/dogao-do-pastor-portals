// src/actions/partners/list-partners-admin.actions.ts
"use server";

import { PartnerEntity } from "@/common/entities";
import { fetchApi, FetchCtx } from "@/lib/api";

export const ListPartnersAllAction = async (): Promise<PartnerEntity[]> => {
  try {
    // Note que usamos uma rota diferente, focada em administração
    const data = await fetchApi(FetchCtx.CUSTOMER, `/partners/all`, {
      method: 'GET',
      next: { revalidate: 0 } // Garante dados sempre frescos no ERP
    });
    return data as PartnerEntity[];
  } catch (error: any) {
    console.error("Falha ao buscar lista administrativa de parceiros:", error);
    return [];
  }
};