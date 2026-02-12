export interface ICustomerOrderPayload {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  knowsChurch?: boolean;
  allowsChurch?: boolean;
}