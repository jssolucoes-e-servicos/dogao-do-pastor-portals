import { SiteOrderStepEnum } from "@/common/enums";
import { StepsRouter } from "@/components/orders-online/steps/steps.router";
import { OrderThanks } from "@/components/orders-online/steps/thanks/order-thanks";
import { Fragment } from "react";

interface PageProps {
  params: Promise<{ orderId: string }>
}

export default async function Page({ params }: PageProps) {
  const { orderId } = await params;
  const order = await StepsRouter({
    orderId,
    page: SiteOrderStepEnum.THANKS});
    

  return (
    <Fragment>
      <OrderThanks order={order} />
    </Fragment>
  );
}
