import { LucideIcon } from "lucide-react";
import { IMenuSubItem } from "./menu-subitem.interface";

export type IMenuItem =
  | {
      title: string;
      icon: LucideIcon;
      url: string;
      /**
       * Slug(s) de permissão para o item.
       * String única ou array — aparece se o usuário tiver QUALQUER um dos slugs.
       */
      slug?: string | string[];
      items?: never;
    }
  | {
      title: string;
      icon: LucideIcon;
      url?: never;
      /**
       * Slug(s) de permissão para o grupo.
       * Array útil quando o grupo agrupa módulos com slugs diferentes.
       * Aparece se o usuário tiver QUALQUER um dos slugs.
       */
      slug?: string | string[];
      items: IMenuSubItem[];
    };
