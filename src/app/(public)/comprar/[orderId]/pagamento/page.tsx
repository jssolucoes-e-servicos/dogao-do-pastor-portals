import { SiteOrderStepEnum } from "@/common/enums";
import { SelectPaymentMethod } from "@/components/orders-online/steps/payments/select-payment-method";
import { StepsRouter } from "@/components/orders-online/steps/steps.router";
import { Fragment } from "react";

interface PageProps {
  params: Promise<{ orderId: string }>
}

export default async function Page({ params }: PageProps) {
  const { orderId } = await params;
  const order = await StepsRouter({
    orderId,
    page: SiteOrderStepEnum.PAYMENT});
    
  return (
    <Fragment>
      <SelectPaymentMethod order={order} />
    </Fragment>
  );
}
