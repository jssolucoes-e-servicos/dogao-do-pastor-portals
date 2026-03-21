'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRouter } from "next/navigation";
import { getValidatedSaleStatus, SaleStatus } from "@/actions/editions/validate-sale";
import { CreatePdvAction } from "@/actions/orders/create-pdv.action";
import { ListPartnersForOrdersAction } from "@/actions/partners/list-partners-for-orders.action";
import { DeliverOrderAction } from "@/actions/orders/deliver.action";
import { CommandsCheckInAction } from "@/actions/commands/check-in.action";
import { CommandStatusEnum } from "@/common/enums/command-status.enum";
import { OrdersPaginateAction } from "@/actions/orders/paginate.action";
import { RedeemVoucherAction } from "@/actions/vouchers/redeem-voucher.action";
import { SearchCustomerAction } from "@/actions/customers/search-customer.action";
import { CommandsPaginateAction } from "@/actions/commands/paginate.action";
import { UpdateCommandStatusAction } from "@/actions/commands/update-status.action";
import { GetPaymentStatusAction } from "@/actions/payments/get-status.action";
import { GenerateOrderPixAction } from "@/actions/payments/generate-order-pix.action";
import { ValidateTicketAction } from "@/actions/tickets/validate-ticket.action";
import { usePermissions } from "@/hooks/use-permissions";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import HotDogModal from "@/components/modals/hotdog-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { INGREDIENTS } from "@/common/configs/indredients";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  ShoppingCart,
  Plus,
  Trash2,
  Printer,
  User,
  CreditCard,
  UtensilsCrossed,
  CheckCircle2,
  ChefHat,
  Gift,
  Search,
  MapPin,
  Clock,
  LayoutGrid,
  RefreshCw,
  Loader2,
  PlayCircle,
  ArrowRight,
  ListFilter
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { initGoogleConfig } from "@/lib/google-maps-loader";
import { importLibrary } from "@googlemaps/js-api-loader";

const PAYMENT_METHODS = [
  { value: 'PIX', label: 'PIX (QR Code Online)' },
  { value: 'PIX_OFFLINE', label: 'PIX (Transferência Manual)' },
  { value: 'POS', label: 'Maquininha (Física)' },
  { value: 'MONEY', label: 'Dinheiro' },
  { value: 'CARD_CREDIT', label: 'Cartão (Link Online)' },
];


interface PdvItem {
  id: string;
  name: string;
  price: number;
  removedIngredients: string[];
}

