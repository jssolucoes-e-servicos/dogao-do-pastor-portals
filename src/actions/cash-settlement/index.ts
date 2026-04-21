"use server";
import { fetchApi, FetchCtx } from "@/lib/api";

export async function GetMyCashSettlementsAction() {
  try {
    const data = await fetchApi(FetchCtx.ERP, '/cash-settlements/me', { cache: "no-store" });
    return { success: true, data: Array.isArray(data) ? data : [] };
  } catch (e: any) { return { success: false, data: [], error: e.message }; }
}

export async function GetAllSettlementsAction(editionId?: string) {
  try {
    const q = editionId ? `?editionId=${editionId}` : '';
    const data = await fetchApi(FetchCtx.ERP, `/cash-settlements${q}`, { cache: "no-store" });
    return { success: true, data: Array.isArray(data) ? data : [] };
  } catch (e: any) { return { success: false, data: [], error: e.message }; }
}

export async function GetPendingPaymentsAction(editionId?: string) {
  try {
    const q = editionId ? `?editionId=${editionId}` : '';
    const data = await fetchApi(FetchCtx.ERP, `/cash-settlements/pending-payments${q}`, { cache: "no-store" });
    return { success: true, data: Array.isArray(data) ? data : [] };
  } catch (e: any) { return { success: false, data: [], error: e.message }; }
}

export async function GetSettlementSummaryAction(editionId?: string) {
  try {
    const q = editionId ? `?editionId=${editionId}` : '';
    const data = await fetchApi(FetchCtx.ERP, `/cash-settlements/summary${q}`, { cache: "no-store" });
    return { success: true, data };
  } catch (e: any) { return { success: false, data: null, error: e.message }; }
}

export async function GeneratePixQrCodeAction(settlementId: string, amount: number) {
  try {
    const data = await fetchApi(FetchCtx.ERP, `/cash-settlements/${settlementId}/pix-qrcode`, {
      method: 'POST', body: JSON.stringify({ amount }),
    });
    return { success: true, data };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function SubmitPixIvcAction(formData: FormData) {
  try {
    const settlementId = formData.get('settlementId') as string;
    const data = await fetchApi(FetchCtx.ERP, `/cash-settlements/${settlementId}/submit-pix-ivc`, {
      method: 'POST', body: formData,
    });
    return { success: true, data };
  } catch (e: unknown) { return { success: false, error: (e as Error).message }; }
}

export async function SubmitCashAction(settlementId: string, amount: number) {
  try {
    const data = await fetchApi(FetchCtx.ERP, `/cash-settlements/${settlementId}/submit-cash`, {
      method: 'POST', body: JSON.stringify({ amount }),
    });
    return { success: true, data };
  } catch (e: any) { return { success: false, error: e.message }; }
}

/** Confirma um repasse individual (paymentId) */
export async function ConfirmSettlementPaymentAction(paymentId: string) {
  try {
    const data = await fetchApi(FetchCtx.ERP, `/cash-settlements/payments/${paymentId}/confirm`, { method: 'PATCH' });
    return { success: true, data };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function RegisterDirectSettlementAction(dto: {
  contributorId: string; amount: number; paymentMethod: string; notes?: string; editionId?: string;
}) {
  try {
    const data = await fetchApi(FetchCtx.ERP, '/cash-settlements/register-direct', {
      method: 'POST', body: JSON.stringify(dto),
    });
    return { success: true, data };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function SyncCashOrdersAction(editionId?: string) {
  try {
    const q = editionId ? `?editionId=${editionId}` : '';
    const data = await fetchApi(FetchCtx.ERP, `/cash-settlements/sync${q}`, { method: 'POST' });
    return { success: true, data };
  } catch (e: unknown) { return { success: false, error: (e as Error).message }; }
}

export async function GetCellSettlementsAction(cellId: string, editionId?: string) {
  try {
    const q = editionId ? `?editionId=${editionId}` : '';
    const data = await fetchApi(FetchCtx.ERP, `/cash-settlements/cell/${cellId}${q}`, { cache: "no-store" });
    return { success: true, data: Array.isArray(data) ? data : [] };
  } catch (e: any) { return { success: false, data: [], error: e.message }; }
}
