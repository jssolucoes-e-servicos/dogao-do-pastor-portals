"use server";

import { fetchApi, FetchCtx } from "@/lib/api";
import Cookies from "js-cookie";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface AuthPartnerLoginActionProps {
  username: string;
  password: string;
}

export const AuthPartnerLoginAction = async (values: AuthPartnerLoginActionProps): Promise<boolean> => {
  try {
    const data = await fetchApi(FetchCtx.CUSTOMER, `/auth/partners/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: values.username, 
        password: values.password,
      }),
    });
    Cookies.set("ddp-prt-00", data.access_token, { expires: 1 }) // Expira em 1 dia
    Cookies.set("ddp-prt-01", JSON.stringify(data.user) , { expires: 1 }) // Expira em 1 dia
    return true;
  } catch (error: any) {
    if (error.message === 'NEXT_REDIRECT') throw error;
    throw new Error('Falha ao processar seu acesso.');
  }
};

export const AuthPartnerLogoutAction = async () => {
  const cookieStore = await cookies();
  cookieStore.delete("ddp-prt-00");
  cookieStore.delete("ddp-prt-01");
  redirect("/portal-parceiro/acesso");
};