import { SiteOrderStepEnum } from "@/common/enums";
import { OrderInAnalisys } from "@/components/orders-online/steps/analisys/order-in-analisys";
import { StepsRouter } from "@/components/orders-online/steps/steps.router";
import { Fragment } from "react";

interface PageProps {
  params: Promise<{ orderId: string }>
}

export default async function Page({ params }: PageProps) {
  const { orderId } = await params;
  const order = await StepsRouter({
    orderId,
    page: SiteOrderStepEnum.ANALYSIS});
    
  return (
    <Fragment>
      <OrderInAnalisys order={order} />
    </Fragment>
  );
}
