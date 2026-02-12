// components/order-online/steps/order-type/order-type-contents.tsx
'use client';

import { createAddressAction } from '@/actions/customers-addresses/create-address.action';
import { SendToAnalysisAction } from '@/actions/orders/send-to-analysis.action';
import { SetOrderDeliveryAction } from '@/actions/orders/set-order-delivery.action';
import { SetOrderDonateAction } from '@/actions/orders/set-order-donate.action';
import { SetOrderPickupAction } from '@/actions/orders/set-order-pickup.action';
import { ListPartnersAction } from '@/actions/partners/list-partners.action';
import { Company } from '@/common/configs/company';
import { CustomerAddressEntity, OrderEntity, PartnerEntity } from "@/common/entities";
import { DeliveryOptionEnum } from '@/common/enums';
import { DeliveryDistanceLimitModal } from "@/components/modals/delivery-distance-limit-modal";
import { Button } from "@/components/ui/button";
import { getDistanceBetween } from "@/lib/get-distance-between";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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
  const [isLoading, setIsLoading] = useState(false);
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOptionEnum>(DeliveryOptionEnum.PICKUP);
  
  // Entrega
  const [addressData, setAddressData] = useState<Partial<CustomerAddressEntity>>({});
  const [addressSelectedId, setAddressSelectedId] = useState<string | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(!addresses || addresses.length === 0);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  
  // Doação
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>('IVC_INTERNAL');
  const [partners, setPartners] = useState<PartnerEntity[]>([]);

  // Modal de Limite
  const [showLimitModal, setShowLimitModal] = useState(false);

  // Busca parceiros ao montar o componente
  useEffect(() => {
    async function loadPartners() {
      try {
        const data = await ListPartnersAction();
        setPartners(data || []);
      } catch (error) {
        console.error("Erro ao carregar parceiros:", error);
      }
    }
    loadPartners();
  }, []);

  const handleFinalizeAndPay = async () => {
    setIsLoading(true);
    try {
      if (deliveryOption === DeliveryOptionEnum.PICKUP) {
        await SetOrderPickupAction(order.id);
        router.push(`/comprar/${order.id}/pagamento`);
      } 
      
      else if (deliveryOption === DeliveryOptionEnum.DONATE) {
        if (!selectedPartnerId) throw new Error("Selecione uma instituição.");
        await SetOrderDonateAction(order.id, selectedPartnerId);
        router.push(`/comprar/${order.id}/pagamento`);
      } 
      
      else if (deliveryOption === DeliveryOptionEnum.DELIVERY) {
        let finalAddressId = addressSelectedId;

        if (showNewAddressForm || !finalAddressId) {
          if (!addressData.street || !addressData.number) throw new Error("Preencha o endereço completo.");
          const newAddr = await createAddressAction({ ...addressData, customerId: order.customerId });
          finalAddressId = newAddr.id;
          setAddressSelectedId(newAddr.id);
        }

        const fullAddress = `${addressData.street}, ${addressData.number}, ${addressData.neighborhood}`;
        const distance = await getDistanceBetween(Company.address.lat, Company.address.lng, fullAddress);
        setDistanceKm(distance);

        if (distance && distance > 5) {
          setShowLimitModal(true);
          setIsLoading(false);
          return;
        }

        await SetOrderDeliveryAction(order.id, finalAddressId as string);
        router.push(`/comprar/${order.id}/pagamento`);
      }
    } catch (error: any) {
      toast.error(error.message || "Falha ao processar pedido.");
    } finally {
      setIsLoading(false);
    }
  };

  const onSendToReview = async () => {
    try {
      setIsLoading(true);
      if (!addressSelectedId || distanceKm === null) throw new Error("Dados incompletos.");
      await SendToAnalysisAction(order.id, addressSelectedId, distanceKm);
      router.push(`/comprar/${order.id}/analise`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 rounded-lg bg-white shadow-lg w-full">
      <OrderTypeSelectContent deliveryOption={deliveryOption} setDeliveryOption={setDeliveryOption} />

      {deliveryOption === DeliveryOptionEnum.PICKUP && <TypePickup />}
      
      {deliveryOption === DeliveryOptionEnum.DONATE && (
        <TypeDonate 
          onSelect={setSelectedPartnerId} 
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
          disabled={isLoading} 
          className="w-full bg-orange-600 hover:bg-orange-700 h-12 font-bold uppercase tracking-wide"
        >
          {isLoading ? 'Processando...' : 'Ir para Pagamento'}
        </Button>
      </div>
    </div>
  );
}