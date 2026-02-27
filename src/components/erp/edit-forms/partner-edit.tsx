// src/components/erp/partners/partner-form-edit.tsx
"use client"

import { UpsertPartnerAction } from "@/actions/partners/upsert-partner.action";
import { PartnerEntity } from "@/common/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Building2, Globe, Loader2, Save, Smartphone, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const formSchema = z.object({
  name: z.string().min(3, "Nome da empresa muito curto"),
  phone: z.string().min(10, "Telefone inválido"),
  responsibleName: z.string().min(3, "Nome do responsável muito curto"),
  responsiblePhone: z.string().min(10, "Telefone do responsável inválido"),
  website: z.string().url("URL inválida").nullable().or(z.literal("")),
});

interface Props {
  partner: PartnerEntity;
}

export function PartnerFormEdit({ partner }: Props) {
  const router = useRouter();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: partner.name || "",
      responsibleName: partner.responsibleName || "",
      responsiblePhone: partner.responsiblePhone || "",
      website: partner.website || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const res = await UpsertPartnerAction(true,partner.id, values);
    if (res.success) {
      toast.success("Parceiro atualizado!");
      router.push(`/erp/parceiros/${partner.id}`);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="shadow-sm border-purple-200 dark:border-purple-900/30 overflow-hidden">
          <CardHeader className="border-b bg-purple-50/50 dark:bg-purple-950/20 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-lg font-black uppercase tracking-tight text-purple-900 dark:text-purple-400">
                    Editar Parceiro
                </CardTitle>
              </div>
              <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-purple-600">
                <Link href="/erp/parceiros">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
                </Link>
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="font-bold uppercase text-[11px] flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5 text-purple-600" /> Nome da Empresa / Instituição
                  </FormLabel>
                  <FormControl>
                    <Input {...field} className="h-12 border-purple-100 focus-visible:ring-purple-500 uppercase font-bold" />
                  </FormControl>
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
                    <Smartphone className="h-3.5 w-3.5 text-purple-600" /> Telefone / WhatsApp
                  </FormLabel>
                  <FormControl>
                    <Input {...field} className="h-12 border-purple-100 focus-visible:ring-purple-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="responsibleName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold uppercase text-[11px] flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-purple-600" /> Pessoa de Contato
                  </FormLabel>
                  <FormControl>
                    <Input {...field} className="h-12 border-purple-100 focus-visible:ring-purple-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="responsiblePhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold uppercase text-[11px] flex items-center gap-2">
                    <Smartphone className="h-3.5 w-3.5 text-purple-600" /> Telefone / WhatsApp
                  </FormLabel>
                  <FormControl>
                    <Input {...field} className="h-12 border-purple-100 focus-visible:ring-purple-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="font-bold uppercase text-[11px] flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5 text-purple-600" /> Website / Instagram (Opcional)
                  </FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} placeholder="https://" className="h-12 border-purple-100 focus-visible:ring-purple-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button 
            type="submit" 
            className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 h-14 md:h-12 px-12 font-black uppercase tracking-widest shadow-lg shadow-purple-200 dark:shadow-none transition-all"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5 mr-2" />}
            Atualizar Parceiro
          </Button>
        </div>
      </form>
    </Form>
  );
}