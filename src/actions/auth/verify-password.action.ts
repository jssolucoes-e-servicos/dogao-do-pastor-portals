"use server"

import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";
import { cookies } from "next/headers";

export async function VerifyPasswordAction(password: string): Promise<IResponseObject<boolean>> {
  try {
    const cookieStore = await cookies();
    let user: { username?: string } | null = null;
    try {
      const raw = cookieStore.get("ddp-ctb-01")?.value;
      if (raw) user = JSON.parse(decodeURIComponent(raw));
    } catch { /* ignore */ }

    if (!user?.username) return { success: false, error: "Usuário não identificado" };

    await fetchApi(FetchCtx.PUBLIC, `/auth/contributor/login`, {
      method: 'POST',
      body: JSON.stringify({ username: user.username, password }),
    });

    return { success: true, data: true };
  } catch {
    return { success: false, error: "Senha incorreta" };
  }
}
