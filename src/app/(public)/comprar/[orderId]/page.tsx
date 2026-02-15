import { SiteOrderStepEnum } from "@/common/enums";
import { OrderOnlineCustomerStep } from "@/components/orders-online/steps/customer/customer-step";
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
    page: SiteOrderStepEnum.CUSTOMER});

  return (
    <Fragment>
      <OrderOnlineCustomerStep order={order} />
    </Fragment>
  );
}
