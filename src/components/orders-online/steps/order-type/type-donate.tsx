// components/order-online/steps/order-type/type-donate.tsx
'use client';

import { PartnerEntity } from "@/common/entities";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  MapPin,
  Phone,
  PlusCircle,
  Search,
  User
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface TypeDonateProps {
  onSelect: (id: string, suggestion?: string) => void;
  onDirectSubmit: (id: string, suggestion?: string) => Promise<void>;
  selectedId: string | null;
  partners: PartnerEntity[];
}

export function TypeDonate({ onSelect, onDirectSubmit, selectedId, partners }: TypeDonateProps) {
  const [openMainModal, setOpenMainModal] = useState(false);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [suggestion, setSuggestion] = useState({
    nome: '',
    endereco: '',
    contato: '',
    telefone: ''
  });

  const isIvcChoice = !selectedId || selectedId === 'IVC_INTERNAL';
  const hasPartners = partners && partners.length > 0;

  const handleConfirmSuggestion = () => {
    setShowSuggestModal(false);
    setShowReviewModal(true);
  };

  const handleFinalReviewOk = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    const observationText = `[SUGESTÃO DE NOVA INSTITUIÇÃO]
Nome: ${suggestion.nome}
Endereço: ${suggestion.endereco}
Contato: ${suggestion.contato}
Telefone: ${suggestion.telefone}`;

    try {
      await onDirectSubmit('IVC_INTERNAL', observationText);
    } catch (error) {
      setIsProcessing(false);
      setShowReviewModal(false);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4">
        {/* OPÇÃO 1: IVC ESCOLHE */}
        <div 
          onClick={() => onSelect('IVC_INTERNAL')}
          className={cn(
            "flex items-center p-4 border rounded-xl cursor-pointer transition-all",
            isIvcChoice ? "border-orange-500 bg-orange-50 ring-1 ring-orange-500" : "border-gray-200 hover:bg-gray-50"
          )}
        >
          <div className={cn(
            "size-6 rounded-full border-2 flex items-center justify-center mr-4",
            isIvcChoice ? "border-orange-500 bg-orange-500 text-white" : "border-gray-300"
          )}>
            {isIvcChoice && <CheckCircle2 size={16} />}
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-slate-900 leading-tight">A IVC escolhe o destino</h4>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Nossa equipe escolhe o destino conforme a necessidade.</p>
          </div>
        </div>

        {/* OPÇÃO 2: ESCOLHER INSTITUIÇÃO */}
        {hasPartners && (
          <Dialog open={openMainModal} onOpenChange={setOpenMainModal}>
            <DialogTrigger asChild>
              <div 
                className={cn(
                  "flex items-center p-4 border rounded-xl cursor-pointer transition-all",
                  !isIvcChoice ? "border-green-500 bg-green-50 ring-1 ring-green-500" : "bg-white border-gray-200 hover:bg-gray-50"
                )}
              >
                <div className={cn(
                  "size-6 rounded-full border-2 flex items-center justify-center mr-4",
                  !isIvcChoice ? "border-green-600 bg-green-600 text-white" : "border-gray-300"
                )}>
                  {!isIvcChoice && <CheckCircle2 size={16} />}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900">Quero escolher uma instituição</h4>
                  {!isIvcChoice && (
                    <p className="text-sm font-semibold text-green-700 mt-1">
                      Selecionado: {partners.find(p => p.id === selectedId)?.name}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <Search size={12} /> Ver lista de parceiros credenciados
                  </p>
                </div>
              </div>
            </DialogTrigger>

            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
              <DialogHeader className="p-6 pb-2">
                <DialogTitle className="text-xl font-bold">Instituições Parceiras</DialogTitle>
                <p className="text-sm text-slate-500">Selecione para qual instituição deseja destinar sua doação.</p>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 pt-2 overflow-y-auto flex-1">
                {partners.map((partner) => (
                  <div key={partner.id} className={cn("flex flex-col p-4 border rounded-2xl transition-all gap-3 bg-white", selectedId === partner.id ? "border-orange-500 ring-1 ring-orange-500 bg-orange-50/30" : "hover:border-orange-200")}>
                    <div className="flex gap-4 items-start">
                      <div className="relative size-14 shrink-0 rounded-lg overflow-hidden border bg-slate-50">
                        <Image src={partner.logo || '/assets/images/default-partner.png'} alt={partner.name} fill className="object-contain p-1" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 text-sm leading-tight truncate">{partner.name}</h3>
                        <div className="mt-1.5 space-y-0.5">
                          <p className="text-[10px] text-slate-600 flex items-center gap-1.5"><User size={10} className="text-orange-500" /> {partner.responsibleName}</p>
                          <p className="text-[10px] text-slate-600 flex items-center gap-1.5"><Phone size={10} className="text-orange-500" /> {partner.phone}</p>
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-100 mt-auto">
                      <p className="text-[10px] text-slate-500 flex items-start gap-1.5 leading-tight mb-3 min-h-[20px]">
                        <MapPin size={10} className="text-orange-500 shrink-0 mt-0.5" /> {partner.addressInLine}
                      </p>
                      <Button className="w-full h-8 text-[11px] font-bold" variant={selectedId === partner.id ? "default" : "outline"} onClick={() => { onSelect(partner.id); setOpenMainModal(false); }}>
                        {selectedId === partner.id ? "Selecionado" : "Escolher esta"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-slate-50 border-t flex flex-col items-center gap-2">
                <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Não encontrou quem procurava?</p>
                <Button variant="outline" onClick={() => setShowSuggestModal(true)} className="w-full md:w-auto px-10 border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-800 font-bold gap-2 h-9">
                  <PlusCircle size={16} /> Quero sugerir outra instituição
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* MODAL 1: FORMULÁRIO DE SUGESTÃO */}
      <Dialog open={showSuggestModal} onOpenChange={setShowSuggestModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <PlusCircle className="text-orange-500" size={20} /> Sugerir Instituição
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-slate-500">Nome da Instituição</Label>
              <Input placeholder="Ex: Lar dos Idosos" value={suggestion.nome} onChange={e => setSuggestion({...suggestion, nome: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-slate-500">Endereço / Bairro</Label>
              <Input placeholder="Ex: Rua das Flores, Bairro Centro" value={suggestion.endereco} onChange={e => setSuggestion({...suggestion, endereco: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-slate-500">Contato (Opcional)</Label>
                <Input placeholder="Responsável" value={suggestion.contato} onChange={e => setSuggestion({...suggestion, contato: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-slate-500">Telefone</Label>
                <Input placeholder="(00) 00000-0000" value={suggestion.telefone} onChange={e => setSuggestion({...suggestion, telefone: e.target.value})} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowSuggestModal(false)}>Voltar</Button>
            <Button className="bg-orange-600 hover:bg-orange-700 font-bold" onClick={handleConfirmSuggestion} disabled={!suggestion.nome || !suggestion.telefone}>
              Confirmar Sugestão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: AVISO FINAL (EXIBE TUDO QUE FOI DIGITADO) */}
      <Dialog open={showReviewModal} onOpenChange={(open) => {
        if (!open && !isProcessing) handleFinalReviewOk();
      }}>
        <DialogContent className="max-w-md border-t-4 border-t-orange-500">
          <DialogHeader className="space-y-4">
            <DialogTitle className="text-xl font-black text-slate-900 uppercase">Resumo da Sugestão</DialogTitle>
            
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-700 space-y-2">
              <div className="grid grid-cols-1 gap-2">
                <p><strong>Instituição:</strong> {suggestion.nome}</p>
                <p><strong>Endereço:</strong> {suggestion.endereco || <span className="text-slate-400 italic font-normal">Não informado</span>}</p>
                <p><strong>Contato:</strong> {suggestion.contato || <span className="text-slate-400 italic font-normal">Não informado</span>}</p>
                <p><strong>Telefone:</strong> {suggestion.telefone}</p>
              </div>
            </div>

            <div className="text-sm text-slate-600 leading-relaxed bg-orange-50 p-4 rounded-lg border border-orange-100 italic">
              <p>
                A equipe <strong>IVC</strong> validará estes dados para realizar a entrega. 
                Seu pedido será finalizado e você será levado para o pagamento.
              </p>
            </div>
          </DialogHeader>

          <DialogFooter>
            <Button 
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 uppercase"
              onClick={handleFinalReviewOk}
              disabled={isProcessing}
            >
              {isProcessing ? "Processando..." : "OK, Ir para Pagamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}