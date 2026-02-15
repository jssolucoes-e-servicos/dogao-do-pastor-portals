"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Cookies from "js-cookie"
import { Building2, Loader2, Lock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { partnerLoginSchema } from "@/lib/validations/auth"
import Image from "next/image"
import { AuthPartnerLoginAction } from "@/actions/auth/partner-login.action"

const maskCNPJ = (v: string) => v.replace(/\D/g, "").replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1/$2").replace(/(\d{4})(\d)/, "$1-$2").slice(0, 18)

export default function PartnerLoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof partnerLoginSchema>>({
    resolver: zodResolver(partnerLoginSchema),
    defaultValues: { username: "", password: "" },
  })

  async function onSubmit(values: z.infer<typeof partnerLoginSchema>) {
    setIsLoading(true)
    const loginAction = async () => {
      return await AuthPartnerLoginAction({
        username: values.username.replace(/\D/g, ""),
        password: values.password,
      });
    }
    toast.promise(loginAction(), {
      loading: "Autenticando...",
      success: () => {
        router.push("/portal-parceiro")
        return "Bem-vindo ao Portal do Parceiro!"
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
          <div className="">
            <Image
              src="/assets/images/dogao-do-pastor.svg"
              alt="Dogão do Pastor Logo"
              width={164}
              height={164}
              priority
            />
          </div>
        </div>

        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle>Portal do Parceiro</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNPJ</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                          <Input 
                            className="pl-10" 
                            placeholder="00.000.000/0000-00" 
                            {...field} 
                            onChange={(e) => field.onChange(maskCNPJ(e.target.value))}
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
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                          <Input type="password" placeholder="••••••••" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-orange-600 hover:bg-orange-700 h-11" 
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Entrar"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="text-center justify-center">
            {/* <p className="text-sm text-slate-500">
              Esqueceu a senha? <Link href="/portal-parceiro/acesso/recuperar-senha" className="text-orange-600 font-bold">Clique aqui</Link>
            </p> */}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}