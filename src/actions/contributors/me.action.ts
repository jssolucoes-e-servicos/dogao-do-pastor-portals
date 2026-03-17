"use server"

import { IResponseObject } from "@/common/interfaces";
import { fetchApi, FetchCtx } from "@/lib/api";

export async function GetMeAction(): Promise<IResponseObject<Record<string, unknown>>> {
  try {
    const res = await fetchApi(FetchCtx.ERP, `/contributors/me`, {
      cache: "no-store"
    });

    return {
      success: true,
      data: res
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Falha ao carregar dados do perfil",
    };
  }
}

export async function UpdateMeAction(dto: Record<string, unknown>): Promise<IResponseObject<Record<string, unknown>>> {
  try {
    const res = await fetchApi(FetchCtx.ERP, `/contributors/me`, {
      method: "PUT",
      body: JSON.stringify(dto),
      cache: "no-store"
    });

    return {
      success: true,
      data: res
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Falha ao atualizar perfil",
    };
  }
}
