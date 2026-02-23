import { DeliveryOptionEnum } from "@/common/enums";
import { Dispatch, SetStateAction } from "react";

export interface ICotentStepOrderType {
  deliveryOption: DeliveryOptionEnum;
  setDeliveryOption: Dispatch<SetStateAction<DeliveryOptionEnum>>;
  orderId? : string;
}