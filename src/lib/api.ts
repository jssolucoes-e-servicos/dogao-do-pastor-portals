import { FetchCtx } from "@/common/enums";
import Cookies from "js-cookie";

const getCookiePrefix = (ctx: FetchCtx): string => {
  const data: Partial<Record<FetchCtx, string>> = {
    [FetchCtx.CUSTOMER]: 'ddp-ctm-00',
    [FetchCtx.PARTNER]: 'ddp-prt-00',
    [FetchCtx.ERP]: 'ddp-ctb-00',
    [FetchCtx.PUBLIC]: 'error',
  };
  return data[ctx]!;
}

const getLoginRoute = (ctx: FetchCtx): string => {
  const data: Partial<Record<FetchCtx, string>> = {
    [FetchCtx.CUSTOMER]: '/portal-cliente/acesso',
    [FetchCtx.PARTNER]: '/portal-parceiro/acesso',
    [FetchCtx.ERP]: '/erp/acesso',
    [FetchCtx.PUBLIC]: '',
  };
  return data[ctx]!;
}

/**
 * Utilitário para chamadas à API com contexto obrigatório.
 */
async function fetchApi(
  ctx: FetchCtx, 
  endpoint: string, 
  options: RequestInit = {}
) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/v1';
  const isServer = typeof window === "undefined";
  const cookiePrefix = getCookiePrefix(ctx);
  const loginRoute = getLoginRoute(ctx);
  let token: string | undefined = "";

  // 1. RECUPERAÇÃO DO TOKEN (Safe Server/Client)
  if (isServer) {
    // Importação dinâmica para evitar que o Webpack tente levar next/headers para o browser
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    token = cookieStore.get(cookiePrefix)?.value;
  } else {
    token = Cookies.get(cookiePrefix);
  }

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 204) return null;

    const data = await response.json();

    if (!response.ok) {
      // 4. LÓGICA DE EXPIRAÇÃO (Apenas Cliente)
      if (response.status === 401 && !isServer) {
        Cookies.remove(cookiePrefix);
        Cookies.remove(ctx === FetchCtx.PARTNER ? 'ddp-prt-01' : 'ddp-ctm-01');
        window.location.href = loginRoute;
      }

      const errorMessage = data.message || "Ocorreu um erro na requisição";
      throw new Error(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
    }

    return data;
  } catch (error: any) {
    if (error.message === 'NEXT_REDIRECT') throw error;
    throw error;
  }
}

export { fetchApi, FetchCtx };
