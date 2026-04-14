"use server";
import { fetchApi, FetchCtx } from "@/lib/api";

export async function ModuleUpdateAction(id: string, data: Partial<{ name: string; description: string; ctrl: string; page: string }>) {
  try {
    const res = await fetchApi(FetchCtx.ERP, `/modules/${id}`, { method: "PUT", body: JSON.stringify(data), cache: "no-store" });
    return { success: true, data: res };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
