"use server";
import { fetchApi, FetchCtx } from "@/lib/api";

export async function GetAllSettlementsAction(status?: string, editionId?: string) {
  try {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (editionId) params.set('editionId', editionId);
    const data = await fetchApi(FetchCtx.ERP, `/cash-settlements?${params}`, { cache: "no-store" });
    return { success: true, data: Array.isArray(data) ? data : [] };
  } catch (e: any) {
    return { success: false, data: [], error: e.message };
  }
}

export async function GetMyCashSettlementsAction() {
  try {
    const data = await fetchApi(FetchCtx.ERP, '/cash-settlements/me', { cache: "no-store" });
    return { success: true, data: Array.isArray(data) ? data : [] };
  } catch (e: any) {
    return { success: false, data: [], error: e.message };
  }
}

export async function ConfirmSettlementAction(id: string) {
  try {
    const data = await fetchApi(FetchCtx.ERP, `/cash-settlements/${id}/confirm`, { method: 'PATCH' });
    return { success: true, data };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function GetCellSettlementsAction(cellId: string, editionId?: string) {
  try {
    const q = editionId ? `?editionId=${editionId}` : '';
    const data = await fetchApi(FetchCtx.ERP, `/cash-settlements/cell/${cellId}${q}`, { cache: "no-store" });
    return { success: true, data: Array.isArray(data) ? data : [] };
  } catch (e: any) {
    return { success: false, data: [], error: e.message };
  }
}
