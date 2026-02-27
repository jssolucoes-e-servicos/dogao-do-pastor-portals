// src/app/(erp)/vendedores/[id]/editar/_components/seller-update-form.tsx
"use client"

import { SellerUpdateAction } from "@/actions/sellers/update.action";
import { CellEntity, SellerEntity } from "@/common/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface Props {
  seller: SellerEntity;
  cells: CellEntity[];
}

export function SellerUpdateForm({ seller, cells }: Props) {
  const router = useRouter();
  const { register, handleSubmit, setValue, formState: { isSubmitting } } = useForm({
    defaultValues: {
      name: seller.name,
      cellId: seller.cellId,
    }
  });

  const onSubmit = async (data: any) => {
    try {
      await SellerUpdateAction(seller.id, data.cellId, data.name);
      toast.success("Vendedor atualizado com sucesso!");
      router.push(`/erp/vendedores/${seller.id}`);
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar vendedor.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="font-bold">Nome de Exibição (Vendedor)</Label>
            <Input 
              id="name" 
              {...register("name", { required: true })} 
              placeholder="Ex: Célula Ebenézer 3 - Elusa"
              className="h-12 border-2 focus-visible:ring-orange-500"
            />
            <p className="text-[11px] text-muted-foreground italic">
              * Este nome aparece nos links de venda e relatórios de metas.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cellId" className="font-bold">Vínculo de Célula</Label>
            <Select 
              defaultValue={seller.cellId} 
              onValueChange={(value) => setValue("cellId", value)}
            >
              <SelectTrigger className="h-12 border-2">
                <SelectValue placeholder="Selecione a célula" />
              </SelectTrigger>
              <SelectContent>
                {cells.map((cell: CellEntity) => (
                  <SelectItem key={cell.id} value={cell.id}>
                    {cell.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="flex-1 h-12 bg-orange-600 hover:bg-orange-700 font-bold uppercase"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : <Save className="mr-2 w-4 h-4" />}
              Salvar Alterações
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.back()} 
              className="h-12 font-bold uppercase"
            >
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}