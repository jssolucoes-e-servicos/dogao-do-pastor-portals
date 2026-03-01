// src/components/erp/profile/edit-profile-modal.tsx
"use client"

import { ContributorsUpdateAction } from "@/actions/contributors/update.action";
import { ContributorEntity } from "@/common/entities";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, Smartphone, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const profileSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  phone: z.string().min(10, "Informe um telefone válido"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface Props {
  contributor: ContributorEntity;
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileEditModal({ contributor, isOpen, onClose }: Props) {
  const router = useRouter();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: contributor.name || "",
      phone: contributor.phone || "",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: ProfileFormValues) {
    try {
      const response = await ContributorsUpdateAction(contributor.id, values);

      if (response.success) {
        toast.success("Perfil atualizado com sucesso!");
        router.refresh(); // Atualiza os dados no Server Component
        onClose();
      } else {
        toast.error(response.error || "Erro ao atualizar perfil.");
      }
    } catch (error) {
      toast.error("Ocorreu um erro inesperado.");
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="uppercase font-black text-lg">Editar Perfil</DialogTitle>
          <DialogDescription>
            Altere seus dados básicos de contato abaixo.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-muted-foreground">Nome Completo</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input {...field} className="pl-9" placeholder="Seu nome" />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[10px] font-bold uppercase" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-muted-foreground">Telefone / WhatsApp</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input {...field} className="pl-9" placeholder="(00) 00000-0000" />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[10px] font-bold uppercase" />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="ghost" 
                onClick={onClose} 
                className="uppercase text-[10px] font-black"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-orange-600 hover:bg-orange-700 uppercase text-[10px] font-black gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Salvar Alterações
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}