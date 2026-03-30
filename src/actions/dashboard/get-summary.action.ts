"use server"

import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";
import { DashboardStatsEntity } from "@/common/entities"; 

export async function DashboardSummaryAction(editionId?: string): Promise<IResponseObject<DashboardStatsEntity>> {
  try {
    const params = editionId ? `?editionId=${editionId}` : '';
    const data = await fetchApi(FetchCtx.ERP, `/dashboard/summary${params}`, {
      cache: "no-store"
    })
    return { success: true, data };
  } catch (error) {
    console.error(`Falha ao recuperar dados do dashboard: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Falha ao carregar métricas",
    };
  }
}