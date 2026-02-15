"use server";

import { fetchApi, FetchCtx } from "@/lib/api";
import Cookies from "js-cookie";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface AuthCustomerLoginActionProps {
  username: string;
  password: string;
}

export const AuthCustomerLoginAction = async (values: AuthCustomerLoginActionProps): Promise<boolean> => {
  try {
    const data = await fetchApi(FetchCtx.CUSTOMER, `/auth/customer/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: values.username, 
        password: values.password,
      }),
    });
    Cookies.set("ddp-ctm-00", data.access_token, { expires: 1 }) // Expira em 1 dia
    Cookies.set("ddp-ctm-01", JSON.stringify(data.user) , { expires: 1 }) // Expira em 1 dia
    return true;
  } catch (error: any) {
    if (error.message === 'NEXT_REDIRECT') throw error;
    throw new Error('Falha ao processar seu acesso.');
  }
};

export const AuthCustomerLogoutAction = async () => {
  const cookieStore = await cookies();
  cookieStore.delete("ddp-ctm-00");
  cookieStore.delete("ddp-ctm-01");
  redirect("/portal-cliente/acesso");
};