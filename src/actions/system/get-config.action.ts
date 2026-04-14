"use server";
import { fetchApi, FetchCtx } from "@/lib/api";

export async function GetSystemConfigAction(key: string) {
  try {
    const data = await fetchApi(FetchCtx.ERP, `/permissions/system-config/${key}`, { cache: "no-store" });
    return { success: true, data };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function SetSystemConfigAction(key: string, value: string) {
  try {
    const data = await fetchApi(FetchCtx.ERP, `/permissions/system-config/${key}`, {
      method: "PUT",
      body: JSON.stringify({ value }),
      cache: "no-store",
    });
    return { success: true, data };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
