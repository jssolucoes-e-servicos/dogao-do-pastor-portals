"use server";
import { fetchApi, FetchCtx } from "@/lib/api";

export async function ModulesPaginateAction(page = 1, search = "") {
  try {
    const params = new URLSearchParams({ page: String(page), perPage: "50", ...(search ? { search } : {}) });
    const data = await fetchApi(FetchCtx.ERP, `/modules?${params}`, { cache: "no-store" });
    return { success: true, data };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
