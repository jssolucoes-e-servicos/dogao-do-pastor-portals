import { EditionForm } from "@/components/erp/edit-forms/edition-edit";
import { EditPageContents } from "@/components/erp/shared/edit-page/edit-page-contents";

export default function NovaEdicaoPage() {
  return (
    <EditPageContents module="Configurações" page="Edições" tag="EDI" id="nova">
      <EditionForm />
    </EditPageContents>
  );
}
