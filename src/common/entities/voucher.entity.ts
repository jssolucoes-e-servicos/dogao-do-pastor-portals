import { VoucherStatusEnum } from "@/common/enums";
import { CustomerEntity, EditionEntity, OrderEntity, OrderItemEntity } from ".";

export interface VoucherEntity {
  id: string;
  code: string;
  issuedEdition: EditionEntity;
  issuedEditionId: string;
  customer?: CustomerEntity;
  customerId?: string;
  redeemedEdition?: EditionEntity;
  redeemedEditionId?: string;
  order?: OrderEntity;
  orderId?: string;
  orderItem?: OrderItemEntity;
  orderItemId?: string;
  used: boolean;
  usedAt?: Date;
  status: VoucherStatusEnum;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
