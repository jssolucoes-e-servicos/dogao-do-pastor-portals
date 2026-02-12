"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Cookies from "js-cookie"
import { Loader2, Lock, User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { NumbersHelper } from "@/common/helpers/numbers-helper"

// Schema específico para Cliente (CPF)
const clientLoginSchema = z.object({
  username: z.string().min(14, "CPF inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
})

export default function ClientLoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof clientLoginSchema>>({
    resolver: zodResolver(clientLoginSchema),
    defaultValues: { username: "", password: "" },
  })

  async function onSubmit(values: z.infer<typeof clientLoginSchema>) {
    setIsLoading(true)

    const loginAction = async () => {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL
      const response = await fetch(`${baseUrl}/auth/customers/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: NumbersHelper.clean(values.username),
          password: values.password,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message || "Credenciais inválidas.")
      
      // Cookies do Cliente (ddp-ctm)
      Cookies.set("ddp-ctm-00", data.access_token, { expires: 7 }) // Clientes costumam ficar logados mais tempo
      Cookies.set("ddp-ctm-01", JSON.stringify(data.user), { expires: 7 })
        
      return data
    }

    toast.promise(loginAction(), {
      loading: "Entrando no seu portal...",
      success: () => {
        router.push("/portal-cliente")
        return "Olá! Bem-vindo de volta."
      },
      error: (err) => {
        setIsLoading(false)
        return err.message
      },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/assets/images/dogao-do-pastor.svg"
            alt="Dogão do Pastor Logo"
            width={140}
            height={140}
            priority
          />
        </div>

        <Card className="border-none shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-black uppercase text-slate-800">Portal do Cliente</CardTitle>
            <CardDescription>
              Acompanhe seus pedidos e gerencie suas doações.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold uppercase">CPF</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                          <Input 
                            className="pl-10 h-11" 
                            placeholder="000.000.000-00" 
                            type="tel"
                            {...field} 
                            onChange={(e) => field.onChange(NumbersHelper.maskCPF(e.target.value))}
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
                      <FormLabel className="text-[10px] font-bold uppercase">Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                          <Input type="password" placeholder="••••••••" className="pl-10 h-11" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-orange-600 hover:bg-orange-700 h-12 text-base font-bold uppercase tracking-wider" 
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "ACESSAR MEU PORTAL"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 text-center">
            <p className="text-sm text-slate-500">
              Esqueceu a senha? <Link href="/portal-cliente/recuperar-senha" className="text-orange-600 font-bold hover:underline">Clique aqui</Link>
            </p>
            <div className="pt-2 border-t w-full">
              <p className="text-xs text-slate-400">
                Ainda não tem conta? <Link href="/site/cadastro" className="text-slate-700 font-bold hover:underline">Cadastre-se no site</Link>
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}