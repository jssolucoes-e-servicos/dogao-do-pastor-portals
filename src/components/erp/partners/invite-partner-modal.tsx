// src/components/erp/partners/invite-partner-modal.tsx
"use client"

import { Check, Copy, Loader2, Send, Share2, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { GenerateInviteAction } from "@/actions/partners/generate-invite.action";
import { SendInviteAction } from "@/actions/partners/send-invite.action";
import { PartnerEntity } from "@/common/entities";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InvitePartnerModalProps {
  partner?: PartnerEntity; // Opcional: se enviado, funciona como reenvio
  mode?: "create" | "resend";
}

export function InvitePartnerModal({ partner, mode = "create" }: InvitePartnerModalProps) {
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [partnerCreated, setPartnerCreated] = useState<PartnerEntity | null>(partner || null);
  const [copied, setCopied] = useState(false);
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  // Se for modo reenvio, já prepara a URL ao abrir
  useEffect(() => {
    if (partner && mode === "resend") {
      setInviteUrl(`${window.location.origin}/parceiros/cadastro/${partner.id}`);
    }
  }, [partner, mode]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const newPartner = await GenerateInviteAction();
      const url = `${window.location.origin}/parceiros/cadastro/${newPartner.id}`;
      setInviteUrl(url);
      setPartnerCreated(newPartner);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendWhatsApp = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error("Número inválido.");
      return;
    }
    setSending(true);
    try {
      if (partnerCreated) {
        await SendInviteAction(partnerCreated, phoneNumber);
        toast.success("Convite enviado!");
      }
    } catch (error: any) {
      toast.error("Erro ao enviar.");
    } finally {
      setSending(false);
    }
  };

  const resetModal = () => {
    if (mode === "create") {
      setInviteUrl(null);
      setPartnerCreated(null);
    }
    setShowPhoneInput(false);
    setPhoneNumber("");
  };

  return (
    <Dialog onOpenChange={(open) => !open && resetModal()}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button variant="outline">
            <UserPlus className="mr-2 h-4 w-4" /> Gerar Convite
          </Button>
        ) : (
          <Button variant="ghost" size="icon" title="Reenviar Convite">
            <Share2 className="h-4 w-4 text-orange-500" />
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {showPhoneInput ? "Enviar para WhatsApp" : mode === "resend" ? "Reenviar Convite" : "Gerar Novo Convite"}
          </DialogTitle>
          <DialogDescription>
            {showPhoneInput 
              ? "Informe o número do responsável."
              : "O parceiro ficará ativo somente após completar o cadastro."
            }
          </DialogDescription>
        </DialogHeader>

        {!inviteUrl ? (
          <div className="flex flex-col gap-4 py-4">
            <p className="text-sm text-muted-foreground text-center">Deseja gerar um link único?</p>
            <Button onClick={handleGenerate} disabled={loading} className="w-full">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Confirmar e Gerar"}
            </Button>
          </div>
        ) : !showPhoneInput ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground">Link de Cadastro</Label>
              <div className="flex items-center space-x-2">
                <Input value={inviteUrl} readOnly className="h-10 bg-muted/50 font-mono text-xs" />
                <Button size="icon" variant="outline" onClick={() => {
                  navigator.clipboard.writeText(inviteUrl);
                  setCopied(true);
                  toast.success("Copiado!");
                  setTimeout(() => setCopied(false), 2000);
                }}>
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button className="bg-green-600 hover:bg-green-700 w-full" onClick={() => setShowPhoneInput(true)}>
              <Send className="mr-2 h-4 w-4" /> Enviar via WhatsApp
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <Label className="text-[10px] font-bold uppercase">WhatsApp (DDD + Número)</Label>
            <Input 
              placeholder="51999999999"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
              className="h-12 text-lg tracking-widest"
            />
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => setShowPhoneInput(false)} disabled={sending}>Voltar</Button>
              <Button onClick={handleSendWhatsApp} disabled={sending || !phoneNumber} className="bg-green-600">
                {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Enviar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}