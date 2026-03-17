"use server"

import { OrderEntity } from "@/common/entities";
import { IPaginatedData, IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export async function OrdersPaginateAction(
  page = 1, 
  search = "",
  status?: string,
  paymentStatus?: string,
  deliveryOption?: string,
  hasCommand?: 'true' | 'false',
  commandStatus?: string
): Promise<IResponseObject<IPaginatedData<OrderEntity>>> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      perPage: "20"
    });

    if (search) params.append("search", search);
    if (status) params.append("status", status);
    if (paymentStatus) params.append("paymentStatus", paymentStatus);
    if (deliveryOption) params.append("deliveryOption", deliveryOption);
    if (hasCommand) params.append("hasCommand", hasCommand);
    if (commandStatus) params.append("commandStatus", commandStatus);
    
    const data = await fetchApi(FetchCtx.ERP, `/orders?${params.toString()}`, {
      cache: "no-store"
    });

    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error(`Falha ao recuperar pedidos: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Falha ao recuperar pedidos",
    };
  }
}
