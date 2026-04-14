"use server";
import { fetchApi, FetchCtx } from "@/lib/api";

export async function GetMyPermissionsAction() {
  try {
    const data = await fetchApi(FetchCtx.ERP, '/permissions/me', { cache: "no-store" });
    console.log('[GetMyPermissionsAction] modules:', Object.keys(data?.modules || {}));
    return { success: true, data };
  } catch (e: any) {
    console.error('[GetMyPermissionsAction] error:', e.message);
    return { success: false, data: null, error: e.message };
  }
}
