"use server";
import { fetchApi, FetchCtx } from "@/lib/api";

export async function ContributorsListAllAction() {
  try {
    const data = await fetchApi(FetchCtx.ERP, '/contributors/list-all');
    return { success: true, data };
  } catch (e: any) {
    // Fallback caso o endpoint list-all não exista, tenta usar o paginate
    try {
        const data = await fetchApi(FetchCtx.ERP, '/contributors?perPage=1000');
        return { success: true, data: data.data || [] };
    } catch(err: any) {
        return { success: false, error: e.message };
    }
  }
}
