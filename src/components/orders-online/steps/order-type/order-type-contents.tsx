// components/order-online/steps/order-type/order-type-contents.tsx
'use client';

import { createAddressAction } from '@/actions/customers-addresses/create-address.action';
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
  
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>('IVC_INTERNAL');
  const [suggestionText, setSuggestionText] = useState<string | undefined>(undefined);

  const { data: partnersResponse, isLoading: isLoadingPartners } = useSWR(
    'partners-for-orders',
    () => ListPartnersForOrdersAction(),
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  const partners = partnersResponse?.data || [];
  const [showLimitModal, setShowLimitModal] = useState(false);

  // Seleção padrão (sem fechamento de fluxo)
  const handlePartnerSelect = (id: string, suggestion?: string) => {
    setSelectedPartnerId(id);
    setSuggestionText(suggestion); 
  };

  // ENVIO DIRETO (Atalho usado pelo modal de sugestão)
  const handleDonateAndPayDirectly = async (id: string, suggestion?: string) => {
    setIsLoadingAction(true);
    try {
      await SetOrderDonateAction(order.id, id, suggestion);
      router.push(`/comprar/${order.id}/pagamento`);
    } catch (error: any) {
      toast.error(error.message || "Falha ao processar doação.");
      setIsLoadingAction(false);
    }
  };

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
          if (!addressData.street || !addressData.number) throw new Error("Preencha o endereço completo.");
          const response = await createAddressAction({ ...addressData, customerId: order.customerId });
          finalAddressId = response.data?.id || addressSelectedId;
        }
        const fullAddress = `${addressData.street}, ${addressData.number}, ${addressData.neighborhood}`;
        const distance = await getDistanceBetween(Company.address.lat, Company.address.lng, fullAddress);
        setDistanceKm(distance);

        if (distance && distance > 5) {
          setShowLimitModal(true);
          setIsLoadingAction(false);
          return;
        }
        await SetOrderDeliveryAction(order.id, finalAddressId as string);
        router.push(`/comprar/${order.id}/pagamento`);
      }
    } catch (error: any) {
      toast.error(error.message || "Falha ao processar pedido.");
      setIsLoadingAction(false);
    }
  };

  const onSendToReview = async () => {
    try {
      setIsLoadingAction(true);
      if (!addressSelectedId || distanceKm === null) throw new Error("Dados incompletos.");
      await SendToAnalysisAction(order.id, addressSelectedId, distanceKm);
      router.push(`/comprar/${order.id}/analise`);
    } catch (error: any) {
      toast.error(error.message);
      setIsLoadingAction(false);
    }
  };

  return (
    <OrderOnlineContentsBase
      title='Tipo de pedido'
      subtitle='Selecione uma opção para o seu pedido.'
      orderId={order.id}
    >

      <OrderTypeSelectContent 
        deliveryOption={deliveryOption} 
        setDeliveryOption={setDeliveryOption} 
      />

      {deliveryOption === DeliveryOptionEnum.PICKUP && <TypePickup />}
      
      {deliveryOption === DeliveryOptionEnum.DONATE && (
        <TypeDonate 
          onSelect={handlePartnerSelect} 
          onDirectSubmit={handleDonateAndPayDirectly}
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
        />
      )}

      <DeliveryDistanceLimitModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        onPickupSelect={() => { setDeliveryOption(DeliveryOptionEnum.PICKUP); setShowLimitModal(false); }}
        onSendToReview={onSendToReview}
        churchName={Company.name}
        churchAddress={Company.address.inLine}
        distanceKm={distanceKm || 0}
      />

      <div className="flex justify-center mt-6">
        {(deliveryOption === DeliveryOptionEnum.DONATE && isLoadingPartners) ? ('Aguarde, carregando dados...') :
          (<OrderOnlineButtonAction
          title='Ir para pagamento'
          isLoading={isLoadingAction}
          handleAction={handleFinalizeAndPay}
        />)
        }
      </div>
    </OrderOnlineContentsBase>
  );
}