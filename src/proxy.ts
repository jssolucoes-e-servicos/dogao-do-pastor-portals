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

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  for (const [key, portal] of Object.entries(PORTALS)) {
    if (pathname.startsWith(portal.base)) {
      const isLoginPage = pathname === portal.auth;
      // Valida se TODOS os cookies necessários existem
      const hasAuth = portal.cookies.every(c => request.cookies.has(c));

      // 1. Redirecionamento Inteligente após Login
      if (isLoginPage && hasAuth) {
        const callbackUrl = searchParams.get('callbackUrl') || portal.base;
        return NextResponse.redirect(new URL(callbackUrl, request.url));
      }

      // 2. Bloqueio com CallbackUrl (Preserva o link que o usuário tentou acessar)
      if (!isLoginPage && !hasAuth) {
        // Pega o path + as query strings (ex: /erp/vendedores/123?tab=performance)
        const fullPath = pathname + (request.nextUrl.search || '');
        const callbackUrl = encodeURIComponent(fullPath);
        
        const loginUrl = new URL(`${portal.auth}?callbackUrl=${callbackUrl}`, request.url);
        const response = NextResponse.redirect(loginUrl);
        
        // Limpa cookies órfãos para evitar estados inconsistentes
        portal.cookies.forEach(c => response.cookies.delete(c));
        return response;
      }

      // 3. Sliding Session: Renovação Ativa
      if (hasAuth) {
        const response = NextResponse.next();
        
        // Renovamos TODOS os cookies do portal atual para garantir sincronia
        portal.cookies.forEach(c => {
          const cookie = request.cookies.get(c);
          if (cookie) {
            response.cookies.set(c, cookie.value, {
              path: '/',
              maxAge: 60 * 60 * 24 * 7, // 7 dias de vida extra a cada clique
              httpOnly: true,
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