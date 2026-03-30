"use client"

import { UpsertEditionAction } from "@/actions/editions/upsert-edition.action";
import { DeleteEditionAction } from "@/actions/editions/delete-edition.action";
import { VerifyPasswordAction } from "@/actions/auth/verify-password.action";
import { EditionEntity } from "@/actions/editions/paginate-editions.action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, ArrowLeft, Calendar, DollarSign, Loader2, Lock, Package, Power, Save, Trash2, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const formSchema = z.object({
  name: z.string().min(3, "Nome muito curto"),
  productionDate: z.string().min(1, "Data de produção obrigatória"),
  saleStartDate: z.string().min(1, "Início das vendas obrigatório"),
  saleEndDate: z.string().min(1, "Fim das vendas obrigatório"),
  autoEnableDate: z.string().optional(),
  autoDisableDate: z.string().optional(),
  limitSale: z.coerce.number().min(1, "Limite mínimo é 1"),
  dogPrice: z.coerce.number().min(0.01, "Preço inválido"),
  active: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function toDatetimeLocal(dateStr?: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toISOString().slice(0, 16);
}

interface Props {
  edition?: EditionEntity;
}

export function EditionForm({ edition }: Props) {
  const router = useRouter();
  const isEdit = !!edition;
  const [isDangerOpen, setIsDangerOpen] = useState(false);
  const [dangerPassword, setDangerPassword] = useState("");
  const [isDangerLoading, setIsDangerLoading] = useState(false);

  const form = useForm<FormValues, unknown, FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: edition?.name || "",
      productionDate: toDatetimeLocal(edition?.productionDate),
      saleStartDate: toDatetimeLocal(edition?.saleStartDate),
      saleEndDate: toDatetimeLocal(edition?.saleEndDate),
      autoEnableDate: toDatetimeLocal(edition?.autoEnableDate),
      autoDisableDate: toDatetimeLocal(edition?.autoDisableDate),
      limitSale: edition?.limitSale ?? 200,
      dogPrice: edition?.dogPrice ?? 24.99,
      active: edition?.active ?? true,
    },
  });

  async function onSubmit(values: FormValues) {
    const payload = {
      ...values,
      productionDate: new Date(values.productionDate).toISOString(),
      saleStartDate: new Date(values.saleStartDate).toISOString(),
      saleEndDate: new Date(values.saleEndDate).toISOString(),
      autoEnableDate: values.autoEnableDate ? new Date(values.autoEnableDate).toISOString() : undefined,
      autoDisableDate: values.autoDisableDate ? new Date(values.autoDisableDate).toISOString() : undefined,
    };

    const res = await UpsertEditionAction(isEdit, edition?.id || null, payload);
    if (res.success) {
      toast.success(isEdit ? "Edição atualizada!" : "Edição criada!");
      router.push("/erp/edicoes");
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }

  async function handleDelete() {
    if (!edition) return;
    setIsDangerLoading(true);
    try {
      const verify = await VerifyPasswordAction(dangerPassword);
      if (!verify.success) { toast.error(verify.error || "Senha incorreta"); return; }
      const res = await DeleteEditionAction(edition.id);
      if (res.success) {
        toast.success("Edição removida");
        router.push("/erp/edicoes");
        router.refresh();
      } else {
        toast.error(res.error);
      }
    } finally {
      setIsDangerLoading(false);
      setIsDangerOpen(false);
      setDangerPassword("");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="shadow-sm border-orange-200 dark:border-orange-900/30 overflow-hidden">
          <CardHeader className="border-b bg-orange-50/50 dark:bg-orange-950/20 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-600" />
                <CardTitle className="text-lg font-black uppercase tracking-tight text-orange-900 dark:text-orange-400">
                  {isEdit ? "Editar Edição" : "Nova Edição"}
                </CardTitle>
              </div>
              <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-orange-600">
                <Link href="/erp/edicoes"><ArrowLeft className="h-4 w-4 mr-2" /> Voltar</Link>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nome */}
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel className="font-bold uppercase text-[11px] flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-orange-600" /> Nome da Edição
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: Dogão do Pastor - Abril 2026" className="h-12 border-orange-100 focus-visible:ring-orange-500 uppercase font-bold" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Data de Produção */}
            <FormField control={form.control} name="productionDate" render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold uppercase text-[11px] flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-orange-600" /> Data de Produção
                </FormLabel>
                <FormControl>
                  <Input {...field} type="datetime-local" className="h-12 border-orange-100 focus-visible:ring-orange-500 font-bold" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Preço */}
            <FormField control={form.control} name="dogPrice" render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold uppercase text-[11px] flex items-center gap-2">
                  <DollarSign className="h-3.5 w-3.5 text-orange-600" /> Preço por Dog (R$)
                </FormLabel>
                <FormControl>
                  <Input {...field} type="number" step="0.01" min="0" className="h-12 border-orange-100 focus-visible:ring-orange-500 font-bold" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Início das Vendas */}
            <FormField control={form.control} name="saleStartDate" render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold uppercase text-[11px] flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-green-600" /> Início das Vendas
                </FormLabel>
                <FormControl>
                  <Input {...field} type="datetime-local" className="h-12 border-orange-100 focus-visible:ring-orange-500 font-bold" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Fim das Vendas */}
            <FormField control={form.control} name="saleEndDate" render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold uppercase text-[11px] flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-red-500" /> Fim das Vendas
                </FormLabel>
                <FormControl>
                  <Input {...field} type="datetime-local" className="h-12 border-orange-100 focus-visible:ring-orange-500 font-bold" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Limite de Vendas */}
            <FormField control={form.control} name="limitSale" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel className="font-bold uppercase text-[11px] flex items-center gap-2">
                  <Package className="h-3.5 w-3.5 text-orange-600" /> Limite de Vendas (unidades)
                </FormLabel>
                <FormControl>
                  <Input {...field} type="number" min="1" className="h-12 border-orange-100 focus-visible:ring-orange-500 font-bold" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Auto Enable */}
            <FormField control={form.control} name="autoEnableDate" render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold uppercase text-[11px] flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-yellow-500" /> Ativar Automaticamente (opcional)
                </FormLabel>
                <FormControl>
                  <Input {...field} type="datetime-local" className="h-12 border-orange-100 focus-visible:ring-orange-500 font-bold" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Auto Disable */}
            <FormField control={form.control} name="autoDisableDate" render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold uppercase text-[11px] flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-slate-400" /> Desativar Automaticamente (opcional)
                </FormLabel>
                <FormControl>
                  <Input {...field} type="datetime-local" className="h-12 border-orange-100 focus-visible:ring-orange-500 font-bold" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Status ativo — só exibe na edição */}
            {isEdit && (
              <FormField control={form.control} name="active" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <div className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${field.value ? 'border-green-200 bg-green-50/50 dark:bg-green-950/10' : 'border-red-200 bg-red-50/50 dark:bg-red-950/10'}`}>
                    <div className="flex items-center gap-3">
                      <Power className={`h-5 w-5 ${field.value ? 'text-green-600' : 'text-red-500'}`} />
                      <div>
                        <FormLabel className="font-black uppercase text-[11px] cursor-pointer">
                          Status da Edição
                        </FormLabel>
                        <p className={`text-[10px] font-bold mt-0.5 ${field.value ? 'text-green-600' : 'text-red-500'}`}>
                          {field.value ? 'Edição ativa — visível para vendas' : 'Edição inativa — não aparece para vendas'}
                        </p>
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-green-600"
                      />
                    </FormControl>
                  </div>
                </FormItem>
              )} />
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="submit"
            className="w-full md:w-auto bg-orange-600 hover:bg-orange-700 h-14 md:h-12 px-12 font-black uppercase tracking-widest shadow-lg shadow-orange-200 dark:shadow-none transition-all"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting
              ? <Loader2 className="h-5 w-5 animate-spin" />
              : <><Save className="h-5 w-5 mr-2" />{isEdit ? "Atualizar Edição" : "Criar Edição"}</>
            }
          </Button>
        </div>

        {/* Zona Danger — só na edição */}
        {isEdit && (
          <Card className="border-2 border-red-200 dark:border-red-900/50 overflow-hidden">
            <CardHeader className="bg-red-50/50 dark:bg-red-950/20 border-b border-red-100 dark:border-red-900/30 p-5">
              <CardTitle className="text-sm font-black uppercase tracking-tight text-red-700 dark:text-red-400 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Zona de Perigo
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-red-700 dark:text-red-400">Remover esta edição</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  A edição será desativada e removida do sistema. Esta ação requer confirmação de senha.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDangerOpen(true)}
                className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 font-black uppercase text-[10px] gap-2 shrink-0"
              >
                <Trash2 className="h-4 w-4" /> Remover Edição
              </Button>
            </CardContent>
          </Card>
        )}

        {/* AlertDialog de confirmação com senha */}
        <AlertDialog open={isDangerOpen} onOpenChange={setIsDangerOpen}>
          <AlertDialogContent className="rounded-3xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-black uppercase flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" /> Confirmar Remoção
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm">
                Você está prestes a remover a edição <span className="font-black text-foreground">{edition?.name}</span>.
                Para confirmar, digite sua senha abaixo.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="py-2">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Digite sua senha"
                  value={dangerPassword}
                  onChange={(e) => setDangerPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && dangerPassword && handleDelete()}
                  className="pl-10 h-12 rounded-xl"
                  autoFocus
                />
              </div>
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => { setDangerPassword(""); }}
                className="rounded-xl font-black uppercase text-[10px]"
              >
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={!dangerPassword || isDangerLoading}
                className="bg-red-600 hover:bg-red-700 rounded-xl font-black uppercase text-[10px] gap-2"
              >
                {isDangerLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Confirmar Remoção
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </form>
    </Form>
  );
}
