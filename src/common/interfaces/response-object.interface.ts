export interface IResponseObject<T> {
  success: boolean;
  data?: T;
  error?: string;
};