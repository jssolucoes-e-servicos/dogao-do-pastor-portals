import { GetEditionByIdAction } from "@/actions/editions/get-edition-by-id.action";
import { EditionForm } from "@/components/erp/edit-forms/edition-edit";
import { EditPageContents } from "@/components/erp/shared/edit-page/edit-page-contents";
import { notFound } from "next/navigation";

export default async function EditarEdicaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { success, data } = await GetEditionByIdAction(id);

  if (!success || !data) return notFound();

  return (
    <EditPageContents module="Configurações" page="Edições" tag="EDI" id={id}>
      <EditionForm edition={data} />
    </EditPageContents>
  );
}
