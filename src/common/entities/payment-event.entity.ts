import { PaymentEntity } from ".";

export interface PaymentEventEntity {
  id: string;
  payment: PaymentEntity;
  paymentId: string;
  providerEventId?: string;
  type: string;
  rawPayload: string;
  processedAt?: Date;
  createdAt: Date;
}
