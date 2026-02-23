"use client";

import { ChangePaymentMethodAction } from "@/actions/orders/change-payment-method.action";
import { GenerateOrderPixAction } from "@/actions/payments/generate-order-pix.action";
import { OrderEntity } from "@/common/entities";
import { NumbersHelper } from "@/common/helpers/numbers-helper";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { toast } from "sonner";

export function PaymentPix({ order }: { order: OrderEntity }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [textLoading, setTextLoading] = useState<string>("Inicializando");
  const [pixData, setPixData] = useState<{
    qrCodeBase64: string;
    copyPaste: string;
  } | null>(null);

  const generatePix = async () => {
    setIsLoading(true);
    setTextLoading('Gerando QrCode');
    try {
      const response = await GenerateOrderPixAction(order.id);
      if (response.data) {
        setPixData({
          qrCodeBase64: response.data.pixQrcode || '',
          copyPaste: response.data.pixCopyPaste || '',
        })
      } 
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
      console.error(error);
      toast.error(error.message);
    }
  };

  const handleChange = async () =>{
    setIsLoading(true);
    setTextLoading('Alterando forma de pagamento');
    try {
      await ChangePaymentMethodAction(order.id);
      setIsLoading(false);
      router.push(`/comprar/${order.id}/pagamento`);
    } catch (error: any) {
      setIsLoading(false);
      toast.error(error.message);
    }
  }

  return (<Fragment>
        <div className="flex flex-col gap-6 p-4 rounded-lg bg-white shadow-lg w-full">
          <h2 className="text-2xl font-bold text-center">Seu Pedido</h2>
          <div className=" p-4 bg-gray-100 rounded-md">
            <div className="flex justify-between items-center font-bold text-lg">
              <span>Total ({order.items?.length} Dogões):</span>
              <span>{NumbersHelper.formatCurrency(order.totalValue)}</span>
            </div>
          </div>
            <h2 className="text-xl lg:text-2xl font-bold text-center">Pagamento com PIX
              <Button 
                onClick={handleChange}
                variant="link" 
                className="pl-4 right-0 text-sm text-gray-500 hover:text-orange-600 h-auto"
              >
                ( Alterar pagamento )
              </Button>
            </h2>
            {/* CORREÇÃO DE CENTRALIZAÇÃO: A div abaixo agora é flexbox, não grid */}
            <div className="flex justify-center mx-auto w-full max-w-md"> 
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center gap-4 py-8 w-full">
                        <Loader2 className="h-10 w-10 animate-spin text-orange-600" /> {/* O spinner */}
                        <Label className="text-gray-600">{textLoading}</Label>
                    </div>
                ) : (
                    <Fragment>
                        {pixData !== null ? (
                            <div className="flex flex-col items-center gap-4 w-full">
                                <Image
                                    src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                                    alt="QR Code PIX"
                                    width={220}
                                    height={220}
                                />
                                <Button
                                    onClick={() => {
                                        navigator.clipboard.writeText(pixData.copyPaste);
                                        toast.success("Código PIX copiado!");
                                    }}
                                    className="bg-orange-500 hover:bg-orange-700 w-full max-w-xs"
                                >
                                    Copiar Código PIX
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center w-full">
                                <Button
                                    onClick={generatePix}
                                    className="flex flex-col rounded-md min-h-20 items-center justify-center gap-2 py-6 
                                               bg-orange-600 hover:bg-orange-700 w-full max-w-xs  text-black" // Adicionado w-full max-w-xs
                                >
                                    <Image src="/assets/images/pix.svg" alt="PIX" width={28} height={28} className="text-current" />
                                    <span className="font-bold text-xl">Gerar QrCode</span>
                                </Button>
                            </div>
                        )}
                    </Fragment>
                )}
            </div>
        </div>
    </Fragment>);
}