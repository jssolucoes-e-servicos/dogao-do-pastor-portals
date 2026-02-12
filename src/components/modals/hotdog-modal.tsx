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
          <h4 className="text-lg font-semibold text-center">
            Selecione os ingredientes que você deseja <span className='font-bold text-red-600'>remover</span> {removedIngredients.length === 0 && 'ou cique em Dogão Completo'}
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {INGREDIENTS.map((ingredient) => (
              <div
                key={ingredient}
                className={cn(
                  'p-2 rounded-lg cursor-pointer transition-colors border-2 text-center',
                  removedIngredients.includes(ingredient)
                    ? 'bg-red-200 border-red-500 line-through'
                    : 'bg-green-200 border-green-500'
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
