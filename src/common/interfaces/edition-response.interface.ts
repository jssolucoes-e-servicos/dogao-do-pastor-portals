import { EditionEntity } from '@/common/entities';

export interface IEditionResponse {
  edition: EditionEntity | null;
  message: string;
};
