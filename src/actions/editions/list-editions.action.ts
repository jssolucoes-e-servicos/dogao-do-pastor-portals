"use server"

import { fetchApi, FetchCtx } from "@/lib/api";

export type EditionItem = { id: string; name: string; active: boolean; productionDate: string }

export async function ListEditionsAction(): Promise<EditionItem[]> {
  try {
    const res = await fetchApi(FetchCtx.ERP, `/editions?perPage=50&page=1`, { cache: "no-store" });
    return res?.data ?? [];
  } catch {
    return [];
  }
}
