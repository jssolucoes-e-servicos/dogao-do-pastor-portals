import { SiteOrderStepEnum } from "@/common/enums";
import { PaymentCard } from "@/components/orders-online/steps/payments/payment-card";
import { StepsRouter } from "@/components/orders-online/steps/steps.router";
import { Fragment } from "react";
export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ orderId: string }>
}

export default async function Page({ params }: PageProps) {
  const { orderId } = await params;
  const order = await StepsRouter({
    orderId,
    page: SiteOrderStepEnum.CARD});
    
  return (
    <Fragment>
      <PaymentCard order={order} />
    </Fragment>
  );
}
