'use client';

import { CreateAddressAction } from '@/actions/customers-addresses/create-address.action';
import { SendToAnalysisAction } from '@/actions/orders/send-to-analysis.action';
import { SetOrderDeliveryAction } from '@/actions/orders/set-order-delivery.action';
import { SetOrderDonateAction } from '@/actions/orders/set-order-donate.action';
import { SetOrderPickupAction } from '@/actions/orders/set-order-pickup.action';
import { ListPartnersForOrdersAction } from '@/actions/partners/list-partners-for-orders.action';
import { Company } from '@/common/configs/company';
import { CustomerAddressEntity, OrderEntity } from "@/common/entities";
import { DeliveryOptionEnum } from '@/common/enums';
import { DeliveryDistanceLimitModal } from "@/components/modals/delivery-distance-limit-modal";
import { getDistanceBetween } from "@/lib/get-distance-between";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from 'swr';
import { OrderOnlineButtonAction } from '../../button-action';
import { OrderOnlineContentsBase } from '../../content-base';
import { OrderTypeSelectContent } from "./order-type-select-content";
import { TypeDelivery } from "./type-delivery";
import { TypeDonate } from "./type-donate";
import { TypePickup } from "./type-pickup";

interface Props {
  order: OrderEntity;
  addresses: CustomerAddressEntity[];
}

export function OrderTypeContents({ order, addresses = [] }: Props) {
  const router = useRouter();
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOptionEnum>(DeliveryOptionEnum.PICKUP);
  
  const [addressData, setAddressData] = useState<Partial<CustomerAddressEntity>>({});
  const [addressSelectedId, setAddressSelectedId] = useState<string | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(!addresses || addresses.length === 0);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [scheduledTime, setScheduledTime] = useState<string>('');
  
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>('IVC_INTERNAL');
  const [suggestionText, setSuggestionText] = useState<string | undefined>(undefined);

  const { data: partnersResponse } = useSWR(
    'partners-for-orders',
    () => ListPartnersForOrdersAction(),
    { revalidateOnFocus: false }
  );

  const partners = partnersResponse?.data || [];
  const [showLimitModal, setShowLimitModal] = useState(false);

  const handleFinalizeAndPay = async () => {
    setIsLoadingAction(true);
    try {
      if (deliveryOption === DeliveryOptionEnum.PICKUP) {
        await SetOrderPickupAction(order.id);
        router.push(`/comprar/${order.id}/pagamento`);
      } 
      else if (deliveryOption === DeliveryOptionEnum.DONATE) {
        if (!selectedPartnerId) throw new Error("Selecione uma instituição.");
        await SetOrderDonateAction(order.id, selectedPartnerId, suggestionText);
        router.push(`/comprar/${order.id}/pagamento`);
      } 
      else if (deliveryOption === DeliveryOptionEnum.DELIVERY) {
        let finalAddressId = addressSelectedId;

        if (showNewAddressForm || !finalAddressId) {
          if (!addressData.street || !addressData.number || !addressData.zipCode) {
            throw new Error("Endereço incompleto.");
          }

          const response = await CreateAddressAction({
            customerId: order.customerId,
            street: addressData.street,
            number: addressData.number,
            neighborhood: addressData.neighborhood!,
            city: addressData.city!,
            state: addressData.state!,
            zipCode: addressData.zipCode,
            complement: addressData.complement,
          });

          if (!response.success) throw new Error(response.error);
          finalAddressId = response.data?.id || null;
        }

        const fullAddress = `${addressData.street}, ${addressData.number}, ${addressData.neighborhood}, ${addressData.city}, ${addressData.zipCode}`;
        const distance = await getDistanceBetween(Company.address.lat, Company.address.lng, fullAddress);
        
        setDistanceKm(distance);
        setAddressSelectedId(finalAddressId);

        if (distance && distance > 5) {
          setShowLimitModal(true);
          setIsLoadingAction(false);
          return;
        }

        if (!finalAddressId) throw new Error("Erro ao processar endereço.");

        // Validação de 30 minutos conforme regra de negócio
        if (scheduledTime) {
          const [hours, minutes] = scheduledTime.split(':').map(Number);
          const now = new Date();
          const scheduledDate = new Date(now);
          scheduledDate.setHours(hours, minutes, 0, 0);

          // Se o horário escolhido já passou hoje (ex: escolheu 10:00 e agora são 22:00), 
          // assume-se que é para o dia seguinte ou está inválido.
          // No contexto deste app (edição de um dia), deve ser hoje.
          const minDate = new Date(now.getTime() + 30 * 60 * 1000);
          
          if (scheduledDate < minDate) {
            throw new Error("O horário de entrega deve ser de pelo menos 30 minutos a partir de agora.");
          }
        } else {
          throw new Error("Por favor, selecione um horário para a entrega.");
        }

        await SetOrderDeliveryAction(order.id, finalAddressId, scheduledTime);
        router.push(`/comprar/${order.id}/pagamento`);
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao processar.");
      setIsLoadingAction(false);
    }
  };

  return (
    <OrderOnlineContentsBase title='Tipo de pedido' subtitle='Selecione uma opção.' orderId={order.id}>
      <OrderTypeSelectContent deliveryOption={deliveryOption} setDeliveryOption={setDeliveryOption} />

      {deliveryOption === DeliveryOptionEnum.PICKUP && <TypePickup />}
      
      {deliveryOption === DeliveryOptionEnum.DONATE && (
        <TypeDonate 
          onSelect={(id, sug) => { setSelectedPartnerId(id); setSuggestionText(sug); }} 
          onDirectSubmit={async (id, sug) => {
            setIsLoadingAction(true);
            await SetOrderDonateAction(order.id, id, sug);
            router.push(`/comprar/${order.id}/pagamento`);
          }}
          selectedId={selectedPartnerId} 
          partners={partners}
        />
      )}

      {deliveryOption === DeliveryOptionEnum.DELIVERY && (
        <TypeDelivery
          addressesList={addresses}
          addressData={addressData}
          setAddressData={setAddressData}
          showNewAddressForm={showNewAddressForm}
          setShowNewAddressForm={setShowNewAddressForm}
          setAddressSelectedId={setAddressSelectedId}
          scheduledTime={scheduledTime}
          setScheduledTime={setScheduledTime}
        />
      )}

      <DeliveryDistanceLimitModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        onPickupSelect={() => { setDeliveryOption(DeliveryOptionEnum.PICKUP); setShowLimitModal(false); }}
        onSendToReview={async () => {
          setIsLoadingAction(true);
          await SendToAnalysisAction(order.id, addressSelectedId!, distanceKm!);
          router.push(`/comprar/${order.id}/analise`);
        }}
        distanceKm={distanceKm || 0}
        churchName={Company.name}
        churchAddress={Company.address.inLine}
      />

      <div className="flex justify-center mt-6">
        <OrderOnlineButtonAction
          title='Ir para pagamento'
          isLoading={isLoadingAction}
          handleAction={handleFinalizeAndPay}
        />
      </div>
    </OrderOnlineContentsBase>
  );
}