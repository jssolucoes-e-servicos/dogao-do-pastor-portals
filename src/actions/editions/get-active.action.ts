// src/actions/editions/get-active.action.ts
"use server";

import { IEditionResponse } from "@/common/interfaces/edition-response.interface";
import { fetchApi, FetchCtx } from "@/lib/api";
import { redirect } from "next/navigation";

/**
 * Busca a edição ativa com cache inteligente.
 * @next.revalidate: 3600 (1 hora) - O Next vai servir a mesma resposta 
 * por 1 hora antes de bater no backend de novo.
 */
export const getActiveEdition = async (): Promise<IEditionResponse> => {
  try {
    const data = await fetchApi(FetchCtx.PARTNER, `/editions/get-active`, {
      next: { 
        revalidate: 3600, // Tempo em segundos (1 hora)
        tags: ['active-edition'] // Tag para limpeza manual se necessário
      }
    });

    return data as IEditionResponse;
  } catch (error: any) {
    if (error.message === 'NEXT_REDIRECT') throw error;
    
    console.error("Erro ao buscar edição ativa:", error);
    redirect('/off-line');
  }
};