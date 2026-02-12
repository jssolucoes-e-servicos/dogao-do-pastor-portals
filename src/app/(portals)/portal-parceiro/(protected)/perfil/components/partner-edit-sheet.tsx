'use client';

import { PartnerEntity } from "@/common/entities";
import { IUserPartner } from "@/common/interfaces/user-partner.interface";
import { PartnerUpdateForm } from "@/components/partners/partner-update-form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface PartnerEditSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  partner: PartnerEntity;
}

export function PartnerEditSheet({ isOpen, onOpenChange, partner }: PartnerEditSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[600px] p-0 border-l-orange-100">
        <SheetHeader className="p-6 border-b bg-slate-50">
          <SheetTitle className="font-black uppercase tracking-tighter text-2xl text-slate-800">
            Configurações do Perfil
          </SheetTitle>
          <SheetDescription className="font-medium">
            Atualize as informações públicas e de contato da sua instituição.
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-110px)] p-6">
          <div className="pb-10">
            <PartnerUpdateForm 
              partnerId={partner.id} 
              initialData={partner} 
              isEdit={true} 
              onSuccess={() => onOpenChange(false)}
            />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}