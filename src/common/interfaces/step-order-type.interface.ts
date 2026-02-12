//interfaces/step-address-order-type.interface.ts

import { DeliveryOptionEnum } from "@/common/enums";
import { ICotentStepOrderType } from "@/common/interfaces/content-step-order-type.interface";

export interface IStepOrderType extends ICotentStepOrderType {
  type: DeliveryOptionEnum;
}