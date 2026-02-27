// src/components/erp/cells/cell-form-edit.tsx
"use client"

import { CellsUpdateAction } from "@/actions/cells/update.action";
import { CellEntity } from "@/common/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Crown, Loader2, Save, Shield, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const formSchema = z.object({
  name: z.string().min(3, "O nome da célula deve ter pelo menos 3 caracteres"),
});

interface Props {
  cell: CellEntity;
}

export function CellFormEdit({ cell }: Props) {
  const router = useRouter();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: cell.name || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const res = await CellsUpdateAction(cell.id, values);
    if (res.success) {
      toast.success("Célula atualizada com sucesso!");
      router.push("/erp/celulas");
      router.refresh();
    } else {
      toast.error(res.error || "Erro ao atualizar célula");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="shadow-sm border-blue-200/20 dark:border-blue-900/30 overflow-hidden">
          <CardHeader className="border-b bg-blue-50/50 dark:bg-blue-950/20 py-4 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <CardTitle className="text-lg font-black uppercase tracking-tight text-blue-700 dark:text-blue-400">
                  Editar Unidade Celular
                </CardTitle>
              </div>
              <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-blue-600">
                <Link href="/erp/celulas">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
                </Link>
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6 space-y-6">
            {/* Nome da Célula */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold uppercase text-[11px] tracking-widest text-foreground dark:text-slate-300">
                    Nome da Célula
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Jardim Regado 3" 
                      {...field} 
                      className="h-11 border-blue-200 dark:border-blue-900/50 focus-visible:ring-blue-500 bg-background" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              {/* Card de Rede (Read-only por enquanto) */}
              <div className="p-4 rounded-lg border bg-orange-50/20 dark:bg-orange-950/5">
                <div className="flex items-center gap-2 mb-3">
                  <Crown className="h-4 w-4 text-orange-600" />
                  <span className="text-[10px] font-black uppercase text-orange-800 dark:text-orange-400 tracking-widest">Rede Ministerial</span>
                </div>
                <p className="font-bold text-sm uppercase text-foreground">{cell.network?.name || "Sem Rede"}</p>
                <p className="text-[10px] text-muted-foreground mt-1 italic">* Vinculação gerida pela supervisão</p>
              </div>

              {/* Card de Líder (Read-only por enquanto) */}
              <div className="p-4 rounded-lg border bg-blue-50/20 dark:bg-blue-950/5">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span className="text-[10px] font-black uppercase text-blue-800 dark:text-blue-400 tracking-widest">Liderança Atual</span>
                </div>
                <p className="font-bold text-sm uppercase text-foreground">{cell.leader?.name || "Sem Líder"}</p>
                <p className="text-[10px] text-muted-foreground mt-1 italic">* Alteração via prontuário do colaborador</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end items-center gap-4">
          <Button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700 h-12 px-10 font-black uppercase tracking-widest shadow-lg transition-all gap-2"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            Salvar Alterações
          </Button>
        </div>
      </form>
    </Form>
  );
}