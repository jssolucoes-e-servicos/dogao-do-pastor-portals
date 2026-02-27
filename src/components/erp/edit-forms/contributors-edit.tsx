// src/components/erp/partners/contributor-form-edit.tsx
"use client"

import { ContributorsUpdateAction } from "@/actions/contributors/update.action";
import { CellEntity, CellNetworkEntity, ContributorEntity } from "@/common/entities";
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
import { ArrowLeft, Crown, IdCard, Loader2, Save, Smartphone, User, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const formSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  username: z.string().min(3, "O username deve ter pelo menos 3 caracteres"),
  phone: z.string().min(10, "Telefone inválido"),
});

interface Props {
  contributor: ContributorEntity;
}

export function ContributorFormEdit({ contributor }: Props) {
  const router = useRouter();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: contributor.name || "",
      username: contributor.username || "",
      phone: contributor.phone || "",
    },
  });

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 11) val = val.slice(0, 11);
    
    if (val.length > 10) {
      val = val.replace(/^(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    } else if (val.length > 5) {
      val = val.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    } else if (val.length > 2) {
      val = val.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
    } else if (val.length > 0) {
      val = val.replace(/^(\d{0,2})/, "($1");
    }
    
    form.setValue("phone", val);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const res = await ContributorsUpdateAction(contributor.id, values);
    if (res.success) {
      toast.success("Colaborador atualizado com sucesso!");
      router.push(`/erp/colaboradores/${contributor.id}`);
    } else {
      toast.error(res.error || "Erro ao atualizar");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="shadow-sm border-orange-100 overflow-hidden">
          <CardHeader className="border-b bg-muted/20 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IdCard className="h-5 w-5 text-orange-600" />
                <CardTitle className="text-lg font-black uppercase tracking-tight text-orange-700">
                  Dados Cadastrais
                </CardTitle>
              </div>
              <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-orange-600">
                <Link href="/erp/colaboradores">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
                </Link>
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nome Completo */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <FormLabel className="font-bold uppercase text-[11px] mt-0.5">Nome Completo</FormLabel>
                  </div>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Anderson Briance" 
                      {...field} 
                      className="h-11 border-orange-200 focus-visible:ring-orange-500 bg-background" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Username */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-muted-foreground font-bold text-sm">@</span>
                    <FormLabel className="font-bold uppercase text-[11px] mt-0.5">Usuário (Username)</FormLabel>
                  </div>
                  <FormControl>
                    <Input 
                      placeholder="anderson.briance" 
                      {...field} 
                      className="h-11 border-orange-200 focus-visible:ring-orange-500 bg-background" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Telefone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2 mb-1">
                    <Smartphone className="h-3.5 w-3.5 text-muted-foreground" />
                    <FormLabel className="font-bold uppercase text-[11px] mt-0.5">Telefone / WhatsApp</FormLabel>
                  </div>
                  <FormControl>
                    <Input 
                      placeholder="(00) 00000-0000" 
                      {...field} 
                      onChange={(e) => {
                        field.onChange(e);
                        handlePhoneChange(e);
                      }}
                      className="h-11 border-orange-200 focus-visible:ring-orange-500 bg-background" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Visualização de Vínculos (Read Only) */}
            <div className="md:col-span-2 mt-4">
              <div className="flex flex-col gap-1 mb-3">
                <span className="font-bold uppercase text-[11px] text-muted-foreground">Vínculos de Hierarquia</span>
                <div className="h-px bg-orange-100 w-full" />
              </div>

              <div className="flex flex-wrap gap-3 p-4 rounded-lg border border-dashed bg-muted/10">
                {/* Supervisor de Rede */}
                {contributor.cellNetworks && contributor.cellNetworks?.length > 0 ? (
                  contributor.cellNetworks.map((net: CellNetworkEntity) => (
                    <div key={net.id} className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-md border border-orange-200 shadow-sm">
                      <Crown className="h-4 w-4 text-orange-600" />
                      <div className="flex flex-col leading-none">
                        <span className="text-[10px] font-black text-orange-800 uppercase leading-tight">{net.name}</span>
                        <span className="text-[8px] text-orange-500 font-bold uppercase tracking-tighter">Supervisor de Rede</span>
                      </div>
                    </div>
                  ))
                ) : null}

                {/* Líder de Célula */}
                {contributor.cells && contributor.cells?.length > 0 ? (
                  contributor.cells.map((cell: CellEntity) => (
                    <div key={cell.id} className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-md border border-blue-200 shadow-sm">
                      <Users className="h-4 w-4 text-blue-600" />
                      <div className="flex flex-col leading-none">
                        <span className="text-[10px] font-black text-blue-800 uppercase leading-tight">{cell.name}</span>
                        <span className="text-[8px] text-blue-500 font-bold uppercase tracking-tighter">Líder de Célula</span>
                      </div>
                    </div>
                  ))
                ) : null}

                {/* Caso não tenha vínculos */}
                {(!contributor.cells?.length && !contributor.cellNetworks?.length) && (
                  <div className="flex items-center gap-2 text-muted-foreground italic text-xs py-2">
                    <span className="w-2 h-2 rounded-full bg-slate-300" />
                    Nenhum vínculo de liderança encontrado.
                  </div>
                )}
              </div>
              
              <p className="text-[10px] text-muted-foreground mt-3 italic bg-orange-50/50 p-2 rounded border border-orange-100/50">
                * Os vínculos acima são geridos pelos módulos de Redes e Células. Alterações feitas aqui refletem apenas nos dados de contato do colaborador.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end items-center gap-4">
          <Link 
            href={`/erp/colaboradores/${contributor.id}`} 
            className="text-sm font-bold uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancelar
          </Link>
          <Button 
            type="submit" 
            className="bg-orange-600 hover:bg-orange-700 h-12 px-10 font-black uppercase tracking-widest shadow-lg hover:shadow-orange-200 transition-all gap-2"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            Salvar Alterações
          </Button>
        </div>
      </form>
    </Form>
  );
}