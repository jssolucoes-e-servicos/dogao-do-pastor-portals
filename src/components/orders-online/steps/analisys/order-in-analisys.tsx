import { OrderEntity } from "@/common/entities";
import { DeliveryOptionEnum } from "@/common/enums";
import { Fragment } from "react";

interface OrderInAnalisysProps {
  order: OrderEntity;
}

export async function OrderInAnalisys({ order }: OrderInAnalisysProps) {
  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <Fragment>
      <div className="flex flex-col gap-6 p-4 rounded-lg bg-white shadow-lg w-full">
        <h1 className="text-3xl font-bold text-center mb-6">Seu pedido esta em análise</h1>
        <div className="bg-gray-100 p-4 rounded-md space-y-4">
          <p className="text-lg">
            <span className="font-semibold">Cliente:</span> {order.customerName || 'Cliente'}
          </p>
          <p className="text-lg">
            <span className="font-semibold">Quantidade:</span> {order.items?.length}
          </p>
          <p className="text-lg">
            <span className="font-semibold">Total:</span> {formatCurrency(order.totalValue)}
          </p>
          <p className="text-lg">
            <span className="font-semibold">Opção de entrega:</span> 
            {order.deliveryOption === DeliveryOptionEnum.DELIVERY && ' Entrega'}
          </p>
        </div>
      </div>
    </Fragment>
  );
}
