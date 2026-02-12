import { CustomerEntity, OrderEntity } from ".";

export interface CustomerAddressEntity {
  id: string;
  customer?: CustomerEntity;
  customerId: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  complement?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;

  orders?: OrderEntity[];
}
