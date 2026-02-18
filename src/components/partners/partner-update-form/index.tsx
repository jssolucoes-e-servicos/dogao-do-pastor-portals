// src/components/partners/partner-update-form/index.tsx
"use client"

import { UpsertPartnerAction } from "@/actions/partners/upsert-partner.action"
import { PartnerEntity } from "@/common/entities"
import { AddressHelper } from "@/common/helpers/address-helper"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { partnerUpdateSchema } from "@/lib/validations/partner"
import { zodResolver } from "@hookform/resolvers/zod"
import { Building2, CheckCircle2, Loader2, MapPin, Save, ShieldCheck } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

// Schema estendido apenas para tipagem interna do formulário
const adminPartnerSchema = partnerUpdateSchema.extend({
  active: z.boolean().optional(),
  approved: z.boolean().optional(),
})

type AdminPartnerValues = z.infer<typeof adminPartnerSchema>

const maskCEP = (v: string) => v.replace(/\D/g, "").replace(/^(\d{5})(\d)/, "$1-$2").slice(0, 9)
const maskPhone = (v: string) => {
  v = v.replace(/\D/g, "")
  if (v.length <= 10) return v.replace(/^(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
  return v.replace(/^(\d{2})(\d{5})(\d{4})/, "($1) $2-$3").slice(0, 15)
}

interface PartnerUpdateFormProps {
  partnerId: string;
  initialData?: PartnerEntity;
  isEdit?: boolean;
  isAdmin?: boolean;
  onSuccess?: () => void;
}

export function PartnerUpdateForm({ partnerId, initialData, isEdit = false, isAdmin = false, onSuccess }: PartnerUpdateFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingCep, setIsLoadingCep] = useState(false)

  const form = useForm<AdminPartnerValues>({
    resolver: zodResolver(adminPartnerSchema) as any,
    defaultValues: {
      name: initialData?.name || "",
      cnpj: initialData?.cnpj || "",
      phone: initialData?.phone || "",
      description: initialData?.description || "",
      zipCode: initialData?.zipCode || "",
      street: initialData?.street || "",
      number: initialData?.number || "",
      neighborhood: initialData?.neighborhood || "",
      city: initialData?.city || "",
      state: initialData?.state || "",
      complement: initialData?.complement || "",
      responsibleName: initialData?.responsibleName || "",
      responsiblePhone: initialData?.responsiblePhone || "",
      password: "", 
      active: initialData?.active ?? true,
      approved: initialData?.approved ?? true,
    },
  })

  const handleCepChange = async (cep: string) => {
    form.setValue("zipCode", maskCEP(cep))
    const cleanCep = AddressHelper.cleanNumericString(cep)
    if (cleanCep.length === 8) {
      setIsLoadingCep(true)
      const data = await AddressHelper.fetchAddressByCep(cleanCep)
      if (data) {
        form.setValue("street", data.logradouro)
        form.setValue("neighborhood", data.bairro)
        form.setValue("city", data.localidade)
        form.setValue("state", data.uf)
        setTimeout(() => form.setFocus("number"), 100)
      }
      setIsLoadingCep(false)
    }
  }

  async function onSubmit(values: AdminPartnerValues) {
    setIsSubmitting(true)
    try {
      const payload: any = {
        ...values,
        cnpj: AddressHelper.cleanNumericString(values.cnpj),
        addressInLine: AddressHelper.formatAddressInline(values as any),
      }

      // LIMPEZA DE PAYLOAD PARA EVITAR ERRO DE PROPRIEDADE INEXISTENTE NA API
      if (isEdit) delete payload.password;
      
      // Se não for Admin (Portal do Parceiro ou Link Público), removemos campos de controle
      if (!isAdmin) {
        delete payload.active;
        delete payload.approved;
        delete payload.logo; // Remove para evitar o erro "property logo should not exist"
      }

      await UpsertPartnerAction(isEdit, partnerId, payload);
      
      toast.success(isEdit ? "Perfil atualizado!" : "Cadastro realizado com sucesso!");
      
      if (onSuccess) onSuccess();
      
      if (!isEdit) {
        router.push(isAdmin ? "/erp/partners" : "/portal-parceiro/login");
      } else {
        router.refresh();
      }
    } catch (err: any) {
      const message = Array.isArray(err.message) ? err.message[0] : err.message;
      toast.error(message || "Erro ao salvar");
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {/* CAMPOS ADMIN (ERP ONLY) */}
        {isAdmin && (
          <Card className="border-orange-200 bg-orange-50/20 shadow-none">
            <CardHeader className="py-3 border-b border-orange-100">
              <CardTitle className="text-[10px] font-black uppercase flex items-center gap-2 text-orange-700">
                <ShieldCheck className="w-4 h-4"/> Gestão Administrativa
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <FormField control={form.control} name="active" render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border bg-white p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel className="text-xs font-bold uppercase">Parceiro Ativo</FormLabel>
                    <FormDescription className="text-[10px]">Permite acesso ao portal.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="approved" render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border bg-white p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel className="text-xs font-bold uppercase">Aprovação</FormLabel>
                    <FormDescription className="text-[10px]">Libera para receber doações.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )} />
            </CardContent>
          </Card>
        )}

        <Card className="shadow-sm border-slate-100">
          <CardHeader className="bg-slate-50/50 py-3 border-b">
            <CardTitle className="text-xs font-black uppercase flex items-center gap-2">
              <Building2 className="w-4 h-4 text-orange-600"/> Dados Principais
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 pt-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-bold uppercase">Nome Fantasia</FormLabel>
                <FormControl><Input {...field} placeholder="Ex: Dogão do Pastor" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="cnpj" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold uppercase">{isEdit ? "CNPJ (Imutável)" : "CNPJ"}</FormLabel>
                  <FormControl>
                    <Input {...field} readOnly={isEdit} className={isEdit ? "bg-slate-100 font-mono" : "font-mono"} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold uppercase">Telefone</FormLabel>
                  <FormControl>
                    <Input {...field} onChange={(e) => field.onChange(maskPhone(e.target.value))} />
                  </FormControl>
                </FormItem>
              )} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-100">
          <CardHeader className="bg-slate-50/50 py-3 border-b">
            <CardTitle className="text-xs font-black uppercase flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-600"/> Endereço
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4">
            <FormField control={form.control} name="zipCode" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-bold uppercase">CEP</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input {...field} onChange={(e) => handleCepChange(e.target.value)} maxLength={9} />
                    {isLoadingCep && <Loader2 className="w-3 h-3 animate-spin absolute right-2 top-3 text-orange-600" />}
                  </div>
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="street" render={({ field }) => (
              <FormItem className="md:col-span-3">
                <FormLabel className="text-[10px] font-bold uppercase">Rua</FormLabel>
                <FormControl><Input {...field} readOnly className="bg-slate-50" /></FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="number" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-bold uppercase text-orange-600">Número *</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="complement" render={({ field }) => (
              <FormItem><FormLabel className="text-[10px] font-bold uppercase">Complemento</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="neighborhood" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel className="text-[10px] font-bold uppercase">Bairro</FormLabel>
                <FormControl><Input {...field} readOnly className="bg-slate-50" /></FormControl>
              </FormItem>
            )} />
            <div className="md:col-span-4 grid grid-cols-3 gap-4">
              <FormField control={form.control} name="city" render={({ field }) => (
                <FormItem className="col-span-2"><FormLabel className="text-[10px] font-bold uppercase">Cidade</FormLabel><FormControl><Input {...field} readOnly className="bg-slate-50" /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="state" render={({ field }) => (
                <FormItem><FormLabel className="text-[10px] font-bold uppercase">UF</FormLabel><FormControl><Input {...field} readOnly className="bg-slate-50 text-center" /></FormControl></FormItem>
              )} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-orange-100 bg-orange-50/10">
          <CardHeader className="bg-orange-50/50 py-3 border-b border-orange-100">
            <CardTitle className="text-xs font-black uppercase text-orange-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4"/> Conta de Acesso
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 pt-4">
            <FormField control={form.control} name="responsibleName" render={({ field }) => (
              <FormItem><FormLabel className="text-[10px] font-bold uppercase">Responsável</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="responsiblePhone" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold uppercase">WhatsApp</FormLabel>
                  <FormControl><Input {...field} onChange={(e) => field.onChange(maskPhone(e.target.value))} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              {!isEdit && (
                <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase text-orange-700">Senha de Acesso *</FormLabel>
                    <FormControl><Input type="password" {...field} placeholder="Mínimo 6 caracteres" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              )}
            </div>
          </CardContent>
        </Card>

        <Button 
          type="submit" 
          disabled={isSubmitting} 
          className="w-full h-14 bg-orange-600 hover:bg-orange-700 text-white font-black uppercase tracking-widest shadow-lg text-lg"
        >
          {isSubmitting ? <Loader2 className="animate-spin" /> : <><Save className="mr-2 w-5 h-5"/> {isEdit ? "SALVAR ALTERAÇÕES" : "CONCLUIR CADASTRO"}</>}
        </Button>
      </form>
    </Form>
  )
}