import { CustomerAddressEntity, OrderEntity } from "@/common/entities"

export interface IOrderInit {
  order: OrderEntity,
  customerAddresses: CustomerAddressEntity[]
}