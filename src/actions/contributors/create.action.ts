"use server";
import { fetchApi, FetchCtx } from "@/lib/api";

export async function CreateContributorAction(data: {
  name: string;
  username: string;
  phone: string;
  roleId?: string;
}) {
  try {
    const contributor = await fetchApi(FetchCtx.ERP, '/contributors', {
      method: 'POST',
      body: JSON.stringify({ name: data.name, username: data.username, phone: data.phone }),
    });
    // Vincular role se fornecida
    if (data.roleId && contributor?.id) {
      await fetchApi(FetchCtx.ERP, `/contributors/${contributor.id}/roles/${data.roleId}`, {
        method: 'POST',
      });
    }
    return { success: true, data: contributor };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
