import * as z from "zod"

export const partnerLoginSchema = z.object({
  username: z.string().min(18, "CNPJ completo é obrigatório"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
})