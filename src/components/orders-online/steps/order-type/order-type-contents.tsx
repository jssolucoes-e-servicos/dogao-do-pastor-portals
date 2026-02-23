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
import { Button } from "@/components/ui/button";
import { getDistanceBetween } from "@/lib/get-distance-between";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from 'swr';
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
  
  // Entrega
  const [addressData, setAddressData] = useState<Partial<CustomerAddressEntity>>({});
  const [addressSelectedId, setAddressSelectedId] = useState<string | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(!addresses || addresses.length === 0);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  
  // Doação
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>('IVC_INTERNAL');
  const [suggestionText, setSuggestionText] = useState<string | undefined>(undefined);

  // Busca parceiros usando SWR para cache e revalidação automática
  const { data: partnersResponse, isLoading: isLoadingPartners } = useSWR(
    'partners-for-orders',
    () => ListPartnersForOrdersAction(),
    {
      revalidateOnFocus: false, // Evita disparar busca apenas ao trocar de aba, mas mantém cache
      dedupingInterval: 60000, // Considera o cache "fresco" por 1 minuto
    }
  );

  const partners = partnersResponse?.data || [];

  // Modal de Limite
  const [showLimitModal, setShowLimitModal] = useState(false);

  // Função para lidar com a seleção do parceiro ou sugestão
  const handlePartnerSelect = (id: string, suggestion?: string) => {
    setSelectedPartnerId(id);
    setSuggestionText(suggestion); 
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
        
        // Passamos o ID do parceiro e o texto da sugestão (que vai para as observações)
        await SetOrderDonateAction(order.id, selectedPartnerId, suggestionText);
        
        router.push(`/comprar/${order.id}/pagamento`);
      } 
      
      else if (deliveryOption === DeliveryOptionEnum.DELIVERY) {
        let finalAddressId = addressSelectedId;

        if (showNewAddressForm || !finalAddressId) {
          if (!addressData.street || !addressData.number) throw new Error("Preencha o endereço completo.");
          const response = await createAddressAction({ ...addressData, customerId: order.customerId });
          finalAddressId = response.data ? response.data.id : addressSelectedId;
          setAddressSelectedId(finalAddressId);
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
    } finally {
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
    } finally {
      setIsLoadingAction(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 rounded-lg bg-white shadow-lg w-full">
      <OrderTypeSelectContent 
        orderId={order.id} 
        deliveryOption={deliveryOption} 
        setDeliveryOption={setDeliveryOption} 
      />

      {deliveryOption === DeliveryOptionEnum.PICKUP && <TypePickup />}
      
      {deliveryOption === DeliveryOptionEnum.DONATE && (
        <TypeDonate 
          onSelect={handlePartnerSelect} 
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
        <Button 
          onClick={handleFinalizeAndPay} 
          disabled={isLoadingAction || (deliveryOption === DeliveryOptionEnum.DONATE && isLoadingPartners)} 
          className="w-full bg-orange-600 hover:bg-orange-700 h-12 font-bold uppercase tracking-wide gap-2"
        >
          {isLoadingAction ? (
            'Processando...'
          ) : (
            'Ir para Pagamento'
          )}
        </Button>
      </div>
    </div>
  );
}