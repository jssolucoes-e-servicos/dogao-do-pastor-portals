import { NextRequest, NextResponse } from 'next/server';

// 1. Definição das Configurações de Acesso
const PORTALS = {
  PARTNER: {
    base: '/portal-parceiro',
    auth: '/portal-parceiro/acesso',
    cookies: ['ddp-prt-00', 'ddp-prt-01'],
  },
  CUSTOMER: {
    base: '/portal-cliente',
    auth: '/portal-cliente/acesso',
    cookies: ['ddp-ctm-00', 'ddp-ctm-01'],
  },
} as const;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Itera sobre os portais para validar acesso
  for (const [key, portal] of Object.entries(PORTALS)) {
    if (pathname.startsWith(portal.base)) {
      const isLoginPage = pathname === portal.auth;
      const hasAuth = portal.cookies.every(c => request.cookies.has(c));

      // Se logado e tentando acessar login -> Redireciona para Home do Portal
      if (isLoginPage && hasAuth) {
        return NextResponse.redirect(new URL(portal.base, request.url));
      }

      // Se não logado e tentando acessar área restrita -> Redireciona para Login
      if (!isLoginPage && !hasAuth) {
        const response = NextResponse.redirect(new URL(portal.auth, request.url));
        // Limpeza de cookies órfãos
        portal.cookies.forEach(c => response.cookies.delete(c));
        return response;
      }
    }
  }

  return NextResponse.next();
}

// No Next 16, manter o matcher limpo é fundamental para o Turbopack não processar rotas desnecessárias
export const config = {
  matcher: [
    '/portal-parceiro/:path*',
    '/portal-cliente/:path*',
  ],
};