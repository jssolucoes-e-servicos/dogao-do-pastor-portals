import { PaymentMethodEnum, PaymentOriginEnum, PaymentProviderEnum, PaymentStatusEnum } from "@/common/enums";
import { OrderEntity, PaymentEventEntity } from ".";

export interface PaymentEntity {
  id: string;
  order: OrderEntity;
  orderId: string;
  origin: PaymentOriginEnum;
  value: number;
  status: PaymentStatusEnum;
  provider: PaymentProviderEnum;
  providerPaymentId?: string;
  method: PaymentMethodEnum;
  pixQrcode?: string;
  pixCopyPaste?: string;
  paymentUrl?: string;
  cardToken?: string;
  rawPayload?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  events: PaymentEventEntity[];

}
