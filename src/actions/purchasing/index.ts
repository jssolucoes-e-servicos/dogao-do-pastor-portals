"use server";
import { fetchApi, FetchCtx } from "@/lib/api";

export async function GetPurchaseOrdersAction(editionId?: string) {
  try {
    const q = editionId ? `?editionId=${editionId}` : '';
    const data = await fetchApi(FetchCtx.ERP, `/purchasing${q}`, { cache: "no-store" });
    return { success: true, data };
  } catch (e: any) { return { success: false, data: [], error: e.message }; }
}

export async function CreatePurchaseOrderAction(dto: {
  supplierName?: string; notes?: string; orderedAt?: string; editionId?: string;
  items: { productId: string; quantity: number; unitPrice: number }[];
}) {
  try {
    const data = await fetchApi(FetchCtx.ERP, '/purchasing', { method: 'POST', body: JSON.stringify(dto) });
    return { success: true, data };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function MarkPurchaseDeliveredAction(id: string) {
  try {
    const data = await fetchApi(FetchCtx.ERP, `/purchasing/${id}/delivered`, { method: 'PATCH' });
    return { success: true, data };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function GetConsumptionReportAction(editionId?: string) {
  try {
    const q = editionId ? `?editionId=${editionId}` : '';
    const data = await fetchApi(FetchCtx.ERP, `/purchasing/report${q}`, { cache: "no-store" });
    return { success: true, data };
  } catch (e: any) { return { success: false, data: [], error: e.message }; }
}
