// components/order-online/steps/order-type/type-delivery.tsx
'use client';
import { CustomerAddressEntity } from "@/common/entities";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  addressesList: CustomerAddressEntity[];
  addressData: Partial<CustomerAddressEntity>;
  setAddressData: (data: any) => void;
  showNewAddressForm: boolean;
  setShowNewAddressForm: (val: boolean) => void;
  setAddressSelectedId: (id: string | null) => void;
}

export function TypeDelivery({ addressesList, addressData, setAddressData, showNewAddressForm, setShowNewAddressForm, setAddressSelectedId }: Props) {
  
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'new') {
      setShowNewAddressForm(true);
      setAddressData({});
      setAddressSelectedId(null);
    } else {
      setShowNewAddressForm(false);
      const selected = addressesList.find(a => a.id === val);
      if (selected) {
        setAddressData(selected);
        setAddressSelectedId(selected.id);
      }
    }
  };

  return (
    <div className="space-y-4">
      {addressesList.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Selecione o endereço:</Label>
          <select 
            onChange={handleSelectChange}
            className="w-full px-3 py-2 border rounded-lg bg-white"
            value={showNewAddressForm ? 'new' : (addressData.id || '')}
          >
            <option value="">Selecione...</option>
            {addressesList.map(a => (
              <option key={a.id} value={a.id}>{a.street}, {a.number} - {a.neighborhood}</option>
            ))}
            <option value="new" className="text-orange-600 font-bold">+ Cadastrar Novo</option>
          </select>
        </div>
      )}

      {(showNewAddressForm || addressesList.length === 0) && (
        <div className="grid grid-cols-1 gap-3 p-4 bg-slate-50 rounded-lg border">
          <Input placeholder="Rua" value={addressData.street || ''} onChange={e => setAddressData({...addressData, street: e.target.value})} />
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Número" value={addressData.number || ''} onChange={e => setAddressData({...addressData, number: e.target.value})} />
            <Input placeholder="Bairro" value={addressData.neighborhood || ''} onChange={e => setAddressData({...addressData, neighborhood: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Cidade" value={addressData.city || ''} onChange={e => setAddressData({...addressData, city: e.target.value})} />
            <Input placeholder="Estado" value={addressData.state || ''} onChange={e => setAddressData({...addressData, state: e.target.value})} />
          </div>
        </div>
      )}
    </div>
  );
}