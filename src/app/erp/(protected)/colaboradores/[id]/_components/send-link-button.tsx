// src/app/(erp)/vendedores/[id]/_components/send-link-button.tsx
"use client"

import { Button } from "@/components/ui/button";
import { fetchApi, FetchCtx } from "@/lib/api";
import { Loader2, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function SendLinkButton({ sellerId }: { sellerId: string }) {
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    try {
      await fetchApi(FetchCtx.ERP, `/sellers/send-link/${sellerId}`, { method: 'POST' });
      toast.success("Link enviado com sucesso para o vendedor!");
    } catch (error: any) {
      toast.error(error.message || "Falha ao enviar link.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button 
      onClick={handleSend} 
      disabled={loading}
      className="bg-green-600 hover:bg-green-700 font-bold gap-2"
      size="sm"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
      ENVIAR LINK WHATSAPP
    </Button>
  );
}