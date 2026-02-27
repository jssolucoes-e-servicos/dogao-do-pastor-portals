// src/app/erp/(protected)/redes-de-celulas/[id]/editar/page.tsx

import { CellsNetworksByIdAction } from "@/actions/cells-networks/find-by-id.action";
import { CellNetworkFormEdit } from "@/components/erp/edit-forms/cell-network-edit";
import { EditPageContents } from "@/components/erp/shared/edit-page-contents";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCellNetworkPage({ params }: Props) {
  const { id } = await params;
    const {success, data} = await CellsNetworksByIdAction(id);
  
    if (!success || !data) {
      return notFound();
    }

  return (
      <EditPageContents 
          module="Módulo de Ministerial"
          page="Redes de Células"
          tag="RDC"
          id={id}
      >
        <CellNetworkFormEdit network={data} />
    </EditPageContents>
  );
}