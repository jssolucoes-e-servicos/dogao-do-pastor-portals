import { NextRequest, NextResponse } from 'next/server';

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
  CONTRIBUTOR: {
    base: '/erp',
    auth: '/erp/acesso',
    cookies: ['ddp-ctb-00', 'ddp-ctb-01'],
  },
} as const;

/** Verifica se o JWT (sem verificar assinatura) está expirado */
function isJwtExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (!payload.exp) return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  for (const [key, portal] of Object.entries(PORTALS)) {
    if (pathname.startsWith(portal.base)) {
      const isLoginPage = pathname === portal.auth;

      // Verifica se os cookies existem
      const cookiesExist = portal.cookies.every(c => request.cookies.has(c));

      // Para o ERP, verifica também se o JWT não expirou
      let tokenExpired = false;
      if (cookiesExist && key === 'CONTRIBUTOR') {
        const jwtToken = request.cookies.get('ddp-ctb-00')?.value;
        if (jwtToken) tokenExpired = isJwtExpired(jwtToken);
      }

      const hasAuth = cookiesExist && !tokenExpired;

      // 1. Já logado tentando acessar login → redireciona para base
      if (isLoginPage && hasAuth) {
        const callbackUrl = searchParams.get('callbackUrl') || portal.base;
        return NextResponse.redirect(new URL(callbackUrl, request.url));
      }

      // 2. Sem auth ou token expirado → redireciona para login
      if (!isLoginPage && !hasAuth) {
        const fullPath = pathname + (request.nextUrl.search || '');
        const callbackUrl = encodeURIComponent(fullPath);
        const loginUrl = new URL(`${portal.auth}?callbackUrl=${callbackUrl}`, request.url);
        const response = NextResponse.redirect(loginUrl);
        // Limpa cookies expirados/inválidos
        portal.cookies.forEach(c => response.cookies.delete(c));
        return response;
      }

      // 3. Autenticado → renova os cookies (sliding session)
      if (hasAuth) {
        const response = NextResponse.next();
        portal.cookies.forEach(c => {
          const cookie = request.cookies.get(c);
          if (cookie) {
            response.cookies.set(c, cookie.value, {
              path: '/',
              maxAge: 60 * 60 * 24 * 7,
              httpOnly: c === 'ddp-ctb-00' || c === 'ddp-prt-00' || c === 'ddp-ctm-00',
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
            });
          }
        });
        return response;
      }
    }
  }

  return NextResponse.next();
}