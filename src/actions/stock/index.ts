"use server";
import { fetchApi, FetchCtx } from "@/lib/api";

export async function GetStockProductsAction() {
  try {
    const data = await fetchApi(FetchCtx.ERP, '/stock/products', { cache: "no-store" });
    return { success: true, data };
  } catch (e: any) { return { success: false, data: [], error: e.message }; }
}

export async function CreateStockProductAction(dto: { name: string; unit: string; description?: string }) {
  try {
    const data = await fetchApi(FetchCtx.ERP, '/stock/products', { method: 'POST', body: JSON.stringify(dto) });
    return { success: true, data };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function UpdateStockProductAction(id: string, dto: { name?: string; unit?: string; description?: string }) {
  try {
    const data = await fetchApi(FetchCtx.ERP, `/stock/products/${id}`, { method: 'PUT', body: JSON.stringify(dto) });
    return { success: true, data };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function GetStockBalanceAction(editionId?: string) {
  try {
    const q = editionId ? `?editionId=${editionId}` : '';
    const data = await fetchApi(FetchCtx.ERP, `/stock/balance${q}`, { cache: "no-store" });
    return { success: true, data };
  } catch (e: any) { return { success: false, data: [], error: e.message }; }
}

export async function GetStockMovementsAction(editionId?: string) {
  try {
    const q = editionId ? `?editionId=${editionId}` : '';
    const data = await fetchApi(FetchCtx.ERP, `/stock/movements${q}`, { cache: "no-store" });
    return { success: true, data };
  } catch (e: any) { return { success: false, data: [], error: e.message }; }
}

export async function AddStockMovementAction(dto: {
  productId: string; type: string; quantity: number; notes?: string; editionId?: string;
}) {
  try {
    const data = await fetchApi(FetchCtx.ERP, '/stock/movements', { method: 'POST', body: JSON.stringify(dto) });
    return { success: true, data };
  } catch (e: any) { return { success: false, error: e.message }; }
}
