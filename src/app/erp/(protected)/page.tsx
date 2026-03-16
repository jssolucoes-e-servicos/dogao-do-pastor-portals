import { ErpDashboardContent } from "@/components/erp/dashboard/erp-dashboard-content";
import { cookies } from "next/headers";

export default async function ErpDashboardPage() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('ddp-ctb-01');
  
  let user = null;
  if (userCookie?.value) {
    try {
      // Tenta decodificar se estiver codificado (comum em cookies JSON)
      const decodedValue = decodeURIComponent(userCookie.value);
      user = JSON.parse(decodedValue);
    } catch (e) {
      try {
        // Fallback para JSON direto se a decodificação falhar
        user = JSON.parse(userCookie.value);
      } catch (err) {
        console.error('Falha ao analisar o cookie do usuário no Dashboard:', err);
      }
    }
  }

  return <ErpDashboardContent user={user} />;
}