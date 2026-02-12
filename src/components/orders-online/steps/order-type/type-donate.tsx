// components/order-online/steps/order-type/type-donate.tsx
'use client';

import { PartnerEntity } from "@/common/entities"; // Assumindo que a entidade existe
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { CheckCircle2, MapPin, Phone, Search, User } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface TypeDonateProps {
  onSelect: (id: string) => void;
  selectedId: string | null;
  partners: PartnerEntity[];
}

export function TypeDonate({ onSelect, selectedId, partners }: TypeDonateProps) {
  const [open, setOpen] = useState(false);

  const isIvcChoice = !selectedId || selectedId === 'IVC_INTERNAL';
  const hasPartners = partners && partners.length > 0;

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4">
        {/* OPÇÃO PADRÃO: IVC ESCOLHE */}
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
            <h4 className="font-bold text-slate-900">A IVC escolhe o destino</h4>
            <p className="text-xs text-slate-500">Nossa equipe destinará seu pedido para a instituição com maior necessidade no momento.</p>
          </div>
        </div>

        {/* OPÇÃO: ESCOLHER INSTITUIÇÃO (Só exibe se houver parceiros) */}
        {hasPartners && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <div 
                className={cn(
                  "flex items-center p-4 border rounded-xl cursor-pointer transition-all",
                  !isIvcChoice ? "border-orange-500 bg-orange-50 ring-1 ring-orange-500" : "border-gray-200 hover:bg-gray-50"
                )}
              >
                <div className={cn(
                  "size-6 rounded-full border-2 flex items-center justify-center mr-4",
                  !isIvcChoice ? "border-orange-500 bg-orange-500 text-white" : "border-gray-300"
                )}>
                  {!isIvcChoice && <CheckCircle2 size={16} />}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900">Quero escolher uma instituição</h4>
                  {!isIvcChoice && (
                    <p className="text-sm font-semibold text-orange-600 mt-1">
                      Selecionado: {partners.find(p => p.id === selectedId)?.name}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <Search size={12} /> Clique para ver a lista de parceiros credenciados
                  </p>
                </div>
              </div>
            </DialogTrigger>

            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Instituições Parceiras</DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                {partners.map((partner) => (
                  <div 
                    key={partner.id} 
                    className={cn(
                      "relative flex flex-col p-4 border rounded-2xl transition-all gap-3",
                      selectedId === partner.id ? "border-orange-500 bg-orange-50" : "bg-white hover:border-orange-200"
                    )}
                  >
                    <div className="flex gap-4 items-start">
                      <div className="relative size-16 shrink-0 rounded-lg overflow-hidden border bg-white">
                        <Image 
                          src={partner.logo || '/assets/images/default-partner.png'} 
                          alt={partner.name} 
                          fill 
                          className="object-contain p-1"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 leading-tight truncate">{partner.name}</h3>
                        <div className="mt-2 space-y-1">
                          <p className="text-[11px] text-slate-600 flex items-center gap-1.5">
                            <User size={12} className="text-orange-500" /> {partner.responsibleName}
                          </p>
                          <p className="text-[11px] text-slate-600 flex items-center gap-1.5">
                            <Phone size={12} className="text-orange-500" /> {partner.phone}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 mt-auto">
                      <p className="text-[10px] text-slate-500 flex items-start gap-1.5 leading-tight mb-3">
                        <MapPin size={12} className="text-orange-500 shrink-0" /> {partner.addressInLine}
                      </p>
                      <Button 
                        className="w-full h-9 text-xs font-bold"
                        variant={selectedId === partner.id ? "default" : "outline"}
                        onClick={() => {
                          onSelect(partner.id);
                          setOpen(false);
                        }}
                      >
                        {selectedId === partner.id ? "Selecionado" : "Escolher Instituição"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}