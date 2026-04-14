"use server";
import { fetchApi, FetchCtx } from "@/lib/api";

export async function RolesListAllAction() {
  try {
    const data = await fetchApi(FetchCtx.ERP, `/roles?perPage=100`, { cache: "no-store" });
    return { success: true, data: data?.data || [] };
  } catch (e: any) {
    return { success: false, data: [], error: e.message };
  }
}
