import { PaymentStatusEnum, DeliveryOptionEnum, OrderOriginEnum, OrderStatusEnum, SiteOrderStepEnum } from "@/common/enums";
import { CommandEntity, CustomerAddressEntity, CustomerEntity, DeliveryStopEntity, EditionEntity, OrderItemEntity, PaymentEntity, SellerEntity, TicketEntity, VoucherEntity } from "./";

export interface OrderEntity {
  id: string;
  edition: EditionEntity;
  editionId: string;
  customer: CustomerEntity;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerCPF: string;
  seller: SellerEntity;
  sellerId: string;
  sellerTag: string;
  origin: OrderOriginEnum;
  totalValue: number;
  status: OrderStatusEnum;
  siteStep: SiteOrderStepEnum;
  deliveryOption: DeliveryOptionEnum;
  deliveryTime?: string;
  address?: CustomerAddressEntity;
  addressId?: string;
  observations?: string;
  confirmationSend: boolean;
  paymentStatus: PaymentStatusEnum;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  items?: OrderItemEntity[];
  vouchers?: VoucherEntity[];
  tickets?: TicketEntity[];
  payments?: PaymentEntity[];
  commands?: CommandEntity[];
  deliveryStops?: DeliveryStopEntity[];
}
