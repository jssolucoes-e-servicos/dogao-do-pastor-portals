// src/app/(public)/comprar/page.tsx
import { OrderOnlineInitialStep } from '@/components/orders-online/initial';
import NoSSRWrapper from '@/components/public/no-ssr-wrapper';
import { Fragment } from 'react';

export const dynamic = 'force-dynamic';

interface PreVendaProps {
  searchParams: Promise<{ v?: string }>;
}

export default async function PreVenda({ searchParams }: PreVendaProps) {
  const params = await searchParams;
  const sellerSlug = params.v || 'dogao';

  return (
    <Fragment>
      {/* O NoSSRWrapper garante que o OrderOnlineInitialStep 
          SÓ seja renderizado no navegador, eliminando o erro #418.
      */}
      <NoSSRWrapper s>
        <OrderOnlineInitialStep sellerTag={sellerSlug} />
      </NoSSRWrapper>
    </Fragment>
  );
}