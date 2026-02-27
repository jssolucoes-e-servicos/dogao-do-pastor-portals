// src/app/(erp)/vendedores/[id]/editar/page.tsx
import { CellsListAllAction } from "@/actions/cells/list-all.action";
import { SellersByIdAction } from "@/actions/sellers/find-by-id.action";
import { EditPageContents } from "@/components/erp/shared/edit-page-contents";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Edit, ExternalLink, User } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SellerUpdateForm } from "./_components/seller-update-form"; // Componente cliente

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditSellerPage({ params }: PageProps) {
  const { id } = await params;
  const { data: sellerData } = await SellersByIdAction(id);
  if (!sellerData) return notFound();
  const { data: cells } = await CellsListAllAction();
  if (!cells) return notFound();
  const seller = sellerData.seller
  
  return (
    <EditPageContents
      module="Módulo Administrativo"
      page="Vendedores"
      tag="SLR"
      id={id}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Coluna da Esquerda: Dados do Colaborador (Somente Leitura) */}
        <Card className="md:col-span-1 border-dashed bg-muted/20">
          <CardHeader>
            <CardTitle className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
              <User className="w-4 h-4" /> Colaborador Responsável
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-[10px] uppercase text-muted-foreground">Nome da Pessoa</Label>
              <p className="text-sm font-bold">{seller.contributor.name}</p>
            </div>
            <div>
              <Label className="text-[10px] uppercase text-muted-foreground">Usuário de Acesso</Label>
              <p className="text-sm font-medium">@{seller.contributor.username}</p>
            </div>
            <div>
              <Label className="text-[10px] uppercase text-muted-foreground">TAG (Inalterável)</Label>
              <p className="text-sm font-black text-orange-600">{seller.tag}</p>
            </div>
            
            <Button variant="outline" size="sm" className="w-full gap-2 mt-4" asChild>
              <Link href={`/erp/colaboradores/${seller.contributorId}/editar`}>
                <Edit className="w-3 h-3" /> EDITAR PESSOA
                <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Coluna da Direita: Formulário de Edição do Vendedor */}
        <div className="md:col-span-2">
          <SellerUpdateForm seller={seller} cells={cells} />
        </div>
      </div>
    </EditPageContents>
  );
}