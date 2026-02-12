// src/interfaces/user-partner.interface.ts

import { UserTypesEnum } from "@/common/enums";
import { IPartner } from "./partner.interface";

export interface IUserPartner extends IPartner{
  type: UserTypesEnum
}