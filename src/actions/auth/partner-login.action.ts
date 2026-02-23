// arc/actions/auth/partner-login.action.ts
"use server";

import { IResponse } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface AuthPartnerLoginActionProps {
  username: string;
  password: string;
}

export const AuthPartnerLoginAction = async (values: AuthPartnerLoginActionProps): 
Promise<IResponse> => {
  try {
    const data = await fetchApi(FetchCtx.PUBLIC, `/auth/partners/login`, {
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
    cookieStore.set("ddp-prt-00", data.access_token, { 
        path: "/",
        maxAge: 60 * 60 * 24, // 1 dia
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
    });

    // Salva o Usuário
    cookieStore.set("ddp-prt-01", JSON.stringify(data.user), { 
        path: "/",
        maxAge: 60 * 60 * 24,
        httpOnly: false, // Permitir leitura no client para UI
        secure: process.env.NODE_ENV === "production"
    });

    return { success: true };
  } catch (error) {
    console.error("Erro no login do parceiro:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Falha ao processar seu acesso.'
    }
  }
};

export const AuthPartnerLogoutAction = async () => {
  const cookieStore = await cookies();
  cookieStore.delete("ddp-prt-00");
  cookieStore.delete("ddp-prt-01");
  redirect("/portal-parceiro/acesso");
};