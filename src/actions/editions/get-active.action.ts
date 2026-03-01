// src/actions/editions/get-active.action.ts
"use server";

import { IEditionResponse } from "@/common/interfaces/edition-response.interface";
import { fetchApi, FetchCtx } from "@/lib/api";
import { redirect } from "next/navigation";

export const getActiveEdition = async (): Promise<IEditionResponse> => {
  try {
    const data = await fetchApi(FetchCtx.PUBLIC, `/editions/get-active`, {
      next: { 
        revalidate: 1800, // Tempo em segundos (30 minutos)
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