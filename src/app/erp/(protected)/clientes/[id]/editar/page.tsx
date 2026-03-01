import { CustomersByIdAction } from "@/actions/customers/find-by-id.action";
import { CustomerFormEdit } from '@/components/erp/edit-forms/customer-edit';
import { EditPageContents } from "@/components/erp/shared/edit-page/edit-page-contents";
import { notFound } from "next/navigation";


export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
    const {success, data} = await CustomersByIdAction(id);
  
    if (!success || !data) {
      return notFound();
    }

  return (
    <EditPageContents 
      module="Módulo Comercial"
      page="Clientes"
      tag="CLI"
      id={id}
    >
      <CustomerFormEdit customer={data} />
    </EditPageContents>
  );
}