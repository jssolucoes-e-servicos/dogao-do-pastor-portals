"use server";
import { fetchApi, FetchCtx } from "@/lib/api";

export async function CreateSellerAction(data: {
  name: string;
  cellId: string;
  contributorId: string;
  tag: string;
}) {
  try {
    const seller = await fetchApi(FetchCtx.ERP, '/sellers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { success: true, data: seller };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
