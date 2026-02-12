import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const tag = searchParams.get('tag');

  console.log({ 
    recebido: secret, 
    esperado: process.env.REVALIDATION_SECRET,
    iguais: secret === process.env.REVALIDATION_SECRET 
  });

  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ message: 'Token de segurança inválido' }, { status: 401 });
  }

  if (!tag) {
    return NextResponse.json({ message: 'A tag é obrigatória' }, { status: 400 });
  }

  try {
    /**
     * No Next.js 15, se o seu @types exige o segundo argumento 'profile',
     * usamos 'default' ou 'layout' para manter o comportamento padrão.
     * Caso sua config de cache seja a padrão, passar o segundo argumento
     * como string vazia ou o perfil 'default' resolve o erro do compilador.
     */
    // @ts-ignore - Caso o compilador ainda insista em perfis experimentais que você não ativou
    revalidateTag(tag);

    // Se preferir não usar o ignore, tente a assinatura que o seu TS pede:
    // revalidateTag(tag, 'default');

    return NextResponse.json({ 
      revalidated: true, 
      tag,
      now: new Date().toISOString() 
    });
  } catch (err: any) {
    return NextResponse.json({ message: 'Erro ao revalidar', error: err.message }, { status: 500 });
  }
}