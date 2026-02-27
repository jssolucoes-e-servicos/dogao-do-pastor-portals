// src/components/erp/customers/customer-form-edit.tsx
"use client"

import { CustomersUpdateAction } from "@/actions/customers/update.action";
import { CustomerEntity } from "@/common/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Church, Fingerprint, Loader2, Mail, Save, Smartphone, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const formSchema = z.object({
  name: z.string().min(3, "Nome muito curto"),
  email: z.string().email("E-mail inválido").nullable().or(z.literal("")),
  phone: z.string().min(10, "Telefone inválido"),
  cpf: z.string().min(11, "CPF inválido"),
  knowsChurch: z.boolean(),
  allowsChurch: z.boolean(),
});

interface Props {
  customer: CustomerEntity;
}

export function CustomerFormEdit({ customer }: Props) {
  const router = useRouter();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      cpf: customer.cpf || "",
      knowsChurch: customer.knowsChurch || false,
      allowsChurch: customer.allowsChurch || false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const res = await CustomersUpdateAction(customer.id, values);
    if (res.success) {
      toast.success("Cadastro atualizado!");
      router.push(`/erp/clientes/${customer.id}`);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="shadow-sm border-slate-200 dark:border-slate-800 overflow-hidden">
          <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/20 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg font-black uppercase tracking-tight">Editar Cliente</CardTitle>
              </div>
              <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-blue-600">
                <Link href={`/erp/clientes/${customer.id}`}>
                  <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
                </Link>
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="font-bold uppercase text-[11px] flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-blue-600" /> Nome Completo
                  </FormLabel>
                  <FormControl><Input {...field} className="h-12 uppercase border-slate-200 focus-visible:ring-blue-500" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cpf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold uppercase text-[11px] flex items-center gap-2">
                    <Fingerprint className="h-3.5 w-3.5 text-blue-600" /> CPF
                  </FormLabel>
                  <FormControl><Input {...field} className="h-12 border-slate-200 focus-visible:ring-blue-500" placeholder="000.000.000-00" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold uppercase text-[11px] flex items-center gap-2">
                    <Smartphone className="h-3.5 w-3.5 text-blue-600" /> WhatsApp
                  </FormLabel>
                  <FormControl><Input {...field} className="h-12 border-slate-200 focus-visible:ring-blue-500" placeholder="(00) 00000-0000" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="font-bold uppercase text-[11px] flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-blue-600" /> E-mail (Opcional)
                  </FormLabel>
                  <FormControl><Input {...field} value={field.value || ''} className="h-12 border-slate-200 focus-visible:ring-blue-500" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sessão Igreja */}
            <div className="md:col-span-2 space-y-4 pt-4 mt-2 border-t border-dashed">
                <div className="flex items-center gap-2">
                    <Church className="h-4 w-4 text-blue-600" />
                    <span className="text-[11px] font-black uppercase text-muted-foreground tracking-widest">Perfil Ministerial</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="knowsChurch"
                        render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-xl border p-4 bg-blue-50/30 dark:bg-blue-950/10">
                                <FormLabel className="text-xs font-bold uppercase cursor-pointer">Já conhece a igreja?</FormLabel>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="allowsChurch"
                        render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-xl border p-4 bg-blue-50/30 dark:bg-blue-950/10">
                                <FormLabel className="text-xs font-bold uppercase cursor-pointer">Permite contato ministerial?</FormLabel>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col md:flex-row justify-end gap-3 pt-2">
          <Button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700 h-14 md:h-12 px-10 font-black uppercase shadow-lg shadow-blue-200 dark:shadow-none" 
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5 mr-2" />}
            Salvar Alterações
          </Button>
        </div>
      </form>
    </Form>
  );
}