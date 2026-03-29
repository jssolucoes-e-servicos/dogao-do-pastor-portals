"use server"

import { IPaginatedData, IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export type EditionEntity = {
  id: string;
  name: string;
  code: string;
  productionDate: string;
  saleStartDate: string;
  saleEndDate: string;
  autoEnableDate?: string | null;
  autoDisableDate?: string | null;
  limitSale: number;
  dogsSold: number;
  dogPrice: number;
  active: boolean;
  createdAt: string;
}

export async function PaginateEditionsAction(page = 1, search = ""): Promise<IResponseObject<IPaginatedData<EditionEntity>>> {
  try {
    const params = new URLSearchParams({ page: page.toString(), perPage: "10" });
    if (search) params.append("search", search);
    const data = await fetchApi(FetchCtx.ERP, `/editions?${params.toString()}`, { cache: "no-store" });
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Falha ao listar edições" };
  }
}
