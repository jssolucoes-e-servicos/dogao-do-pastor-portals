// src/actions/dashboard/stats.action.ts
"use server"
import { IResponseObject } from "@/common/interfaces";

// src/actions/dashboard/stats.actions.ts
interface resultProps {
  vouchers: { code: string, used: boolean }[],
      customers: number | string,
      sales: number | string,
      usedVouchers: number | string,
      availableDogs: number | string,
}

export async function getDashboardStats(): Promise<IResponseObject<resultProps>> {
  
  try {
   
    return {
      success: true,
      data: {
        vouchers: [],
        customers: 0,
        sales: 0,
        usedVouchers: 0,
        availableDogs: 0,
      }
    };
  } catch (error) {
    console.error("Falha ao buscar métricas:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Falha ao buscar métricas'
    };
  }
}