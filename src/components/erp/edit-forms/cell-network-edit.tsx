// src/components/erp/cell-networks/cell-network-form-edit.tsx
"use client"

import { CellsNetworksUpdateAction } from "@/actions/cells-networks/update.action";
import { CellNetworkEntity } from "@/common/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Crown, ExternalLink, Layers, Loader2, Save, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const formSchema = z.object({
  name: z.string().min(3, "O nome da rede deve ter pelo menos 3 caracteres"),
});

interface Props {
  network: CellNetworkEntity;
}

export function CellNetworkFormEdit({ network }: Props) {
  const router = useRouter();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: network.name || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const res = await CellsNetworksUpdateAction(network.id, values);
    if (res.success) {
      toast.success("Rede ministerial atualizada com sucesso!");
      router.push(`/erp/redes-de-celulas/${network.id}`);
      router.refresh();
    } else {
      toast.error(res.error || "Erro ao atualizar rede");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="shadow-sm border-orange-200/20 dark:border-orange-900/30 overflow-hidden">
          <CardHeader className="border-b bg-orange-50/50 dark:bg-orange-950/20 py-4 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <CardTitle className="text-lg font-black uppercase tracking-tight text-orange-700 dark:text-orange-400">
                  Dados da Rede Ministerial
                </CardTitle>
              </div>
              <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400">
                <Link href="/erp/redes-de-celulas">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
                </Link>
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nome da Rede */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                    <FormLabel className="font-bold uppercase text-[11px] mt-0.5 tracking-widest text-foreground dark:text-slate-300">
                      Nome da Rede
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Rede Jardim Regado" 
                      {...field} 
                      className="h-11 border-orange-200 dark:border-orange-900/50 focus-visible:ring-orange-500 bg-background text-foreground" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Supervisor (Apenas Visualização) */}
            <div className="md:col-span-2 mt-4">
              <div className="flex flex-col gap-1 mb-3">
                <span className="font-bold uppercase text-[11px] text-muted-foreground tracking-widest dark:text-slate-400">
                  Supervisor Responsável
                </span>
                <div className="h-px bg-orange-100 dark:bg-orange-900/50 w-full" />
              </div>

              {network.supervisor ? (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg border border-orange-200 dark:border-orange-900/50 bg-orange-50/30 dark:bg-orange-950/10">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-100 dark:bg-orange-950/40 p-2.5 rounded-full border border-orange-200 dark:border-orange-900/50">
                      <User className="h-5 w-5 text-orange-700 dark:text-orange-400" />
                    </div>
                    <div className="flex flex-col leading-none">
                      <span className="font-bold text-base text-foreground dark:text-orange-300 uppercase leading-tight">
                        {network.supervisor.name}
                      </span>
                      <span className="text-[11px] text-orange-600 dark:text-orange-500 font-bold uppercase tracking-widest">
                        @{network.supervisor.username}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild className="text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900/50 gap-2 hover:bg-orange-100 dark:hover:bg-orange-950/40 transition-colors">
                    <Link href={`/erp/partners/${network.supervisor.id}`} className="group">
                      <ExternalLink className="h-4 w-4" />
                      Ver Perfil
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="p-4 rounded-lg border border-dashed bg-muted/10 text-xs text-muted-foreground italic">
                  Nenhum supervisor vinculado a esta rede ministerial.
                </div>
              )}

              <p className="text-[10px] text-muted-foreground mt-3 italic bg-orange-50/50 dark:bg-orange-950/10 p-2 rounded border border-orange-100/50 dark:border-orange-900/40">
                * Para alterar o supervisor responsável por esta rede, utilize o fluxo de transição ministerial (módulo em breve).
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end items-center gap-4 pt-2">
          <Link 
            href={`/erp/redes-de-celulas/${network.id}`} 
            className="text-sm font-bold uppercase text-muted-foreground hover:text-foreground dark:hover:text-slate-200 transition-colors"
          >
            Cancelar
          </Link>
          <Button 
            type="submit" 
            className="bg-orange-600 dark:bg-orange-600 hover:bg-orange-700 dark:hover:bg-orange-700 h-12 px-10 font-black uppercase tracking-widest shadow-lg hover:shadow-orange-200 dark:hover:shadow-orange-950 transition-all gap-2"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            Salvar Rede
          </Button>
        </div>
      </form>
    </Form>
  );
}