'use client';

import { PartnerEntity } from '@/common/entities';
import { UserTypesEnum } from '@/common/enums';
import { ChangePasswordModal } from '@/components/security/change-password-modal';
import { Button } from '@/components/ui/button';
import { Edit3, Lock } from 'lucide-react';
import { useState } from 'react';
import { PartnerEditSheet } from './partner-edit-sheet';

export function ProfileActions({ partner }: { partner: PartnerEntity }) {
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        onClick={() => setIsPasswordOpen(true)}
        className="gap-2 border-2 font-bold uppercase text-[10px] h-10 border-slate-200"
      >
        <Lock className="w-3 h-3 text-orange-600" /> Alterar Senha
      </Button>
      
      <Button 
        className="gap-2 font-bold uppercase text-[10px] h-10 bg-slate-900 hover:bg-slate-800 text-white"
        onClick={() => setIsEditOpen(true)}
      >
        <Edit3 className="w-3 h-3" /> Editar Perfil
      </Button>

      <ChangePasswordModal 
        isOpen={isPasswordOpen} 
        onClose={() => setIsPasswordOpen(false)} 
        userId={partner.id} 
        typeUser={UserTypesEnum.PARTNER}
      />

      <PartnerEditSheet 
        isOpen={isEditOpen} 
        onOpenChange={setIsEditOpen} 
        partner={partner} 
      />
    </div>
  );
}