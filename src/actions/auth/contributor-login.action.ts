// src/actions/auth/contributor-login.action.ts
"use server";

import { IResponse } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface AuthContributorLoginActionProps {
  username: string;
  password: string;
}

export const AuthContributorLoginAction = async (values: AuthContributorLoginActionProps):
  Promise<IResponse> => {
  try {
    const data = await fetchApi(FetchCtx.PUBLIC, `/auth/contributor/login`, {
      method: 'POST',
      body: JSON.stringify({
        username: values.username,
        password: values.password,
      }),
    });

    if (!data.access_token) {
      return { success: false, error: "Credenciais inválidas ou token não recebido." };
    }

    const cookieStore = await cookies();

    // Salva o Token
    cookieStore.set("ddp-ctb-00", data.access_token, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      httpOnly: true,
      secure: false, // Força false para garantir funcionamento em localhost
      sameSite: "lax"
    });

    // Salva o Usuário (Apenas dados essenciais para não estourar 4KB)
    const sessionUser = {
      id: data.user.id,
      name: data.user.name,
      roles: data.user.roles || [],
      sellerId: data.user.sellers?.[0]?.id || null,
      deliveryPersonId: data.user.deliveryPersons?.[0]?.id || null,
      leaderCellId: data.user.cells?.[0]?.id || null,
      supervisorNetworkId: data.user.cellNetworks?.[0]?.id || null,
    };

    cookieStore.set("ddp-ctb-01", JSON.stringify(sessionUser), {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: false,
      secure: false, // Força false para garantir funcionamento em localhost
      sameSite: "lax"
    });

    return { success: true };
  } catch (error: unknown) {
    console.error("Erro no login do colaborador:", error);
    const errorMessage = error instanceof Error
      ? error.message
      : "Falha ao listar parceiros";
    return {
      success: false,
      error: errorMessage
    }
  }
};

export const AuthContributorLogoutAction = async () => {
  const cookieStore = await cookies();
  cookieStore.delete("ddp-ctb-00");
  cookieStore.delete("ddp-ctb-01");
  redirect("/erp/acesso");
};