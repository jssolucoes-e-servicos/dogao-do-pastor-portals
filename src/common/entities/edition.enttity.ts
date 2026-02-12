import { CommandEntity, OrderEntity, SellerSettlementEntity, TicketEntity, VoucherEntity } from "./";

export interface EditionEntity {
  id: string;
  name: string;
  productionDate: Date;
  code: string;
  saleStartDate: Date;
  saleEndDate: Date;
  autoEnableDate: Date;
  autoDisableDate: Date;
  limitSale: number;
  dogsSold: number;
  dogPrice: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  issuedVouchers?: VoucherEntity[];
  redeemedVouchers?: VoucherEntity[];
  tickets?: TicketEntity[];
  orders?: OrderEntity[];
  settlements?: SellerSettlementEntity[];
  commands?: CommandEntity[];
}
