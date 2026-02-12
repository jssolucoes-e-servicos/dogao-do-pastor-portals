import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().min(3, "Nome muito curto"),
  cnpj: z.string().min(14, "CNPJ inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  email: z.string().email("E-mail inválido"),
  address: z.object({
    street: z.string().min(1, "Rua é obrigatória"),
    number: z.string().min(1, "Número é obrigatório"),
    neighborhood: z.string().min(1, "Bairro é obrigatório"),
    city: z.string().min(1, "Cidade é obrigatória"),
    state: z.string().length(2, "UF deve ter 2 letras"),
    zipCode: z.string().min(8, "CEP inválido"),
  }),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;