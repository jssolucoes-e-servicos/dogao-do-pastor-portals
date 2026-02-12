// src/common/entities/module.entity.ts

import { PermissionEntity } from ".";

export interface ModuleEntity {
  id: string;
  name: string;
  description: string;
  ctrl: string;
  page: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;

  permissions: PermissionEntity[];
}
