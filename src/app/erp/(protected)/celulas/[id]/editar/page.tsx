// src/app/erp/(protected)/celulas/[id]/editar/page.tsx
import { CellsByIdAction } from "@/actions/cells/find-by-id.action";
import { CellFormEdit } from "@/components/erp/edit-forms/cell-edit";
import { EditPageContents } from "@/components/erp/shared/edit-page-contents";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCellPage({ params }: Props) {
  const { id } = await params;
  const {success, data} = await CellsByIdAction(id);

  if (!success || !data) {
    return notFound();
  }
  

  return (
    <EditPageContents 
      module="Módulo de Ministerial"
      page="Células"
      tag="CEL"
      id={id}
    >
      <CellFormEdit cell={data} />
    </EditPageContents>
  );
}