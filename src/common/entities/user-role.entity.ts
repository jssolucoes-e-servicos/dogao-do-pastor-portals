// src/common/entities/user-role.entity.ts

import { ContributorEntity, RoleEntity } from '.';

export interface UserRoleEntity {
  id: string;
  contributor: ContributorEntity;
  contributorId: string;
  role: RoleEntity;
  roleId: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
