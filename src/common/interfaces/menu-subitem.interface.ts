export interface IMenuSubItem {
  title: string;
  url: string;
  /** Slug(s) de permissão para controlar visibilidade do sub-item individualmente */
  slug?: string | string[];
};