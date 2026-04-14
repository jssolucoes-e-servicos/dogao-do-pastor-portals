"use server";
import { fetchApi, FetchCtx } from "@/lib/api";

export async function RoleByIdAction(id: string) {
  try {
    const data = await fetchApi(FetchCtx.ERP, `/roles/${id}`, { cache: "no-store" });
    return { success: true, data };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
