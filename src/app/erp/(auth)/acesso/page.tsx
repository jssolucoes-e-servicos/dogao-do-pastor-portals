// src/app/erp/(auth)/acesso/page.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Lock, Mail } from "lucide-react"
import { useRouter } from "next/navigation"
import { Fragment, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
export const dynamic = 'force-dynamic'
// Importação fictícia da action de login do ERP - ajuste conforme seu arquivo real
import { AuthContributorLoginAction } from "@/actions/auth/contributor-login.action"

const erpLoginSchema = z.object({
  username: z.string("Usuário inválido").min(4, "Usuário inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
})

export default function ErpLoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof erpLoginSchema>>({
    resolver: zodResolver(erpLoginSchema),
    defaultValues: { username: "", password: "" },
  })

  async function onSubmit(values: z.infer<typeof erpLoginSchema>) {
    setIsLoading(true)
    const loginAction = async () => {
      const result = await AuthContributorLoginAction({
        username: values.username,
        password: values.password,
      });
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    }

    toast.promise(loginAction(), {
      loading: "Autenticando no ERP...",
      success: () => {
        router.push("/erp")
        return "Acesso autorizado. Bem-vindo!"
      },
      error: (err) => {
        setIsLoading(false)
        return err.message || "Falha na autenticação."
      },
    })
  }

  return (
  <Fragment>
    <div className="flex flex-col space-y-2 text-left">
      <h2 className="text-3xl font-bold tracking-tight">Acesso</h2>
      <p className="text-sm text-muted-foreground">
        Insira seus dados para acessar o painel administrativo.
      </p>
    </div>

    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Usuário</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input 
                    className="pl-10 h-12 bg-muted/50 focus-visible:ring-orange-600" 
                    placeholder="meu.email@smartfoods.com" 
                    type="text"
                    {...field} 
                    disabled={isLoading}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Senha</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10 h-12 bg-muted/50 focus-visible:ring-orange-600" 
                    {...field} 
                    disabled={isLoading}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full bg-orange-600 hover:bg-orange-700 h-12 text-base font-bold uppercase transition-all" 
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Entrar no Sistema"}
        </Button>
      </form>
    </Form>
  </Fragment>
  )
}