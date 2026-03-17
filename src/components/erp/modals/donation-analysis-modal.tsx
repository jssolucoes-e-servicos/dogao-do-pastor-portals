"use client"

import {
  Building2,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Dog,
  History,
  Link2,
  Loader2,
  MapPin,
  Navigation,
  Phone,
  Send,
  User as UserIcon
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

import { UpdateOrderObservationsAction } from "@/actions/orders/update-order-observations.action";
import { GenerateInviteAction } from "@/actions/partners/generate-invite.action";
import { PartnerByIdAction } from "@/actions/partners/get-by-id.action";
import { SendInviteAction } from "@/actions/partners/send-invite.action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

export function DonationAnalysisModal({ order, isOpen, onClose }: any) {
  const { mutate } = useSWRConfig();
  
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [partnerData, setPartnerData] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [newNote, setNewNote] = useState("");

  const parseInfo = (text: string = "") => {
    const find = (key: string) => {
      const line = text.split('\n').find(l => l.trim().startsWith(`${key}:`));
      return line ? line.split(`${key}:`)[1].trim() : "";
    };
    return {
      nome: find("Nome"),
      endereco: find("Endereço"),
      contato: find("Contato"),
      telefone: find("Telefone"),
    };
  };

  const info = parseInfo(order?.observations);
  const existingPartnerId = order?.observations?.match(/\[PARTNER_ID\]: ([\w-]+)/)?.[1];

  const checkPartnerStatus = async (id: string) => {
    setChecking(true);
    try {
      const res = await PartnerByIdAction(id);
      if (res?.success) setPartnerData(res.data);
    } catch (error) {
      console.error("Erro ao verificar parceiro");
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (existingPartnerId) {
        setInviteUrl(`${window.location.origin}/parceiros/cadastro/${existingPartnerId}`);
        checkPartnerStatus(existingPartnerId);
      }
      setPhoneNumber(info.telefone.replace(/\D/g, ""));
      setNewNote("");
      setShowLog(false);
    }
  }, [isOpen, existingPartnerId]);

  if (!order) return null;

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const resInvite = await GenerateInviteAction();
      if (!resInvite?.success) throw new Error(resInvite?.error);

      const url = `${window.location.origin}/parceiros/cadastro/${resInvite.data!.id}`;
      const logTag = `\n[PARTNER_ID]: ${resInvite.data!.id} [FLAG]: CONVITE_GERADO`;
      
      const resOrder = await UpdateOrderObservationsAction(order.id, (order.observations || "") + logTag);
      if (!resOrder?.success) throw new Error("Falha ao vincular pedido.");

      setInviteUrl(url);
      setPartnerData(resInvite.data);
      await mutate("donations-curatory-list");
      toast.success("Convite gerado!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalBind = async () => {
    setLoading(true);
    try {
      const timestamp = new Date().toLocaleString('pt-BR');
      const logTag = `\n[${timestamp}] SUCESSO: Pedido vinculado à entidade ${partnerData.name}. Saldo liberado.`;
      const res = await UpdateOrderObservationsAction(order.id, (order.observations || "") + logTag);
      
      if (res?.success) {
        await mutate("donations-curatory-list");
        toast.success("Vínculo finalizado!");
        onClose();
      }
    } catch (error) {
      toast.error("Erro na vinculação.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!newNote.trim()) return onClose();
    setLoading(true);
    try {
      const timestamp = new Date().toLocaleString('pt-BR');
      const formattedNote = `\n[${timestamp}] ${newNote.trim()}`;
      const res = await UpdateOrderObservationsAction(order.id, (order.observations || "") + formattedNote);
      if (res?.success) {
        await mutate("donations-curatory-list");
        toast.success("Nota salva!");
        onClose();
      }
    } catch (error) {
      toast.error("Erro ao salvar.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendWhatsApp = async () => {
    if (!phoneNumber || phoneNumber.length < 10) return toast.error("Número inválido.");
    setLoading(true);
    try {
      const res = await SendInviteAction(partnerData, phoneNumber);
      if (res?.success) {
        toast.success("Enviado!");
        setShowPhoneInput(false);
      }
    } catch (error) {
      toast.error("Erro ao enviar");
    } finally {
      setLoading(false);
    }
  };

  const isCompleted = partnerData?.approved && partnerData?.active;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden border-orange-500/20 shadow-2xl bg-background flex flex-col">
        <DialogHeader className="p-4 pr-12 border-b bg-orange-50/30 dark:bg-orange-950/10">
          <DialogTitle className="uppercase font-black tracking-tighter text-md flex items-center gap-2 text-orange-600">
            <Building2 className="h-4 w-4 shrink-0" />
            <span className="truncate">{info.nome || "Análise"}</span>
            <Badge className="bg-orange-600 hover:bg-orange-600 text-white text-[9px] px-1.5 h-4 border-none flex items-center gap-1 shrink-0 ml-1">
              <Dog className="h-2.5 w-2.5" /> {order.items.length}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 space-y-3">
          {/* INFO CARD COMPACTO REVISADO */}
          <div className="bg-muted/30 p-3 rounded-lg border space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-0.5">
                <Label className="text-[9px] font-black uppercase text-muted-foreground">Responsável</Label>
                <p className="text-[11px] font-bold truncate flex items-center gap-1">
                  <UserIcon className="h-3 w-3 text-orange-500" /> {info.contato || "N/A"}
                </p>
              </div>
              <div className="space-y-0.5 text-right">
                <Label className="text-[9px] font-black uppercase text-muted-foreground">Telefone</Label>
                <p className="text-[11px] font-black text-orange-600 flex items-center gap-1 justify-end">
                  <Phone className="h-3 w-3" /> {info.telefone || "N/A"}
                </p>
              </div>
            </div>
            
            {/* O ENDEREÇO ESTÁ DE VOLTA AQUI */}
            <div className="pt-2 border-t border-muted-foreground/10">
              <div className="flex justify-between items-start gap-2">
                <div className="space-y-0.5 flex-1">
                  <Label className="text-[9px] font-black uppercase text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-2.5 w-2.5" /> Endereço Detectado
                  </Label>
                  <p className="text-[10px] leading-tight italic text-muted-foreground">
                    {info.endereco || "Endereço não informado."}
                  </p>
                </div>
                {info.endereco && (
                  <Button 
                    size="icon" 
                    variant="outline" 
                    className="h-7 w-7 shrink-0 border-orange-200 text-orange-600"
                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(info.endereco)}`, '_blank')}
                  >
                    <Navigation className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* LOG COLLAPSIBLE */}
          <div className="border rounded-lg overflow-hidden">
            <button onClick={() => setShowLog(!showLog)} className="w-full flex items-center justify-between p-2 bg-muted/20 hover:bg-muted/40 transition-colors">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground">
                <History className="h-3 w-3" /> Histórico
              </div>
              {showLog ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
            {showLog && (
              <div className="p-2 bg-background border-t">
                <ScrollArea className="h-[100px] w-full">
                  <pre className="text-[9px] text-muted-foreground whitespace-pre-wrap font-sans">
                    {order.observations || "Nenhum registro."}
                  </pre>
                </ScrollArea>
              </div>
            )}
          </div>

          {/* ÁREA DE AÇÃO PRINCIPAL */}
          <div className="pt-1">
            {isCompleted ? (
              <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                  <div className="inline-flex p-1.5 bg-emerald-500 rounded-full text-white mb-1.5">
                    <Check className="h-4 w-4" />
                  </div>
                  <h4 className="text-[11px] font-black uppercase text-emerald-700">Entidade Pronta!</h4>
                </div>
                <Button onClick={handleFinalBind} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-xs h-11 shadow-lg gap-2">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
                  Vincular Pedido e Finalizar
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {!inviteUrl ? (
                  <Button onClick={handleGenerate} disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700 h-10 font-black uppercase text-xs">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    Gerar Convite de Cadastro
                  </Button>
                ) : (
                  <div className="p-3 bg-slate-950 rounded-lg border border-orange-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-orange-500 uppercase italic">Aguardando Preenchimento...</span>
                      {checking && <Loader2 className="h-3 w-3 animate-spin text-orange-500" />}
                    </div>
                    {!showPhoneInput ? (
                      <div className="flex gap-2">
                        <Input value={inviteUrl} readOnly className="h-8 bg-white/5 border-white/10 text-white text-[10px] font-mono" />
                        <Button size="icon" variant="outline" className="h-8 w-8 shrink-0 border-white/10 text-white" onClick={() => { navigator.clipboard.writeText(inviteUrl); setCopied(true); toast.success("Copiado!"); setTimeout(() => setCopied(false), 2000); }}>
                          {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                        </Button>
                        <Button onClick={() => setShowPhoneInput(true)} size="sm" className="bg-green-600 hover:bg-green-700 h-8 text-[10px] font-black">ZAP</Button>
                      </div>
                    ) : (
                      <div className="flex gap-2 animate-in slide-in-from-right-2">
                        <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))} className="h-8 bg-white/5 border-white/10 text-white text-center font-black" />
                        <Button onClick={() => setShowPhoneInput(false)} variant="ghost" className="h-8 text-[9px] text-white">X</Button>
                        <Button onClick={handleSendWhatsApp} disabled={loading} className="bg-green-600 h-8 text-[10px] font-black px-4">ENVIAR</Button>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-1.5 border-t pt-3">
                  <Label className="text-[10px] font-black uppercase text-orange-600 ml-1">Nota Interna</Label>
                  <Textarea className="min-h-[60px] text-[11px] bg-muted/10 border-orange-100 resize-none" placeholder="Ex: Cadastro enviado para o João..." value={newNote} onChange={(e) => setNewNote(e.target.value)} />
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <Button variant="outline" className="h-9 font-black uppercase text-[10px]" onClick={onClose}>Fechar</Button>
                    <Button className="h-9 bg-orange-600 hover:bg-orange-700 text-white font-black uppercase text-[10px]" onClick={handleSaveNote} disabled={loading}>
                      Salvar Nota
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}