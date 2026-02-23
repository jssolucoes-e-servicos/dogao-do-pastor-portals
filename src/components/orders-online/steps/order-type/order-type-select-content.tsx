//components/order-online/steps/order-type/order-type-select-content.tsx

'use client';
import { DeliveryOptionEnum } from "@/common/enums";
import { ICotentStepOrderType } from "@/common/interfaces";
import { Fragment } from "react";
import { OrderStepHeader } from "../../order-step-header";
import { StepOrderTypeSelect } from "./step-order-type-select";

export function OrderTypeSelectContent({ deliveryOption, setDeliveryOption, orderId }: ICotentStepOrderType) {
  return (
    <Fragment>
      <OrderStepHeader 
        title="Detalhes do Pedido"
        subtitle="Selecione uma opção para o seu pedido."
        orderId={orderId}
      />
      <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
        <StepOrderTypeSelect
          type={DeliveryOptionEnum.PICKUP}
          setDeliveryOption={setDeliveryOption}
          deliveryOption={deliveryOption}
        />
        <StepOrderTypeSelect
          type={DeliveryOptionEnum.DELIVERY}
          setDeliveryOption={setDeliveryOption}
          deliveryOption={deliveryOption}
        />
        <StepOrderTypeSelect
          type={DeliveryOptionEnum.DONATE}
          setDeliveryOption={setDeliveryOption}
          deliveryOption={deliveryOption}
        />
      </div>
    </Fragment>
  )
}