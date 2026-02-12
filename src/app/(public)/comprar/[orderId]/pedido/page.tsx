import { SiteOrderStepEnum } from "@/common/enums";
import { ItemsForm } from "@/components/orders-online/steps/items/items-form";
import { StepsRouter } from "@/components/orders-online/steps/steps.router";
import { Fragment } from "react";

interface PageProps {
  params: Promise<{ orderId: string }>
}

export default async function Page({ params }: PageProps) {
  const { orderId } = await params;
  const order = await StepsRouter({
    orderId,
    page: SiteOrderStepEnum.ORDER});
    
  return (
    <Fragment>
      <ItemsForm order={order} />
    </Fragment>
  );
}
