// src/common/entities/partner.entity.ts

export interface PartnerEntity {
  id: string;
  name: string;
  cnpj?: string;
  phone?: string;
  description?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  addressInLine: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  complement?: string;
  responsibleName: string;
  responsiblePhone: string;
  logo?: string;
  approved: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}
