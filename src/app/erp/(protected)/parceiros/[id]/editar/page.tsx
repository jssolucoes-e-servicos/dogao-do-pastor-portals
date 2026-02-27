// src/app/erp/(protected)/partners/[id]/editar/page.tsx
import { PartnerByIdAction } from "@/actions/partners/get-by-id.action";
import { PartnerFormEdit } from "@/components/erp/edit-forms/partner-edit";
import { EditPageContents } from "@/components/erp/shared/edit-page-contents";
import { notFound } from "next/navigation";

interface EditPartnerPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPartnerPage({ params }: EditPartnerPageProps) {
  const { id } = await params;

  const { success, data } = await PartnerByIdAction(id);

  if (!success || !data) {
    return notFound();
  }

  return (
    <EditPageContents
      module="Módulo Social"
      page="Parceiros"
      tag="PRT"
      id={id}
    >
      <PartnerFormEdit partner={data}/>
    </EditPageContents>
  );
}