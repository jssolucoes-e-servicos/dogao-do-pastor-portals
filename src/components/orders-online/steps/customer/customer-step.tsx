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
    if (!order.customer.firstRegister) {
      setCustomerFormData({
        name: order.customer.name,
        email: order.customer.email || '',
        phone: order.customer.phone || '',
        cpf: order.customerCPF,
        knowsChurch: order.customer.knowsChurch,
        allowsChurch: order.customer.allowsChurch,
      });
    } else {
      // Se não há dados, o formulário já está em modo de edição
      setIsFormEditable(true);
    }
  }, [order]);

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
      const missingFields = [];
      if (!customerFormData.name) missingFields.push('Nome');
      if (!customerFormData.phone || customerFormData.phone.length !== 11) missingFields.push('WhatsApp');

      if (missingFields.length > 0) {
        throw new Error(`Por favor, preencha os seguintes campos: ${missingFields.join(', ')}.`);
      }
      
      //atualiza os dados do cliente pelo preenchido no formulário do pedido
      await UpdateCustomerInOrderAction(order.customer, customerFormData);
      // sincroniza os dados do clente no pedido com os digitaods no formulário
      await UpdateOrderCustomerAction(order.id, {
        name: customerFormData.name,
        phone: customerFormData.phone
      });
      // avanca a etapa no pedido
      await OrderUpStepAction(order);

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
      <div className="flex flex-col gap-6 p-4 rounded-lg bg-white shadow-lg w-full">
        <h2 className="text-2xl font-bold text-center">Confirme seus dados</h2>

        {!isFormEditable && !order.customer.firstRegister ? renderSummary() : renderForm()}
        <Button onClick={handleProcessEntry} disabled={isLoading} className="w-full bg-orange-600 hover:bg-orange-700">
          {isLoading ? 'Salvando...' : 'Montar pedido'}
        </Button>
      </div>
    </Fragment>
  );
}