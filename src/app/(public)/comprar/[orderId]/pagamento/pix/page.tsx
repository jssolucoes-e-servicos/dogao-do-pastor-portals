import { SiteOrderStepEnum } from "@/common/enums";
import { PaymentPix } from "@/components/orders-online/steps/payments/payment-pix";
import { StepsRouter } from "@/components/orders-online/steps/steps.router";
import { Fragment } from "react";

interface PageProps {
  params: Promise<{ orderId: string }>
}

export default async function Page({ params }: PageProps) {
  const { orderId } = await params;
  const order = await StepsRouter({
    orderId,
    page: SiteOrderStepEnum.PIX});

    return (
    <Fragment>
      <PaymentPix order={order}/>
    </Fragment>
  );
}
