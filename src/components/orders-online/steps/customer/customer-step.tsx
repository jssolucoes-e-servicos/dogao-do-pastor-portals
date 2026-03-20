"use client"
import { UpdateCustomerInOrderAction } from "@/actions/customers/update-in-orders.action";
import { OrderUpStepAction } from "@/actions/orders/up-step.action";
import { UpdateOrderCustomerAction } from "@/actions/orders/update-order-customer.action";
import { OrderEntity } from "@/common/entities";
import { ICustomerOrderPayload } from "@/common/interfaces";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PencilIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import { toast } from "sonner";
import { OrderOnlineButtonAction } from "../../button-action";
import { OrderOnlineContentsBase } from "../../content-base";

export function OrderOnlineCustomerStep({ order }: { order: OrderEntity }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFormEditable, setIsFormEditable] = useState<boolean>(false);
  const [customerFormData, setCustomerFormData] = useState<ICustomerOrderPayload>({
    name: '',
    email: '',
    phone: '',
    cpf: order.customerCPF,
    knowsChurch: true,
    allowsChurch: true
  });

  useEffect(() => {
    const isPlaceholder = order.customer.name?.includes("CLIENTE -");
    const isNewCustomer = order.customer.firstRegister === true || isPlaceholder;

    if (!isNewCustomer) {
      setCustomerFormData(prev => ({
        ...prev,
        name: order.customer.name,
        email: order.customer.email || '',
        phone: order.customer.phone || '',
        cpf: order.customerCPF,
        knowsChurch: order.customer.knowsChurch,
        allowsChurch: order.customer.allowsChurch,
      }));
      setIsFormEditable(false);
    } else {
      setIsFormEditable(true);
      // Só limpa se o estado atual estiver vazio ou com placeholder, para não apagar o que o usuário digita
      setCustomerFormData(prev => {
        const isCurrentNamePlaceholder = prev.name.includes("CLIENTE -");
        if (prev.name === '' || isCurrentNamePlaceholder) {
           return { ...prev, name: '', phone: prev.phone || '' };
        }
        return prev;
      });
    }
  }, [order.id, order.customer.id]); 

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: keyof ICustomerOrderPayload, checked: boolean) => {
    setCustomerFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleProcessEntry = async () => {
    setIsLoading(true);
    try {
      //validação dos campos obrigatórios
      const name = customerFormData.name?.trim() || '';
      const phone = customerFormData.phone?.trim() || '';
      
      const missingFields = [];
      if (!name || name === "" || name.includes("CLIENTE -")) missingFields.push('Nome');
      if (!phone || phone.length !== 11) missingFields.push('WhatsApp (11 dígitos)');

      if (missingFields.length > 0) {
        throw new Error(`Por favor, preencha corretamente os campos: ${missingFields.join(', ')}.`);
      }
      
      //atualiza os dados do cliente pelo preenchido no formulário do pedido
      const resUpdateCustomer = await UpdateCustomerInOrderAction(order.customer, {
        ...customerFormData,
        name,
        phone
      });
      if (!resUpdateCustomer.success) throw new Error(resUpdateCustomer.error || "Falha ao atualizar dados do cliente.");

      // sincroniza os dados do cliente no pedido com os digitados no formulário
      const resUpdateOrder = await UpdateOrderCustomerAction(order.id, {
        name,
        phone
      });
      if (!resUpdateOrder.success) throw new Error(resUpdateOrder.error || "Falha ao sincronizar dados com o pedido.");

      // avanca a etapa no pedido
      const resUpStep = await OrderUpStepAction(order);
      if (!resUpStep.success) throw new Error(resUpStep.error || "Falha ao avançar etapa.");

      router.push(`/comprar/${order.id}/tipo-pedido`)
      setIsLoading(false);
    } catch (err: any) {
      setIsLoading(false);
      console.clear();
      console.log(err);
      toast.error(err.message);
    }
  };


  const renderSummary = () => (
    <div className="p-4 rounded-md bg-gray-100 relative">
      <p className="text-lg font-bold">Olá, {order.customer.name}!</p>
      <p>Email: {order.customer.email || '-'}</p>
      <p>Whatsapp: {order.customer.phone || '-'}</p>
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-900"
        onClick={() => setIsFormEditable(true)}
        disabled={isLoading}
      >
        <PencilIcon className="h-4 w-4 mr-2" />
      </Button>
    </div>
  );

  const renderForm = () => (
    <div className="flex flex-col gap-4">
      <div>
        <Label className="mb-2" htmlFor="name">Nome Completo<span className="text-red-500">*</span></Label>
        <Input
          id="name"
          placeholder="Nome Completo"
          name="name"
          value={customerFormData.name}
          onChange={handleInputChange}
          disabled={isLoading}
        />
      </div>
      <div>
        <Label className="mb-2" htmlFor="email">Email</Label>
        <Input
          id="email"
          placeholder="Email"
          name="email"
          type="email"
          value={customerFormData.email}
          onChange={handleInputChange}
          disabled={isLoading}
        />
      </div>
      <div>
        <Label className="mb-2" htmlFor="phone">Whatsapp<span className="text-red-500">*</span> Ex: 51999999999</Label>
        <Input
          id="phone"
          placeholder="WhatsApp"
          name="phone"
          minLength={11}
          max={11}
          value={customerFormData.phone}
          onChange={handleInputChange}
          disabled={isLoading}
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="knows-church"
          checked={customerFormData.knowsChurch}
          onCheckedChange={(checked) => handleSwitchChange('knowsChurch', checked)}
          disabled={isLoading}
        />
        <Label htmlFor="knows-church">Conhece a IVC?</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="allows-church"
          checked={customerFormData.allowsChurch}
          onCheckedChange={(checked) => handleSwitchChange('allowsChurch', checked)}
          disabled={isLoading}
        />
        <Label htmlFor="allows-church">Aceito receber mensagens?</Label>
      </div>
    </div>
  );

  return (
    <Fragment>
      <OrderOnlineContentsBase
        title="Confirme seus dados"
        orderId={order.id}
        noBack={true}
      >
        {!isFormEditable && !order.customer.firstRegister ? renderSummary() : renderForm()}
        <OrderOnlineButtonAction
          title="Montar pedido"
          isLoading={isLoading}
          handleAction={handleProcessEntry}
        />
      </OrderOnlineContentsBase>
    </Fragment>
  );
}