export default function PDVPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("venda");

  // Sale State
  const [customer, setCustomer] = useState({ name: "", phone: "", cpf: "" });
  const [deliveryOption, setDeliveryOption] = useState<string>("PICKUP");
  const [address, setAddress] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [ticketNumbers, setTicketNumbers] = useState<string[]>([]);
  const [currentTicket, setCurrentTicket] = useState("");
  const [items, setItems] = useState<PdvItem[]>([]);
  const [observations, setObservations] = useState("");


  // Voucher State
  const [voucherCode, setVoucherCode] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [voucherRes, setVoucherRes] = useState<any>(null);
  const [isVoucherLoading, setIsVoucherLoading] = useState(false);
  const [voucherRemovedIngredients, setVoucherRemovedIngredients] = useState<string[]>([]);

  // Modals & Search State
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isCustomerSelectOpen, setIsCustomerSelectOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [customerOptions, setCustomerOptions] = useState<any[]>([]);
  const [isDelivering, setIsDelivering] = useState<string | null>(null);
  const [isCheckingIn, setIsCheckingIn] = useState<string | null>(null);
  const [activePickupSubTab, setActivePickupSubTab] = useState("prontos");
  const [pickupSearch, setPickupSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);

  // New PDV Enhancements State
  const { hasRole, user } = usePermissions();
  const [isSellerOnly, setIsSellerOnly] = useState(false);
  const [isPaymentPolling, setIsPaymentPolling] = useState(false);
  const [paymentPollingId, setPaymentPollingId] = useState<string | undefined>(undefined);
  const [paymentMethod, setPaymentMethod] = useState<string | undefined>(undefined);
  const [isPaymentStep, setIsPaymentStep] = useState(false);

  // Payment Modals
  const [isPixModalOpen, setIsPixModalOpen] = useState(false);
  const [pixData, setPixData] = useState<any>(null);
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [cashReceived, setCashReceived] = useState(0);
  const [isPosModalOpen, setIsPosModalOpen] = useState(false);
  const [posDetails, setPosDetails] = useState({ type: 'CREDIT', brand: '', receipt: '' });
  const [isPixOfflineModalOpen, setIsPixOfflineModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [tempTicketNumbers, setTempTicketNumbers] = useState<string[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState("");


  // Google Maps Refs
  const addressInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { data: statusRes, mutate: mutateStatus } = useSWR<SaleStatus>(
    'sale-status',
    () => getValidatedSaleStatus()
  );

  const { data: pickupRes, mutate: mutatePickups, isValidating: isValidatingPickups } = useSWR(
    mounted && activeTab === 'retiradas' && activePickupSubTab === 'prontos' ? ['pickup-commands', pickupSearch] : null,
    () => CommandsPaginateAction(1, 100, pickupSearch, CommandStatusEnum.PRODUCED),
    { refreshInterval: 10000 }
  );

  const { data: checkInRes, mutate: mutateCheckIn, isValidating: isValidatingCheckIn } = useSWR(
    mounted && activeTab === 'retiradas' && activePickupSubTab === 'chegada' ? ['checkin-orders', pickupSearch] : null,
    () => OrdersPaginateAction(1, pickupSearch, "PAID", undefined, "PICKUP", 'false'),
    { refreshInterval: 10000 }
  );

  const { data: partnersRes } = useSWR(
    mounted ? 'partners-for-orders' : null,
    () => ListPartnersForOrdersAction()
  );

  const pickupOrders = pickupRes?.data?.data || [];
  const checkInOrders = checkInRes?.data?.data || [];
  const partners = partnersRes?.data || [];
  const isLoadingPickups = !pickupRes && activeTab === 'retiradas';

  useEffect(() => {
    setMounted(true);
    initGoogleConfig();
  }, []);

  // Permission Check
  useEffect(() => {
    if (user) {
      const roles = user.roles || [];
      const hasOnlySeller = roles.length === 1 && roles[0] === 'SELLER';
      setIsSellerOnly(hasOnlySeller);
    }
  }, [user]);

  // Payment Polling
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPaymentPolling && paymentPollingId) {
      interval = setInterval(async () => {
        const res = await GetPaymentStatusAction(paymentPollingId);
        if (res.success && res.data?.status === 'PAID') {
          const currentOrderId = paymentPollingId;
          setIsPaymentPolling(false);
          setPaymentPollingId(undefined);
          setIsPixModalOpen(false);
          toast.success("Pagamento confirmado com sucesso!");

          // Auto Check-in para pedidos de Balcão (Balcão) após confirmação online
          if (deliveryOption === 'PICKUP') {
            await handleCheckIn(currentOrderId);
          }

          handleFinalizeOrderAfterPayment();
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isPaymentPolling, paymentPollingId, deliveryOption]);

  const handleFinalizeOrderAfterPayment = () => {
    // Reset state and show success
    setCustomer({ name: "", phone: "", cpf: "" });
    setItems([]);
    setPaymentMethod(undefined);
    setIsPaymentStep(false);
    setDeliveryOption("PICKUP");
    setAddress("");
    setScheduledTime("");
    setTicketNumbers([]);
    mutateStatus();
    mutateCheckIn();
    mutatePickups();
  };

  // Google Maps Autocomplete Logic
  useEffect(() => {
    if (!mounted || !addressInputRef.current || deliveryOption !== "DELIVERY") return;

    const initAutocomplete = async () => {
      try {
        const { Autocomplete } = await importLibrary("places") as google.maps.PlacesLibrary;
        if (autocompleteRef.current) return;

        autocompleteRef.current = new Autocomplete(addressInputRef.current as HTMLInputElement, {
          componentRestrictions: { country: "br" },
          fields: ["formatted_address", "address_components"],
          types: ["address"],
        });

        autocompleteRef.current.addListener("place_changed", () => {
          const place = autocompleteRef.current?.getPlace();
          if (place?.formatted_address) {
            setAddress(place.formatted_address);
          }
        });
      } catch (err) {
        console.error("Erro Google Maps:", err);
      }
    };

    initAutocomplete();

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
  }, [mounted, deliveryOption]);

  const handleCheckIn = async (orderId: string) => {
    setIsCheckingIn(orderId);
    try {
      const res = await CommandsCheckInAction(orderId);
      if (res.success) {
        toast.success("Pedido enviado para produção!");
        mutateCheckIn();
        mutatePickups();
      } else {
        toast.error(res.error || "Erro ao enviar para produção");
      }
    } catch (error) {
      toast.error("Falha na comunicação");
    } finally {
      setIsCheckingIn(null);
    }
  };

  const handleSearchCustomer = async (key: 'cpf' | 'phone' | 'name', value: string) => {
    if (!value) return;
    const cleanValue = key === 'name' ? value : value.replace(/\D/g, "");
    if (cleanValue.length < 3) return;
    setIsVoucherLoading(true); 
    const res = await SearchCustomerAction({ [key === 'name' ? 'search' : key]: cleanValue });
    setIsVoucherLoading(false);

    if (res.success && res.data?.data) {
      const items = res.data.data;
      if (items.length === 1) {
        const found = items[0];
        setCustomer({
          name: found.name || "",
          phone: found.phone || "",
          cpf: found.cpf || ""
        });
        toast.success(`Cliente encontrado: ${found.name}`);
      } else if (items.length > 1) {
        setCustomerOptions(items);
        setIsCustomerSelectOpen(true);
      }
    }
  };

  const total = items.reduce((acc, item) => acc + item.price, 0);
  const dogPrice = statusRes?.edition?.dogPrice || 24.99;
  const totalItemsQuantity = items.length;
  const ticketDiscount = Math.min(totalItemsQuantity, ticketNumbers.length) * dogPrice;
  const finalTotal = Math.max(0, total - ticketDiscount);

  const handleAddItem = (removedIngredients: string[]) => {
    const newItem: PdvItem = {
      id: Math.random().toString(36).substring(7),
      name: statusRes?.edition?.name || "Dogão",
      price: dogPrice,
      removedIngredients: removedIngredients,
    };
    setItems([...items, newItem]);
    toast.success("Item adicionado");
    setIsAddItemOpen(false);
    setIsPaymentStep(false); // Reset payment step if item added
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
    toast.info("Item removido");
    if (items.length === 1) { // If this was the last item
      setIsPaymentStep(false);
      setPaymentMethod(undefined);
    }
  };

  const handleFinalize = async (overrideMethod?: string) => {
    const selectedMethod = overrideMethod || paymentMethod;

    if (!customer.name || !customer.phone || !selectedMethod || items.length === 0) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    // New specific payment flows
    if (selectedMethod === 'PIX' || selectedMethod === 'CARD_CREDIT') {
      setIsPixModalOpen(true);
      await processFinalize(undefined, selectedMethod); 
      return;
    }

    if (selectedMethod === 'MONEY') {
      setIsCashModalOpen(true);
      return;
    }

    if (selectedMethod === 'PIX_OFFLINE') {
      setIsPixOfflineModalOpen(true);
      return;
    }

    if (selectedMethod === 'POS') {
      setIsPosModalOpen(true);
      return;
    }

    await processFinalize(undefined, selectedMethod);
  };

  const handleIntegratedPayment = async () => {
    setLoading(true);
    try {
      // 1. First create a "Pending" order or similar?
      // Actually, createPDV currently creates it as PAID.
      // We should probably create it as PENDING_PAYMENT if we want to poll.
      // But let's follow the existing logic of createPDV for now, maybe updating it later if needed.
      // For now, I'll call the standard process and show the modal.
      await processFinalize(undefined, paymentMethod);
    } catch (err) {
      toast.error("Erro ao processar pagamento integrado");
    } finally {
      setLoading(false);
    }
  };

  const processFinalize = async (extraData?: any, overrideMethod?: string) => {
    setLoading(true);
    try {
      const finalMethod = overrideMethod || paymentMethod;
      const dto = {
        customerName: customer.name,
        customerPhone: customer.phone,
        customerCpf: customer.cpf,
        paymentMethod: finalMethod,
        deliveryOption: deliveryOption,
        address: address,
        scheduledTime: (deliveryOption === 'PICKUP' || deliveryOption === 'DONATE') ? '' : scheduledTime,
        ticketNumbers: ticketNumbers,
        totalValue: total,
        observations: extraData ? `${observations}\n\n${JSON.stringify(extraData)}` : observations,
        items: items.map(i => ({
          productId: "fixed-dogao",
          removedIngredients: i.removedIngredients,
        })),
        sellerId: isSellerOnly ? user?.sellerId : undefined,
      };

      const res = await CreatePdvAction(dto);
      if (res.success && res.data) {
        if (finalMethod === 'PIX') {
          // Trigger PIX generation
          const pixRes = await GenerateOrderPixAction(res.data.id);
          if (pixRes.success) {
            setPixData(pixRes.data);
            setPaymentPollingId(res.data.id);
            setIsPaymentPolling(true);
          } else {
            toast.error("Erro ao gerar QR Code PIX");
          }
        } else if (finalMethod === 'CARD_CREDIT') {
          // Trigger Credit Link (Mock or real Link generation)
          toast.info("Link de pagamento enviado ao cliente!");
          setPaymentPollingId(res.data.id);
          setIsPaymentPolling(true);
        } else {
          toast.success("Venda realizada com sucesso!");

          // Auto Check-in for PDV Pickup orders
          if (deliveryOption === 'PICKUP') {
            await handleCheckIn(res.data.id);
          }

          handleFinalizeOrderAfterPayment();
        }
      } else {
        toast.error(res.error || "Erro ao finalizar venda");
      }
    } catch (err) {
      toast.error("Erro interno");
    } finally {
      setLoading(false);
    }
  };


  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white leading-none">
            Ponto de <span className="text-orange-600">Venda</span>
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-2">
            Terminal de Atendimento Rápido • {statusRes?.edition?.name || "Edição Offline"}
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
           <div className="flex flex-col items-end px-4">
              <span className="text-[9px] font-black uppercase text-slate-400">Estoque Disponível</span>
              <span className="text-lg font-black text-slate-900 dark:text-white">
                {(statusRes?.edition?.limitSale || 0) - (statusRes?.edition?.dogsSold || 0)} <span className="text-[10px] text-orange-600">UND</span>
              </span>
           </div>
           <Separator orientation="vertical" className="h-8" />
           <div className="pr-4 pl-2">
              <Badge className={statusRes?.canSell ? "bg-emerald-500" : "bg-red-500"}>
                {statusRes?.canSell ? "LOJA ABERTA" : "LOJA FECHADA"}
              </Badge>
           </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {!isSellerOnly && (
          <TabsList className="bg-white dark:bg-slate-900 p-1 rounded-2xl h-14 w-full md:w-auto border border-slate-100 dark:border-slate-800 shadow-sm grid grid-cols-3 md:inline-flex">
            <TabsTrigger
                value="venda"
                className="rounded-xl px-8 font-black uppercase italic text-[10px] data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-slate-900 transition-all gap-2"
            >
                <ShoppingCart className="h-4 w-4" /> Venda
            </TabsTrigger>
            <TabsTrigger
                value="voucher"
                className="rounded-xl px-8 font-black uppercase italic text-[10px] data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-slate-900 transition-all gap-2"
            >
                <Gift className="h-4 w-4" /> Voucher
            </TabsTrigger>
            <TabsTrigger
                value="retiradas"
                className="rounded-xl px-8 font-black uppercase italic text-[10px] data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-slate-900 transition-all gap-2"
            >
                <LayoutGrid className="h-4 w-4" /> Retiradas
            </TabsTrigger>
          </TabsList>
        )}

        <TabsContent value="venda" className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* COLUNA ESQUERDA: CLIENTE E ITENS */}
        <div className="lg:col-span-8 space-y-8">
          {/* Dados do Cliente */}
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
             <CardHeader className="p-8 pb-4">
                <CardTitle className="text-lg font-black uppercase italic flex items-center gap-2">
                   <User className="h-5 w-5 text-orange-600" /> Identificação do Cliente
                </CardTitle>
             </CardHeader>
             <CardContent className="p-8 pt-0 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">CPF</Label>
                      <div className="relative">
                        <Input
                          placeholder="000.000.000-00"
                          value={customer.cpf}
                          onChange={(e) => setCustomer({ ...customer, cpf: e.target.value })}
                          onBlur={() => handleSearchCustomer('cpf', customer.cpf)}
                          className="h-12 rounded-xl border-none bg-slate-50 dark:bg-slate-950 px-4 font-bold text-xs"
                        />
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Telefone / Celular</Label>
                      <div className="relative">
                        <Input
                          placeholder="(00) 00000-0000"
                          value={customer.phone}
                          onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                          onBlur={() => handleSearchCustomer('phone', customer.phone)}
                          className="h-12 rounded-xl border-none bg-slate-50 dark:bg-slate-950 px-4 font-bold text-xs"
                        />
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                      </div>
                   </div>
                </div>

                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nome Completo</Label>
                   <Input
                     placeholder="PESQUISE OU DIGITE O NOME"
                     value={customer.name}
                     onChange={(e) => setCustomer({ ...customer, name: e.target.value.toUpperCase() })}
                     onBlur={() => handleSearchCustomer('name', customer.name)}
                     className="h-12 rounded-xl border-none bg-slate-50 dark:bg-slate-950 px-4 font-bold text-xs"
                   />
                </div>

                <Separator className="bg-slate-100 dark:bg-slate-800" />

                <div className="space-y-4">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Opção de Atendimento</Label>
                   <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: "PICKUP", label: "BALCÃO", icon: UtensilsCrossed },
                        { id: "DELIVERY", label: "ENTREGA", icon: MapPin },
                        { id: "DONATE", label: "DOAÇÃO", icon: Gift },
                      ].map((opt) => (
                        <Button
                          key={opt.id}
                          type="button"
                          variant="outline"
                          onClick={() => setDeliveryOption(opt.id)}
                          className={`h-20 rounded-2xl flex flex-col gap-2 font-black border-2 transition-all ${
                            deliveryOption === opt.id
                            ? "bg-orange-50 border-orange-600 text-orange-600 shadow-sm"
                            : "border-slate-100 dark:border-slate-800 text-slate-400 hover:bg-slate-50"
                          }`}
                        >
                          <opt.icon className="h-6 w-6" />
                          <span className="text-[9px] tracking-widest">{opt.label}</span>
                        </Button>
                      ))}
                   </div>
                </div>

                {deliveryOption === "DELIVERY" && (
                   <div className="animate-in slide-in-from-top-4 duration-300 space-y-4">
                      <div className="space-y-2">
                         <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Endereço de Entrega (Google Autocomplete)</Label>
                         <div className="relative">
                            <Input
                              ref={addressInputRef}
                              placeholder="RUA, NÚMERO, BAIRRO..."
                              value={address}
                              onChange={(e) => setAddress(e.target.value)}
                              className="h-14 rounded-xl border-none bg-slate-50 dark:bg-slate-950 pl-12 pr-4 font-bold text-xs"
                            />
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-600" />
                         </div>
                      </div>
                   </div>
                )}

                {deliveryOption === "DELIVERY" && (
                  <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Horário Agendado / Retirada</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          type="time"
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          className="h-12 rounded-xl border-none bg-slate-50 dark:bg-slate-950 px-12 font-bold text-xs"
                        />
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      </div>
                      <Button
                        type="button"
                        onClick={() => {
                          const now = new Date();
                          setScheduledTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
                        }}
                        className="h-12 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black uppercase text-[10px] px-6"
                      >
                        AGORA
                      </Button>
                    </div>
                  </div>
                )}

                {deliveryOption === "DONATE" && (
                   <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                      <div className="p-6 bg-rose-50 dark:bg-rose-950/20 rounded-3xl border-2 border-rose-100 dark:border-rose-900 border-dashed">
                          <div className="flex items-center gap-2 mb-4">
                             <Gift className="h-4 w-4 text-rose-500" />
                             <span className="text-[10px] font-black uppercase tracking-widest text-rose-600">Destinar Doação</span>
                          </div>
                          <Select value={selectedPartnerId} onValueChange={setSelectedPartnerId}>
                            <SelectTrigger className="w-full bg-white dark:bg-slate-900 border-none font-black text-xs h-12 rounded-2xl shadow-sm">
                              <SelectValue placeholder="SELECIONE O PARCEIRO..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800 p-2">
                              {partners.map((partner: any) => (
                                <SelectItem key={partner.id} value={partner.id} className="font-bold uppercase text-xs rounded-xl">
                                  {partner.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                       </div>
                    </div>
                 )}
             </CardContent>
          </Card>

          {/* Carrinho de Itens */}
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
             <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between space-y-0">
                <div>
                   <CardTitle className="text-lg font-black uppercase italic flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5 text-orange-600" /> Carrinho de Compras
                   </CardTitle>
                   <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Adicione os produtos do pedido
                   </CardDescription>
                </div>
                 <Button
                    onClick={() => setIsAddItemOpen(true)}
                    className="rounded-2xl h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-orange-600 transition-all font-black uppercase text-[10px] gap-2 px-6"
                 >
                    <Plus className="h-4 w-4" /> Adicionar Dogão
                 </Button>
                 <HotDogModal
                    isOpen={isAddItemOpen}
                    onClose={() => setIsAddItemOpen(false)}
                    onSave={(removed) => {
                       if(activeTab === 'venda') handleAddItem(removed);
                       else setVoucherRemovedIngredients(removed);
                    }}
                 />
             </CardHeader>
             <CardContent className="p-0">
                <Table>
                   <TableHeader>
                      <TableRow className="border-slate-50 dark:border-slate-800 hover:bg-transparent">
                         <TableHead className="pl-8 text-[10px] font-black uppercase text-slate-400">Produto</TableHead>
                         <TableHead className="text-center text-[10px] font-black uppercase text-slate-400">Qtd</TableHead>
                         <TableHead className="text-right text-[10px] font-black uppercase text-slate-400">Unitário</TableHead>
                         <TableHead className="text-right text-[10px] font-black uppercase text-slate-400">Total</TableHead>
                         <TableHead className="pr-8"></TableHead>
                      </TableRow>
                   </TableHeader>
                   <TableBody>
                      {items.map(item => (
                         <TableRow key={item.id} className="border-slate-50 dark:border-slate-800 group hover:bg-slate-50/50 dark:hover:bg-slate-950/50">
                            <TableCell className="pl-8 py-6">
                               <div className="flex flex-col">
                                  <span className="font-black text-xs uppercase italic text-slate-900 dark:text-white">{item.name}</span>
                                  {item.removedIngredients.length > 0 && (
                                     <span className="text-[9px] font-bold text-red-500 uppercase">Sem: {item.removedIngredients.join(", ")}</span>
                                  )}
                               </div>
                            </TableCell>
                            <TableCell className="text-center font-black text-xs italic">1x</TableCell>
                            <TableCell className="text-right font-bold text-xs text-slate-500">R$ {item.price.toFixed(2)}</TableCell>
                            <TableCell className="text-right font-black text-xs text-slate-900 dark:text-white italic">R$ {item.price.toFixed(2)}</TableCell>
                            <TableCell className="pr-8 text-right">
                               <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)} className="h-9 w-9 rounded-xl hover:bg-red-50 dark:hover:bg-red-950 text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                  <Trash2 className="h-4 w-4" />
                               </Button>
                            </TableCell>
                         </TableRow>
                      ))}
                      {items.length === 0 && (
                         <TableRow>
                            <TableCell colSpan={5} className="py-20 text-center">
                               <div className="flex flex-col items-center gap-2 opacity-20">
                                  <UtensilsCrossed className="h-12 w-12" />
                                  <span className="text-[10px] font-black uppercase tracking-widest">Nenhum item adicionado</span>
                               </div>
                            </TableCell>
                         </TableRow>
                      )}
                   </TableBody>
                </Table>
             </CardContent>
          </Card>
        </div>

        {/* COLUNA DIREITA: PAGAMENTO E RESUMO */}
        <div className="lg:col-span-4 space-y-8">
           <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden sticky top-8">
             <CardHeader className="p-8 pb-4">
                <CardTitle className="text-lg font-black uppercase italic flex items-center gap-2">
                   <CreditCard className="h-5 w-5 text-orange-600" /> Pagamento & Resumo
                </CardTitle>
             </CardHeader>
             <CardContent className="p-8 pt-4 space-y-8">
                {!isPaymentStep ? (
                  <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-400">Tickets Físicos</Label>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setTempTicketNumbers(new Array(items.length).fill(""));
                          setIsTicketModalOpen(true);
                        }}
                        disabled={items.length === 0}
                        className="w-full h-12 rounded-xl border-dashed border-2 border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase gap-2 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600 transition-all"
                    >
                        <Plus className="h-4 w-4" />
                        {ticketNumbers.length > 0 ? `${ticketNumbers.length} TICKETS LANÇADOS` : "VINCULAR TICKETS FÍSICOS"}
                    </Button>

                    {ticketNumbers.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {ticketNumbers.map(t => (
                              <Badge key={t} className="bg-orange-100 text-orange-600 border-none px-3 py-1 rounded-lg flex items-center gap-2">
                                {t}
                                <Trash2
                                    className="h-3 w-3 cursor-pointer hover:text-red-500"
                                    onClick={() => setTicketNumbers(ticketNumbers.filter(x => x !== t))}
                                />
                              </Badge>
                          ))}
                        </div>
                    )}

                    {items.length > 0 && (
                      <Button
                        onClick={() => setIsPaymentStep(true)}
                        className="w-full h-24 rounded-[2rem] bg-orange-600 hover:bg-orange-700 text-white font-black uppercase italic text-xl tracking-tighter shadow-2xl shadow-orange-600/20 mt-4 transition-all active:scale-95 group animate-pulse hover:animate-none"
                      >
                         IR PARA PAGAMENTO <ArrowRight className="h-6 w-6 ml-3 group-hover:translate-x-2 transition-transform" />
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-400">Forma de Pagamento</Label>
                      <Button variant="ghost" size="sm" onClick={() => setIsPaymentStep(false)} className="h-8 text-[10px] font-bold uppercase underline">Voltar</Button>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        {PAYMENT_METHODS.filter(m => finalTotal > 0 || m.value === 'TICKET').map(method => (
                          <button
                              key={method.value}
                              onClick={async () => {
                                setPaymentMethod(method.value);
                                // Dispara a finalização automática para métodos que exigem modal ou QR
                                if (['PIX', 'MONEY', 'POS', 'CARD_CREDIT', 'PIX_OFFLINE'].includes(method.value)) {
                                  handleFinalize(method.value);
                                }
                              }}
                              className={`flex items-center justify-between p-6 rounded-3xl border-2 transition-all font-black text-xs uppercase tracking-widest ${
                                  paymentMethod === method.value
                                  ? "border-orange-600 bg-orange-50 dark:bg-orange-950/20 text-orange-600 shadow-lg shadow-orange-600/5 scale-[1.02]"
                                  : "border-transparent bg-slate-50 dark:bg-slate-950 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                              }`}
                          >
                              <div className="flex items-center gap-4">
                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${paymentMethod === method.value ? 'bg-orange-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                   {method.value === 'PIX' && <CreditCard className="h-5 w-5" />}
                                   {method.value === 'POS' && <LayoutGrid className="h-5 w-5" />}
                                   {method.value === 'MONEY' && <Plus className="h-5 w-5" />}
                                   {method.value === 'CARD_CREDIT' && <CreditCard className="h-5 w-5" />}
                                </div>
                                {method.label}
                              </div>
                              {paymentMethod === method.value && <CheckCircle2 className="h-5 w-5 animate-in zoom-in" />}
                          </button>
                        ))}
                    </div>

                    {finalTotal === 0 && items.length > 0 && (
                      <Button
                        onClick={() => handleFinalize()}
                        disabled={loading}
                        className="w-full h-20 rounded-[2rem] bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase italic text-lg tracking-tighter shadow-2xl shadow-emerald-600/20 transition-all active:scale-95"
                      >
                        {loading ? "PROCESSANDO..." : "FINALIZAR PEDIDO (TICKETS)"}
                      </Button>
                    )}
                  </div>
                )}

                <div className="p-6 rounded-[2rem] bg-slate-900 dark:bg-slate-800 text-white space-y-4 shadow-xl shadow-slate-900/10">
                   <div className="flex justify-between items-center opacity-60">
                      <span className="text-[10px] font-black uppercase tracking-widest">Subtotal</span>
                      <span className="text-xs font-bold">R$ {total.toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between items-center opacity-60 border-t border-white/10 pt-4">
                      <span className="text-[10px] font-black uppercase tracking-widest">Descontos / Tickets</span>
                      <span className="text-xs font-bold text-emerald-400"> - R$ {ticketDiscount.toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between items-center pt-2">
                      <span className="text-sm font-black uppercase italic">Total a Pagar</span>
                      <span className="text-2xl font-black italic">R$ {finalTotal.toFixed(2)}</span>
                   </div>
                </div>
                <div className="flex justify-center gap-4 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 px-4 rounded-xl border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-slate-900 transition-all gap-2"
                      onClick={() => router.push('/erp/pedidos')}
                    >
                      <ListFilter className="h-3 w-3" /> Ver últimos pedidos
                    </Button>
                </div>
             </CardContent>
           </Card>
        </div>
      </div>
        </TabsContent>

        <TabsContent value="voucher" className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8">
                 <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="p-8 pb-4">
                       <CardTitle className="text-lg font-black uppercase italic flex items-center gap-2">
                          <Gift className="h-5 w-5 text-orange-600" /> Resgate de Voucher Premiado
                       </CardTitle>
                       <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          Valide o código do voucher para realizar o resgate
                       </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-4 space-y-8">
                       <div className="space-y-4">
                          <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-400">Código do Voucher</Label>
                          <div className="flex gap-4">
                             <Input
                                placeholder="DIGITE O CÓDIGO"
                                value={voucherCode}
                                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                                className="h-16 rounded-2xl border-none bg-slate-50 dark:bg-slate-950 px-8 text-xl font-black tracking-widest placeholder:text-slate-200"
                             />
                             <Button
                                onClick={async () => {
                                   if(!voucherCode) return;
                                   setIsVoucherLoading(true);
                                   // Aqui chamaria a action de validação
                                   toast.info("Validando voucher...");
                                   setTimeout(() => {
                                      setIsVoucherLoading(false);
                                      setVoucherRes({ code: voucherCode, customer: { name: "TESTE VOUCHER" } });
                                      toast.success("Voucher validado!");
                                   }, 1000);
                                }}
                                disabled={isVoucherLoading}
                                className="h-16 px-10 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black uppercase italic tracking-tighter"
                             >
                                {isVoucherLoading ? "VALIDANDO..." : "VALIDAR"}
                             </Button>
                          </div>
                       </div>

                       {voucherRes && (
                          <div className="p-8 rounded-[2rem] bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-6 animate-in zoom-in-95">
                             <div className="flex items-center justify-between">
                                <div>
                                   <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Beneficiário</h3>
                                   <p className="text-lg font-black text-slate-900 dark:text-white uppercase italic">{voucherRes.customer.name}</p>
                                </div>
                                <Badge className="bg-emerald-500 rounded-lg py-1 px-4 font-black">VÁLIDO</Badge>
                             </div>

                             <Separator className="opacity-50" />

                             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                   <div className="h-12 w-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600">
                                      <UtensilsCrossed className="h-6 w-6" />
                                   </div>
                                   <div>
                                      <p className="font-black text-xs uppercase italic">1x Dogão do Pastor</p>
                                      <p className="text-[10px] font-bold text-slate-400 uppercase">Resgate Gratuito</p>
                                      {voucherRemovedIngredients.length > 0 && (
                                         <p className="text-[9px] font-bold text-red-500 uppercase">Sem: {voucherRemovedIngredients.join(", ")}</p>
                                      )}
                                   </div>
                                </div>
                                <Button
                                   onClick={() => setIsAddItemOpen(true)}
                                   className="rounded-2xl h-12 bg-slate-900 text-white hover:bg-orange-600 transition-all font-black uppercase text-[10px] gap-2 px-8"
                                >
                                   Personalizar Ingredientes
                                </Button>
                             </div>

                             <Button
                                onClick={async () => {
                                   setIsVoucherLoading(true);
                                   const res = await RedeemVoucherAction(voucherCode, voucherRemovedIngredients);
                                   if(res.success) {
                                      toast.success("Voucher resgatado com sucesso!");
                                      setVoucherCode("");
                                      setVoucherRes(null);
                                      setVoucherRemovedIngredients([]);
                                      mutateStatus();
                                   } else {
                                      toast.error(res.error || "Erro ao resgatar voucher");
                                   }
                                   setIsVoucherLoading(false);
                                }}
                                disabled={isVoucherLoading}
                                className="w-full h-20 rounded-[2rem] bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase italic text-lg tracking-tighter shadow-xl shadow-emerald-600/20"
                             >
                                {isVoucherLoading ? "PROCESSANDO..." : "CONFIRMAR RESGATE"}
                             </Button>
                          </div>
                       )}
                    </CardContent>
                 </Card>
              </div>
           </div>
        </TabsContent>

        <TabsContent value="retiradas" className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-black uppercase italic flex items-center gap-2">
                    <LayoutGrid className="h-5 w-5 text-orange-600" /> Gestão de Retiradas
                  </CardTitle>
                </div>
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="BUSCAR NOME OU TELEFONE..."
                    className="pl-10 h-11 bg-slate-50 border-none rounded-2xl font-bold text-[10px] uppercase tracking-wider"
                    value={pickupSearch}
                    onChange={(e) => setPickupSearch(e.target.value)}
                  />
                </div>
              </div>

              <Tabs value={activePickupSubTab} onValueChange={setActivePickupSubTab} className="mt-6">
                <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl h-12">
                  <TabsTrigger
                    value="prontos"
                    className="rounded-xl font-black uppercase text-[10px] px-6 data-[state=active]:bg-white data-[state=active]:text-orange-600 shadow-none h-10"
                  >
                    Prontos Para Retirada
                  </TabsTrigger>
                  <TabsTrigger
                    value="chegada"
                    className="rounded-xl font-black uppercase text-[10px] px-6 data-[state=active]:bg-white data-[state=active]:text-blue-600 shadow-none h-10"
                  >
                    Confirmar Chegada
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>

            <CardContent className="p-8 pt-4">
              <div className="space-y-4">
                {activePickupSubTab === "prontos" ? (
                  <>
                    {pickupOrders.map((command: any) => {
                      const isWithdrawal = !!command?.withdrawal;
                      const displayName = isWithdrawal ? `DOAÇÃO: ${command?.withdrawal?.partner?.name}` : command?.order?.customerName || "SEM NOME";
                      const displayPhone = isWithdrawal ? command?.withdrawal?.partner?.phone : command?.order?.customerPhone || "N/A";
                      const itemCount = isWithdrawal ? command?.withdrawal?.items?.length : command?.order?.items?.length || 0;

                      return (
                        <div key={command.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-orange-200 transition-all gap-4">
                          <div className="flex items-center gap-4">
                            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${isWithdrawal ? 'bg-purple-100 text-purple-600' : 'bg-emerald-100 text-emerald-600'}`}>
                              {isWithdrawal ? <Gift className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-black text-xs uppercase italic text-slate-900 dark:text-white">{displayName}</p>
                                <Badge className="text-[8px] font-black h-4 px-1.5 uppercase bg-slate-200 text-slate-600 border-none">
                                  #{command.sequentialId}
                                </Badge>
                              </div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                                {itemCount}x Itens • {displayPhone}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Button
                              disabled={isDelivering === command.id}
                              onClick={async () => {
                                if (isWithdrawal) {
                                  toast.info("Para doações, valide o QR Code ou ID do resgate");
                                  // Futura implementação de modal de código
                                }
                                setIsDelivering(command.id);
                                const res = await UpdateCommandStatusAction(command.id, CommandStatusEnum.DELIVERED);
                                if(res.success) {
                                  toast.success("Pedido entregue!");
                                  mutatePickups();
                                } else {
                                  toast.error(res.error || "Erro ao entregar");
                                }
                                setIsDelivering(null);
                              }}
                              className="rounded-2xl h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] gap-2 px-8 transition-all active:scale-95 shadow-lg shadow-emerald-600/20"
                            >
                              {isDelivering === command.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                              Confirmar Entrega
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                    {pickupOrders.length === 0 && !isValidatingPickups && (
                      <div className="py-20 text-center text-slate-400 italic">
                         <LayoutGrid className="h-12 w-12 mx-auto mb-4 opacity-10" />
                         <p className="font-black uppercase text-xs tracking-widest text-slate-300">Nenhum pedido pronto no balcão</p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {checkInOrders.map((order: any) => (
                      <div key={order.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-blue-200 transition-all gap-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl flex items-center justify-center bg-blue-100 text-blue-600">
                             <User className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-black text-xs uppercase italic text-slate-900 dark:text-white">{order?.customerName || 'SEM NOME'}</p>
                              <Badge className="text-[8px] font-black h-4 px-1.5 uppercase bg-slate-200 text-slate-600 border-none">
                                #{order?.id?.slice(-6).toUpperCase() || '------'}
                              </Badge>
                            </div>
                             <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                               {order?.customerPhone || 'SEM TELEFONE'} • {order?.items?.length || 0} Itens
                             </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsOrderDetailsOpen(true);
                            }}
                            className="rounded-2xl h-11 border-slate-200 font-black uppercase text-[10px] gap-2 px-6"
                          >
                            <Search className="h-3.5 w-3.5" /> Ver Detalhes
                          </Button>
                        </div>
                      </div>
                    ))}
                    {checkInOrders.length === 0 && !isValidatingCheckIn && (
                      <div className="py-20 text-center text-slate-400 italic">
                         <User className="h-12 w-12 mx-auto mb-4 opacity-10" />
                         <p className="font-black uppercase text-xs tracking-widest text-slate-300">Nenhum pedido aguardando chegada</p>
                      </div>
                    )}
                  </>
                )}

                {(isValidatingPickups || isValidatingCheckIn) && (pickupOrders.length === 0 || checkInOrders.length === 0) && (
                  <div className="py-20 text-center">
                     <Loader2 className="h-8 w-8 animate-spin mx-auto text-orange-600" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* DIALOG SELEÇÃO DE CLIENTE */}
      <Dialog open={isCustomerSelectOpen} onOpenChange={setIsCustomerSelectOpen}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase italic">Múltiplos Clientes Encontrados</DialogTitle>
            <DialogDescription className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              Encontramos mais de um cadastro para este telefone. Selecione o correto abaixo:
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 overflow-hidden rounded-2xl border border-slate-100">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="text-[10px] font-black uppercase">Nome</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-center">CPF</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-right">Selecionar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customerOptions.map((opt) => (
                  <TableRow key={opt.id}>
                    <TableCell className="font-black text-xs uppercase">{opt.name}</TableCell>
                    <TableCell className="text-center font-bold text-[10px] text-slate-500">{opt.cpf || "N/A"}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => {
                          setCustomer({ name: opt.name, phone: opt.phone, cpf: opt.cpf || "" });
                          setIsCustomerSelectOpen(false);
                        }}
                        className="rounded-lg h-8 bg-slate-900 text-white hover:bg-orange-600 font-bold uppercase text-[9px] tracking-widest"
                      >
                        ESCOLHER
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      {/* DIALOG DE DETALHES DO PEDIDO */}
      <Dialog open={isOrderDetailsOpen} onOpenChange={setIsOrderDetailsOpen}>
        <DialogContent className="max-w-xl rounded-[2.5rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase italic flex items-center gap-3">
              <Search className="h-6 w-6 text-blue-600" /> Detalhes do Pedido
            </DialogTitle>
            <DialogDescription className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              Revise os itens antes de enviar para produção
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="mt-6 space-y-6">
              {/* Dados do Cliente */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[8px] font-black uppercase text-slate-400 mb-1 tracking-widest">Cliente</p>
                  <p className="font-black text-xs uppercase truncate">{selectedOrder.customerName}</p>
                  <p className="text-[10px] font-bold text-slate-500">{selectedOrder.customerPhone}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[8px] font-black uppercase text-slate-400 mb-1 tracking-widest">Documento</p>
                  <p className="font-black text-xs uppercase truncate">{selectedOrder.customer?.cpf || "NÃO INFORMADO"}</p>
                  <Badge variant="outline" className="text-[8px] font-black h-4 px-1.5 uppercase mt-1 border-slate-200 text-slate-500">
                    ID: #{selectedOrder.id.slice(-6).toUpperCase()}
                  </Badge>
                </div>
              </div>

              {/* Dados do Pedido */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Resumo do Pedido</p>
                  {isOrderDetailsOpen && (selectedOrder as any)?.origin === 'VOUCHER' && (voucherRes as any)?.customer && (
                        <div className="bg-orange-50 dark:bg-orange-950/20 p-5 rounded-3xl border border-orange-100 dark:border-orange-900/30 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                               <User className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase text-orange-400 mb-0.5">Cliente Identificado</p>
                              <p className="font-black text-xs uppercase italic">{(voucherRes as any).customer.name}</p>
                            </div>
                          </div>
                         {(voucherRes as any).customer?.phone && (
                           <Badge className="bg-orange-100 text-orange-600 border-none font-black text-[9px] uppercase px-3 h-6">
                             {(voucherRes as any).customer.phone}
                           </Badge>
                         )}
                        </div>
                      )}
                  <Badge className="bg-emerald-100 text-emerald-600 border-none font-black text-[9px] uppercase">
                    {selectedOrder.paymentType}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-600 uppercase">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-orange-500" />
                    {selectedOrder.deliveryTime || "IMEDIATO"}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-orange-500" />
                    {selectedOrder.deliveryOption === 'PICKUP' ? 'BALCÃO (RETIRADA)' : 'DOAÇÃO'}
                  </div>
                </div>
              </div>

              {/* Itens do Pedido */}
              <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-3xl border border-separator/50">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Itens na Comanda</p>
                <div className="space-y-4">
                  {selectedOrder?.items && ((selectedOrder as any).items as any[]).map((item: any, idx: number) => {
                    const isPersonalized = item.removedIngredients?.length > 0;
                    return (
                      <div key={idx} className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4 last:border-0 last:pb-0">
                        <div>
                          <p className="font-black text-sm uppercase italic text-slate-900 dark:text-white">
                            {item?.quantity || 0}x {isPersonalized ? "Dogão Personalizado" : "Dogão Completo"}
                          </p>
                          {isPersonalized && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {item.removedIngredients.map((ing: string) => (
                                <Badge key={ing} variant="destructive" className="text-[8px] font-black px-1.5 py-0.5 uppercase bg-red-100 text-red-600 border-none">
                                  SEM {ing}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="font-bold text-xs text-slate-600">
                           {item?.price?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 
                            item?.unitPrice?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ||
                            dogPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedOrder.observations && (
                <div className="bg-blue-50/50 dark:bg-blue-950/10 p-5 rounded-3xl border border-blue-100/50 dark:border-blue-900/20">
                  <p className="text-[9px] font-black uppercase text-blue-500 mb-1">Observações do Cliente:</p>
                  <p className="text-xs text-blue-900 dark:text-blue-300 font-bold italic">
                    &quot;{(selectedOrder as any).observations}&quot;
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsOrderDetailsOpen(false)}
                  className="flex-1 rounded-2xl h-14 font-black uppercase text-xs tracking-widest border-slate-200"
                >
                  Fechar
                </Button>
                <Button
                  disabled={isCheckingIn === selectedOrder.id}
                  onClick={async () => {
                    await handleCheckIn(selectedOrder.id);
                    setIsOrderDetailsOpen(false);
                  }}
                  className="flex-[2] rounded-2xl h-14 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-600/20 gap-3"
                >
                  {isCheckingIn === selectedOrder.id ? <Loader2 className="h-5 w-5 animate-spin" /> : <PlayCircle className="h-5 w-5" />}
                  Enviar para Produção
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Payment & Ticket Modals */}
      <Dialog open={isPixModalOpen} onOpenChange={setIsPixModalOpen}>
        <DialogContent 
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          className="max-w-md rounded-[2.5rem] p-8 border-none bg-white dark:bg-slate-900"
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase italic flex items-center gap-3">
              <CreditCard className="h-6 w-6 text-orange-600" /> 
              {paymentMethod === 'PIX' ? 'Pagamento via PIX' : 'Cartão (Link Online)'}
            </DialogTitle>
            <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {paymentMethod === 'PIX' ? 'Escaneie o QR Code ou use o Copia e Cola' : 'Aguardando o cliente finalizar o pagamento pelo link'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-8 py-8 text-center">
            {paymentMethod === 'PIX' && pixData?.pixCopyPaste ? (
              <>
                <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 dark:border-slate-800 shadow-sm">
                  <img src={`data:image/png;base64,${pixData.pixQrcode}`} alt="PIX QR Code" className="w-48 h-48 mix-blend-multiply dark:mix-blend-normal" />
                </div>
                <div className="w-full space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pix Copia e Cola</Label>
                  <div className="relative group">
                    <Input readOnly value={pixData.pixCopyPaste} className="font-mono text-[9px] bg-slate-50 dark:bg-slate-950 border-none h-14 pr-12 rounded-xl" />
                    <Button 
                      size="sm"
                      variant="ghost"
                      className="absolute right-2 top-2 h-10 w-10 p-0 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
                      onClick={() => {
                        navigator.clipboard.writeText(pixData.pixCopyPaste);
                        toast.success("Código copiado!");
                      }}
                    >
                      <Plus className="h-4 w-4 rotate-45" /> 
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-6">
                <div className="h-28 w-28 rounded-full bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center animate-pulse border-4 border-orange-100 dark:border-orange-900/30">
                  <CreditCard className="h-12 w-12 text-orange-600" />
                </div>
                <p className="font-bold text-slate-600 dark:text-slate-400 text-sm max-w-[250px]">
                  {paymentMethod === 'PIX' 
                    ? 'Gerando QR Code PIX com segurança...' 
                    : 'O link de pagamento foi enviado ao cliente via WhatsApp.'}
                </p>
              </div>
            )}
            
            <div className="flex items-center gap-3 py-4 px-6 bg-emerald-50 text-emerald-600 rounded-2xl w-full justify-center border border-emerald-100">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-[10px] font-black uppercase tracking-widest">Aguardando Confirmação...</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCashModalOpen} onOpenChange={setIsCashModalOpen}>
        <DialogContent 
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          className="max-w-md rounded-[2.5rem] p-8 border-none bg-white dark:bg-slate-900"
        >
          <DialogHeader><DialogTitle className="text-2xl font-black uppercase italic">Dinheiro (Espécie)</DialogTitle></DialogHeader>
          <div className="space-y-6 py-4">
            <div className="p-6 bg-slate-50 rounded-3xl border-2 border-slate-100 space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total do Pedido</Label>
              <div className="text-3xl font-black italic text-slate-900">R$ {total.toFixed(2)}</div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Valor Recebido</Label>
              <Input 
                type="number" 
                placeholder="R$ 0,00"
                value={cashReceived}
                onChange={(e) => setCashReceived(Number(e.target.value))}
                className="h-16 rounded-2xl border-2 border-slate-200 bg-white font-black text-2xl px-6"
              />
            </div>
            {cashReceived > total && (
              <div className="p-6 bg-emerald-500 text-white rounded-3xl shadow-lg shadow-emerald-500/20 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Troco a Devolver</span>
                <div className="text-3xl font-black italic">R$ {(cashReceived - total).toFixed(2)}</div>
              </div>
            )}
            <Button 
              className="w-full h-20 rounded-[2rem] bg-orange-600 hover:bg-orange-700 text-white font-black uppercase italic text-lg"
              onClick={() => {
                setIsCashModalOpen(false);
                processFinalize({ cashReceived, change: cashReceived - total }, 'MONEY');
              }}
            >
              FINALIZAR VENDA
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isPosModalOpen} onOpenChange={setIsPosModalOpen}>
        <DialogContent 
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          className="max-w-md rounded-[2.5rem] p-8 border-none bg-white dark:bg-slate-900"
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase italic flex items-center gap-3">
              <CreditCard className="h-6 w-6 text-orange-600" /> Maquininha (Física)
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex flex-col gap-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tipo de Operação</Label>
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className={`h-16 rounded-2xl font-black transition-all ${posDetails.type === 'CREDIT' ? 'border-orange-600 bg-orange-50 text-orange-600 dark:bg-orange-900/20' : 'border-slate-100 dark:border-slate-800'}`}
                  onClick={() => setPosDetails({...posDetails, type: 'CREDIT'})}
                >CRÉDITO</Button>
                <Button 
                  variant="outline" 
                  className={`h-16 rounded-2xl font-black transition-all ${posDetails.type === 'DEBIT' ? 'border-orange-600 bg-orange-50 text-orange-600 dark:bg-orange-900/20' : 'border-slate-100 dark:border-slate-800'}`}
                  onClick={() => setPosDetails({...posDetails, type: 'DEBIT'})}
                >DÉBITO</Button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Bandeira do Cartão</Label>
              <div className="grid grid-cols-2 gap-2">
                {['VISA', 'MASTER', 'ELO', ...(posDetails.type === 'CREDIT' ? ['HIPER'] : [])].map(brand => (
                  <Button
                    key={brand}
                    variant="outline"
                    className={`h-12 rounded-xl font-bold text-xs ${posDetails.brand === brand ? 'border-orange-600 bg-orange-50 text-orange-600 dark:bg-orange-900/20' : 'border-slate-100 dark:border-slate-800'}`}
                    onClick={() => setPosDetails({...posDetails, brand})}
                  >
                    {brand}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nº Comprovante (Opcional)</Label>
              <Input 
                placeholder="DOC / AUT" 
                value={posDetails.receipt}
                onChange={(e) => setPosDetails({...posDetails, receipt: e.target.value})}
                className="h-12 rounded-xl bg-slate-50 dark:bg-slate-950 border-none font-bold"
              />
            </div>

            <Button 
              className="w-full h-20 rounded-[2rem] bg-orange-600 hover:bg-orange-700 text-white font-black uppercase italic text-lg shadow-xl shadow-orange-600/20"
              onClick={() => {
                setIsPosModalOpen(false);
                processFinalize(posDetails, 'POS');
              }}
              disabled={!posDetails.brand}
            >
              FINALIZAR VENDA
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isPixOfflineModalOpen} onOpenChange={setIsPixOfflineModalOpen}>
        <DialogContent 
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          className="max-w-md rounded-[2.5rem] p-8 border-none bg-white dark:bg-slate-900"
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase italic flex items-center gap-3 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" /> PIX Offline
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4 text-center">
            <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-3xl border-2 border-emerald-100 dark:border-emerald-800">
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                O cliente já realizou a transferência via PIX?
              </p>
              <p className="text-[10px] uppercase font-black tracking-widest text-emerald-600/60 mt-2">
                Confirme o recebimento no aplicativo do banco antes de finalizar.
              </p>
            </div>
            
            <div className="space-y-3">
               <Button 
                className="w-full h-20 rounded-[2rem] bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase italic text-lg shadow-xl shadow-emerald-600/20"
                onClick={() => {
                  setIsPixOfflineModalOpen(false);
                  processFinalize({ type: 'OFFLINE_CONFIRMED' }, 'PIX_OFFLINE');
                }}
              >
                CONFIRMAR E FINALIZAR
              </Button>
              <Button variant="ghost" className="w-full font-bold text-slate-400" onClick={() => setIsPixOfflineModalOpen(false)}>
                CANCELAR
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isTicketModalOpen} onOpenChange={setIsTicketModalOpen}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] p-8 border-none bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase italic flex items-center gap-3">
              <UtensilsCrossed className="h-6 w-6 text-orange-600" /> Lançamento de Tickets
            </DialogTitle>
            <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Valide os números dos tickets físicos conforme a quantidade de Dogões ({items.length})
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {items.map((item, idx) => (
              <div key={idx} className="p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl border-2 border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Dogão {idx + 1}</span>
                  <Badge className="bg-slate-900 text-[9px]">RESGATE FÍSICO</Badge>
                </div>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Nº TICKET" 
                    value={tempTicketNumbers[idx]}
                    onChange={(e) => {
                      const newNumbers = [...tempTicketNumbers];
                      newNumbers[idx] = e.target.value;
                      setTempTicketNumbers(newNumbers);
                    }}
                    className="h-12 rounded-xl border-none bg-white font-bold"
                  />
                  <Button 
                    variant="outline"
                    className="h-12 px-6 rounded-xl border-2 font-black uppercase text-[10px]"
                    onClick={async () => {
                      const num = tempTicketNumbers[idx];
                      if(!num) return;
                      const res = await ValidateTicketAction(num);
                      if (res.success) {
                        toast.success(`Ticket #${num} validado!`);
                      } else {
                        const newNumbers = [...tempTicketNumbers];
                        newNumbers[idx] = ""; 
                        setTempTicketNumbers(newNumbers);
                        toast.error(res.error || "Ticket inválido - Campo limpo");
                      }
                    }}
                  >
                    VALIDAR
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => setIsTicketModalOpen(false)} className="flex-1 h-14 rounded-2xl font-black uppercase text-[10px]">CANCELAR</Button>
            <Button 
               className="flex-[2] h-14 rounded-2xl bg-orange-600 text-white font-black uppercase text-[10px]"
               onClick={() => {
                 setTicketNumbers(tempTicketNumbers.filter(n => !!n));
                 setIsTicketModalOpen(false);
                 toast.success("Tickets vinculados ao carrinho!");
               }}
            >
              CONFIRMAR VÍNCULO
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
