import * as z from "zod";

export const partnerUpdateSchema = z.object({
  name: z
    .string()
    .min(2, "O nome da instituição deve ter pelo menos 2 caracteres"),
  
  cnpj: z
    .string()
    .min(14, "CNPJ inválido"),
  
  phone: z
    .string()
    .optional()
    .or(z.literal("")),
  
  description: z
    .string()
    .optional()
    .or(z.literal("")),
  
  zipCode: z
    .string()
    .min(8, "CEP inválido"),
  
  street: z
    .string()
    .min(1, "O logradouro é obrigatório"),
  
  number: z
    .string()
    .min(1, "O número é obrigatório"),
  
  neighborhood: z
    .string()
    .min(1, "O bairro é obrigatório"),
  
  city: z
    .string()
    .min(1, "A cidade é obrigatória"),
  
  state: z
    .string()
    .min(2, "O estado (UF) é obrigatório"),
  
  complement: z
    .string()
    .optional()
    .or(z.literal("")),
  
  responsibleName: z
    .string()
    .min(2, "O nome do responsável é obrigatório"),
  
  responsiblePhone: z
    .string()
    .min(10, "O WhatsApp do responsável é inválido"),
  
  /**
   * Senha:
   * No nível do Schema, ela é opcional para permitir que o formulário de edição
   * (onde o campo não existe ou é enviado vazio) passe na validação do Zod.
   * A obrigatoriedade para NOVOS cadastros é validada no onSubmit do formulário.
   */
  password: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 6, {
      message: "A senha deve ter pelo menos 6 caracteres",
    }),

  addresInLine: z
    .string()
    .optional(),

  username: z
    .string()
    .optional(),

  logo: z
    .string()
    .optional()
    .or(z.literal("")),
});

// Exportamos também o tipo para uso no frontend
export type PartnerUpdateValues = z.infer<typeof partnerUpdateSchema>;