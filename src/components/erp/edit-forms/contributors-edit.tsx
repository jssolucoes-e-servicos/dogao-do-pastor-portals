"use client";

import { ContributorsUpdateAction } from "@/actions/contributors/update.action";
import { ContributorLinkRoleAction } from "@/actions/contributors/link-role.action";
import { ContributorUnlinkRoleAction } from "@/actions/contributors/unlink-role.action";
import { CellEntity, CellNetworkEntity, ContributorEntity, RoleEntity } from "@/common/entities";
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
import { ArrowLeft, Crown, IdCard, Loader2, Save, Smartphone, User, Users, ShieldCheck, ShieldAlert, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  username: z.string().min(3, "O username deve ter pelo menos 3 caracteres"),
  phone: z.string().min(10, "Telefone inválido"),
});

interface Props {
  contributor: ContributorEntity;
  allRoles: RoleEntity[];
}

export function ContributorFormEdit({ contributor, allRoles }: Props) {
  const router = useRouter();
  const [userRoles, setUserRoles] = useState<string[]>(
    contributor.userRoles?.map((ur: any) => ur.roleId) || []
  );
  const [linkingRole, setLinkingRole] = useState<string | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: contributor.name || "",
      username: contributor.username || "",
      phone: contributor.phone || "",
    },
  });

  const handleToggleRole = async (roleId: string) => {
    const isLinked = userRoles.includes(roleId);
    setLinkingRole(roleId);

    try {
      if (isLinked) {
        const res = await ContributorUnlinkRoleAction(contributor.id, roleId);
        if (res.success) {
          setUserRoles(prev => prev.filter(id => id !== roleId));
          toast.success("Perfil desvinculado");
        } else {
          toast.error(res.error || "Erro ao desvincular");
        }
      } else {
        const res = await ContributorLinkRoleAction(contributor.id, roleId);
        if (res.success) {
          setUserRoles(prev => [...prev, roleId]);
          toast.success("Perfil vinculado");
        } else {
          toast.error(res.error || "Erro ao vincular");
        }
      }
    } finally {
      setLinkingRole(null);
    }
  };

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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-12">
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
          </CardContent>
        </Card>

        {/* Gestão de Perfis de Acesso */}
        <Card className="shadow-sm border-orange-100 overflow-hidden">
          <CardHeader className="border-b bg-muted/20 py-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <CardTitle className="text-lg font-black uppercase tracking-tight text-emerald-700">
                Perfis de Acesso (Roles)
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-[10px] font-bold uppercase text-muted-foreground mb-4 tracking-wider">
              Clique para ativar ou desativar o perfil para este usuário:
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {allRoles.map((role) => {
                const isSelected = userRoles.includes(role.id);
                const isLoading = linkingRole === role.id;

                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleToggleRole(role.id)}
                    disabled={isLoading}
                    className={`
                      relative flex items-center justify-between p-3 rounded-xl border transition-all text-left
                      ${isSelected 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-sm' 
                        : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-200 hover:bg-emerald-50/30'
                      }
                      ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-tighter leading-none mb-1">
                        {role.name}
                      </span>
                      <span className="text-[8px] font-medium opacity-70">
                        {(role as any).label || rolesLabels[role.name as keyof typeof rolesLabels] || 'Permissão padrão'}
                      </span>
                    </div>

                    {isLoading ? (
                      <Loader2 className="h-3 w-3 animate-spin text-emerald-600" />
                    ) : isSelected ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-slate-200" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 italic">
               <ShieldAlert className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
               <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  {`As permissões neste sistema são cumulativas. Ao atribuir múltiplos perfis, o usuário terá acesso a todas as funcionalidades permitidas em cada um deles.`}
               </p>
            </div>
          </CardContent>
        </Card>

        {/* Visualização de Vínculos (Read Only) */}
        <Card className="shadow-sm border-slate-100 overflow-hidden bg-slate-50/30">
          <CardHeader className="py-3 bg-muted/20">
             <div className="flex items-center gap-2">
               <Users className="h-4 w-4 text-muted-foreground" />
               <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Vínculos Operacionais</h3>
             </div>
          </CardHeader>
          <CardContent className="pt-4">
              <div className="flex flex-wrap gap-3">
                {/* Supervisor de Rede */}
                {contributor.cellNetworks && contributor.cellNetworks?.length > 0 ? (
                  contributor.cellNetworks.map((net: CellNetworkEntity) => (
                    <div key={net.id} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                      <Crown className="h-3.5 w-3.5 text-orange-600" />
                      <div className="flex flex-col leading-none">
                        <span className="text-[9px] font-black text-slate-800 uppercase leading-tight">{net.name}</span>
                        <span className="text-[7px] text-orange-500 font-bold uppercase tracking-tighter">Supervisor de Rede</span>
                      </div>
                    </div>
                  ))
                ) : null}

                {/* Líder de Célula */}
                {contributor.cells && contributor.cells?.length > 0 ? (
                  contributor.cells.map((cell: CellEntity) => (
                    <div key={cell.id} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                      <Users className="h-3.5 w-3.5 text-blue-600" />
                      <div className="flex flex-col leading-none">
                        <span className="text-[9px] font-black text-slate-800 uppercase leading-tight">{cell.name}</span>
                        <span className="text-[7px] text-blue-500 font-bold uppercase tracking-tighter">Líder de Célula</span>
                      </div>
                    </div>
                  ))
                ) : null}

                {/* Caso não tenha vínculos */}
                {(!contributor.cells?.length && !contributor.cellNetworks?.length) && (
                  <div className="flex items-center gap-2 text-muted-foreground italic text-[10px] py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    Nenhum vínculo de liderança encontrado.
                  </div>
                )}
              </div>
          </CardContent>
        </Card>

        <div className="flex justify-end items-center gap-4 pt-4 border-t">
          <Link 
            href={`/erp/colaboradores/${contributor.id}`} 
            className="text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            Descartar Alterações
          </Link>
          <Button 
            type="submit" 
            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-orange-600 dark:hover:bg-orange-500 h-12 px-10 font-black uppercase tracking-widest shadow-xl transition-all gap-2 rounded-2xl"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            Salvar Dados Cadastrais
          </Button>
        </div>
      </form>
    </Form>
  );
}

const rolesLabels = {
  "IT": "Acesso total e configurações técnicas",
  "ADMIN": "Administrador do sistema",
  "FINANCE": "Gestão financeira e faturamento",
  "RECEPTION": "Recepção, PDV e Cadastros",
  "EXPEDITION": "Expedição e logística",
  "DELIVERY": "Entregador",
  "SELLER": "Vendedor",
  "MANAGER": "Gerente de Redes",
  "LEADER": "Líder de Células",
};