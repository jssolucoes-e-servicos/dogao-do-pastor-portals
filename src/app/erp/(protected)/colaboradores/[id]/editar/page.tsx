// src/app/erp/(protected)/partners/[id]/editar/page.tsx

import { ContributorsByIdAction } from "@/actions/contributors/find-by-id.action";
import { ContributorFormEdit } from "@/components/erp/edit-forms/contributors-edit";
import { EditPageContents } from "@/components/erp/shared/edit-page-contents";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditContributorPage({ params }: Props) {
  const { id } = await params;
  const {success, data} = await ContributorsByIdAction(id);

  if (!success || !data) {
    return notFound();
  }

  return (
    <EditPageContents
        module="Módulo Administrativo"
        page="Colaboradores"
        tag="CTB"
        id={id}
      >
      <ContributorFormEdit contributor={data} />
    </EditPageContents>
  );
}