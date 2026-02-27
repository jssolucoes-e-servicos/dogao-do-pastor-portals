// src/components/erp/partners/invite-partner-modal.tsx
"use client"

import { ArrowLeft, Check, Copy, Loader2, Send, Share2, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr"; // Import para gerenciar a mutação global

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
  partner?: PartnerEntity;
  mode?: "create" | "resend";
}

export function InvitePartnerModal({ partner, mode = "create" }: InvitePartnerModalProps) {
  const { mutate } = useSWRConfig(); // Hook para disparar o refresh da tabela
  
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [partnerCreated, setPartnerCreated] = useState<PartnerEntity | null>(partner || null);
  const [copied, setCopied] = useState(false);
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  // Se estiver em modo reenvio, gera a URL do parceiro recebido
  useEffect(() => {
    if (partner && mode === "resend") {
      setInviteUrl(`${window.location.origin}/parceiros/cadastro/${partner.id}`);
    }
  }, [partner, mode]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const {data: newPartner} = await GenerateInviteAction();
      const url = `${window.location.origin}/parceiros/cadastro/${newPartner?.id}`;
      setInviteUrl(url);
      setPartnerCreated(newPartner!);
      
      // Notifica o SWR que a lista de parceiros mudou
      mutate("partners-list"); 
      
      toast.success("Registro de convite criado com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao gerar convite.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendWhatsApp = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error("Por favor, informe um número de WhatsApp válido.");
      return;
    }
    setSending(true);
    try {
      if (partnerCreated) {
        await SendInviteAction(partnerCreated, phoneNumber);
        toast.success("Link enviado para o WhatsApp!");
      }
    } catch (error: any) {
      toast.error("Falha ao enviar mensagem.");
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

  const copyToClipboard = () => {
    if (inviteUrl) {
      navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toast.success("Link copiado para a área de transferência!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog onOpenChange={(open) => !open && resetModal()}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button className="bg-orange-600 hover:bg-orange-700 font-bold gap-2 h-10">
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
              ? "Informe o número do responsável para enviar o link de cadastro."
              : "O parceiro ficará ativo somente após completar o cadastro através do link."
            }
          </DialogDescription>
        </DialogHeader>

        {!inviteUrl ? (
          /* PASSO 1: GERAR */
          <div className="flex flex-col gap-4 py-4">
            <p className="text-sm text-muted-foreground text-center">
              Deseja criar um registro temporário e gerar um link único?
            </p>
            <Button onClick={handleGenerate} disabled={loading} className="w-full">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {loading ? "Processando..." : "Confirmar e Gerar"}
            </Button>
          </div>
        ) : !showPhoneInput ? (
          /* PASSO 2: LINK E OPÇÕES */
          <div className="space-y-4 py-4 animate-in fade-in duration-300">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground">Link do Parceiro</Label>
              <div className="flex items-center space-x-2">
                <Input value={inviteUrl} readOnly className="h-10 bg-muted/50 font-mono text-xs" />
                <Button size="icon" variant="outline" onClick={copyToClipboard} className="shrink-0">
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 pt-2">
              <Button 
                variant="default" 
                className="bg-green-600 hover:bg-green-700 w-full"
                onClick={() => setShowPhoneInput(true)}
              >
                <Send className="mr-2 h-4 w-4" /> Enviar via WhatsApp
              </Button>
            </div>
          </div>
        ) : (
          /* PASSO 3: TELEFONE */
          <div className="space-y-4 py-4 animate-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase">Número com DDD (Apenas números)</Label>
              <Input 
                placeholder="51999999999"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                autoFocus
                className="h-12 text-lg tracking-widest"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => setShowPhoneInput(false)} disabled={sending}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
              </Button>
              <Button 
                onClick={handleSendWhatsApp} 
                disabled={sending || !phoneNumber}
                className="bg-green-600 hover:bg-green-700"
              >
                {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                {sending ? "Enviando..." : "Enviar Agora"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}