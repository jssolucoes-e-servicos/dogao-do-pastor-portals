//components/order-online/steps/order-type/order-type-select-content.tsx

'use client';
import { DeliveryOptionEnum } from "@/common/enums";
import { ICotentStepOrderType } from "@/common/interfaces";
import { Fragment } from "react";
import { StepOrderTypeSelect } from "./step-order-type-select";

export function OrderTypeSelectContent({ deliveryOption, setDeliveryOption }: ICotentStepOrderType) {
  return (
    <Fragment>
      <div className="flex flex-col items-center">
        <h2 className="text-2xl font-bold text-center mb-2">Detalhes de Entrega</h2>
        <p className="text-gray-600 text-center">Selecione uma opção para o seu pedido.</p>
      </div>
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