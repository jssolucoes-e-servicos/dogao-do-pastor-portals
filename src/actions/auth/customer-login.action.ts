"use server";

import { IResponse } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";
import Cookies from "js-cookie";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface AuthCustomerLoginActionProps {
  username: string;
  password: string;
}

export const AuthCustomerLoginAction = async (values: AuthCustomerLoginActionProps): Promise<IResponse> => {
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

    if (!data.access_token) {
      return { success: false, error: "Credenciais inválidas ou token não recebido."};
    }

    const cookieStore = await cookies();
    // Salva o Token
    cookieStore.set("ddp-ctm-00", data.access_token, { 
        path: "/",
        maxAge: 60 * 60 * 24, // 1 dia
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
    });

    // Salva o Usuário
    cookieStore.set("ddp-ctm-01", JSON.stringify(data.user), { 
        path: "/",
        maxAge: 60 * 60 * 24,
        httpOnly: false, // Permitir leitura no client para UI
        secure: process.env.NODE_ENV === "production"
    });

    return { success: true };
  } catch (error: any) {
   console.error("Erro no login do colaborador:", error);
    const errorMessage = error.message || 'Falha ao processar seu acesso.';
    return {
      success: false,
      error: errorMessage
    }
  }
};

export const AuthCustomerLogoutAction = async () => {
  const cookieStore = await cookies();
  cookieStore.delete("ddp-ctm-00");
  cookieStore.delete("ddp-ctm-01");
  redirect("/portal-cliente/acesso");
};