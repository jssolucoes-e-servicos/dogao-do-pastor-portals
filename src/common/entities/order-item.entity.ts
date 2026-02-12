import { OrderEntity, VoucherEntity } from ".";

export interface OrderItemEntity {
  id: string;
  order: OrderEntity;
  orderId: string;
  unitPrice: number;
  removedIngredients: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  vouchers: VoucherEntity[];
}
