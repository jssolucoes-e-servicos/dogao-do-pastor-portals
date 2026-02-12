//import { getMongoInstance } from "@/lib/mongo";

interface resultProps {
  vouchers: { code: string, used: boolean }[],
      customers: number | string,
      sales: number | string,
      usedVouchers: number | string,
      availableDogs: number | string,
}

export async function getDashboardStats(): Promise<resultProps> {
  
  try {
   
    return {
      vouchers: [],//vouchers.map((v) => ({ code: v.code, used: v.used })),
      customers: 0,//customers.length,
      sales: 0,//dogs.length,
      usedVouchers: 0,//vouchers.filter((v) => v.used).length,
      availableDogs: 0,//sactiveEdition ? activeEdition.limiteEdicao - dogs.length : 0,
    };
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    return {
      vouchers: [],//vouchers.map((v) => ({ code: v.code, used: v.used })),
      customers: 0,//customers.length,
      sales: 0,//dogs.length,
      usedVouchers: 0,//vouchers.filter((v) => v.used).length,
      availableDogs: 0,//sactiveEdition ? activeEdition.limiteEdicao - dogs.length : 0,
    };
  }
}