// src/components/modals/hotdog-modal.tsx
'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { INGREDIENTS } from '@/common/configs/indredients';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface HotDogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (removedIngredients: string[]) => void;
}

export default function HotDogModal({ isOpen, onClose, onSave }: HotDogModalProps) {
  const [removedIngredients, setRemovedIngredients] = useState<string[]>([]);

  const handleIngredientToggle = (ingredient: string) => {
    setRemovedIngredients((prevRemoved) =>
      prevRemoved.includes(ingredient)
        ? prevRemoved.filter((item) => item !== ingredient)
        : [...prevRemoved, ingredient]
    );
  };

  const handleSave = () => {
    onSave(removedIngredients);
    onClose();
    setRemovedIngredients([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Personalize seu Dogão</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <h4 className="text-lg font-black uppercase italic text-center tracking-tight">
            Selecione para <span className='text-red-500'>remover</span> {removedIngredients.length === 0 && 'ou clique em Completo'}
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {INGREDIENTS.map((ingredient) => (
              <div
                key={ingredient}
                className={cn(
                  'p-4 rounded-2xl cursor-pointer transition-all border-2 text-center font-bold uppercase tracking-widest text-[10px]',
                  removedIngredients.includes(ingredient)
                    ? 'bg-red-50 border-red-500 text-red-600 line-through dark:bg-red-900/20 dark:border-red-600'
                    : 'bg-emerald-50 border-emerald-500 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-600'
                )}
                onClick={() => handleIngredientToggle(ingredient)}
              >
                {ingredient}
              </div>
            ))}
          </div>
        </div>
        <DialogFooter className="sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave} className='bg-orange-600 hover:bg-orange-700'>
            {removedIngredients.length > 0 ? 'Dogão Peronalizado' : 'Dogão Completo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
