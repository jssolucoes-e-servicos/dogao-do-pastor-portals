// src/actions/dashboard/get-summary.action.ts
"use server"

import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";
// Crie essa interface baseada no que o back vai cuspir
import { DashboardStatsEntity } from "@/common/entities"; 

export async function DashboardSummaryAction(): Promise<IResponseObject<DashboardStatsEntity>> {
  try {
    const data = await fetchApi(FetchCtx.ERP, `/dashboard/summary`, {
      cache: "no-store"
    })
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error(`Falha ao recuperar dados do dashboard: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Falha ao carregar métricas",
    };
  }
}