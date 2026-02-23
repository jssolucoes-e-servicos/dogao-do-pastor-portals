import { findOrdersByIdAction } from "@/actions/orders/find-by-id.action";
import { OrderEntity } from "@/common/entities";
import { OrderStatusEnum, SiteOrderStepEnum } from "@/common/enums";
import { redirect } from "next/navigation";

interface StepsRouterProps {
  orderId: string;
  page: string;
}

const STEP_ROUTES: Record<string, string> = {
  [SiteOrderStepEnum.CUSTOMER]: "", // Raiz: /comprar/[id]
  [SiteOrderStepEnum.ORDER]:    "/pedido",
  [SiteOrderStepEnum.DELIVERY]: "/tipo-pedido",
  [SiteOrderStepEnum.PAYMENT]:  "/pagamento",
  [SiteOrderStepEnum.PIX]:      "/pagamento/pix",
  [SiteOrderStepEnum.CARD]:     "/pagamento/cartao",
  [SiteOrderStepEnum.ANALYSIS]: "/analise",
  [SiteOrderStepEnum.THANKS]:   "/obrigado",
};

export async function StepsRouter({orderId, page}: StepsRouterProps): Promise<OrderEntity> {
  const {data: order} = await findOrdersByIdAction(orderId) ;

  if (!order) {  
    console.log('order: ',order); 
    redirect('/off-line');
  };

  processRedirects(order, page);
  return order
} 

function processRedirects(order: OrderEntity, currentPage: string) {
  const { id, status, siteStep } = order;

  if (status === OrderStatusEnum.PAID) {
    if (currentPage !== SiteOrderStepEnum.THANKS) redirect(`/comprar/${id}/obrigado`);
    return;
  }

  // Se o status não for Digitação ou Pagamento Pendente, manda para o acompanhamento geral
  const isOngoing = [OrderStatusEnum.DIGITATION, OrderStatusEnum.PENDING_PAYMENT].includes(status as OrderStatusEnum);
  if (!isOngoing) {
    redirect(`/acompanhar-pedido/${id}`);
    return;
  }

  // 3. Verificação se o Step atual condiz com a página
  if (siteStep !== currentPage) {
    const routeSuffix = STEP_ROUTES[siteStep];
    
    // Se o step existe no nosso mapa, redireciona
    if (routeSuffix !== undefined) {
      redirect(`/comprar/${id}${routeSuffix}`);
    }
  }
}