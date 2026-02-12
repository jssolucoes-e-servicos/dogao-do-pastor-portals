import { findAddressAction } from "@/actions/customers-addresses/find-by-customer";
import { CustomerAddressEntity } from "@/common/entities";
import { SiteOrderStepEnum } from "@/common/enums";
import { OrderTypeContents } from "@/components/orders-online/steps/order-type/order-type-contents";
import { StepsRouter } from "@/components/orders-online/steps/steps.router";
import { Fragment } from "react";

interface PageProps {
  params: Promise<{ orderId: string }>
}

export default async function Page({ params }: PageProps) {
  const { orderId } = await params;
  const order = await StepsRouter({
    orderId,
    page: SiteOrderStepEnum.DELIVERY}); 

  let addresses: CustomerAddressEntity[] = [];
  const addressesFind = await findAddressAction(order.customerId);
  if (addressesFind) { addresses = addressesFind}

  return (
    <Fragment>
      <OrderTypeContents order={order} addresses={addresses} />
    </Fragment>
  );
}
