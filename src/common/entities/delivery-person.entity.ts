import { ContributorEntity, DeliveryRouteEntity } from "./";

export interface DeliveryPersonEntity {
  id: string;
  contributor: ContributorEntity;
  contributorId: string;
  online: boolean;
  inRoute: boolean;
  pushSubscription?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;

  routes?: DeliveryRouteEntity[];
}
