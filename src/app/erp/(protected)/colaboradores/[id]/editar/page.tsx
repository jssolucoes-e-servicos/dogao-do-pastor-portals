import { ContributorsByIdAction } from "@/actions/contributors/find-by-id.action";
import { RolesPaginateAction } from "@/actions/roles/paginate.action";
import { ContributorFormEdit } from "@/components/erp/edit-forms/contributors-edit";
import { EditPageContents } from "@/components/erp/shared/edit-page/edit-page-contents";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditContributorPage({ params }: Props) {
  const { id } = await params;
  const {success, data} = await ContributorsByIdAction(id);
  const {success: rolesSuccess, data: rolesData} = await RolesPaginateAction(1, "");

  if (!success || !data) {
    return notFound();
  }

  const allRoles = rolesData?.data || [];

  return (
    <EditPageContents
        module="Módulo Administrativo"
        page="Colaboradores"
        tag="CTB"
        id={id}
      >
      <ContributorFormEdit contributor={data} allRoles={allRoles} />
    </EditPageContents>
  );
}