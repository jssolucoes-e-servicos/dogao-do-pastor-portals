// pre-venda/page.tsx
import { OrderOnlineInitialStep } from '@/components/orders-online/initial';
export const dynamic = 'force-dynamic'
import { Fragment } from 'react';

interface PreVendaProps {
  searchParams: Promise<{ v?: string }>;
}

export default async function PreVenda({ searchParams }: PreVendaProps) {
  const params = await searchParams;
  const sellerSlug = params.v || 'dogao';

  return (
    <Fragment>
      <OrderOnlineInitialStep sellerTag={sellerSlug} />
    </Fragment>
  );
}
