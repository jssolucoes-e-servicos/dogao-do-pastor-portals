"use server"

import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export async function RedeemVoucherAction(code: string, removedIngredients: string[]): Promise<IResponseObject<any>> {
  try {
    const data = await fetchApi(FetchCtx.ERP, `/vouchers/redeem`, {
      method: "POST",
      body: JSON.stringify({ code, removedIngredients }),
    });

    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error(`Falha ao resgatar voucher: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Falha ao resgatar voucher",
    };
  }
}
