'use client';

import { CustomerAddressEntity } from "@/common/entities";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initGoogleConfig } from "@/lib/google-maps-loader";
import { importLibrary } from "@googlemaps/js-api-loader";
import { useEffect, useRef } from "react";

interface Props {
  addressesList: CustomerAddressEntity[];
  addressData: Partial<CustomerAddressEntity>;
  setAddressData: (data: any) => void;
  showNewAddressForm: boolean;
  setShowNewAddressForm: (val: boolean) => void;
  setAddressSelectedId: (id: string | null) => void;
}

export function TypeDelivery({ 
  addressesList, 
  addressData, 
  setAddressData, 
  showNewAddressForm, 
  setShowNewAddressForm, 
  setAddressSelectedId 
}: Props) {
  
  const streetInputRef = useRef<HTMLInputElement>(null);
  const numberInputRef = useRef<HTMLInputElement>(null);
  const complementInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    const init = async () => {
      if (typeof window === "undefined" || !streetInputRef.current) return;

      try {
        initGoogleConfig();
        const { Autocomplete } = await importLibrary("places") as google.maps.PlacesLibrary;

        if (autocompleteRef.current) return;

        autocompleteRef.current = new Autocomplete(streetInputRef.current, {
          componentRestrictions: { country: "br" },
          fields: ["address_components", "formatted_address"],
          types: ["address"],
        });

        autocompleteRef.current.addListener("place_changed", () => {
          const place = autocompleteRef.current?.getPlace();
          if (!place?.address_components) return;

          const newAddress: any = {
            street: '',
            number: '',
            neighborhood: '',
            city: '',
            state: '',
            zipCode: '',
            complement: addressData.complement || ''
          };

          const neighborhoodTypes = ['sublocality_level_1', 'sublocality', 'neighborhood'];

          place.address_components.forEach(component => {
            const types = component.types;
            if (types.includes('street_number')) newAddress.number = component.long_name;
            if (types.includes('route')) newAddress.street = component.long_name;
            if (neighborhoodTypes.some(type => types.includes(type)) && !newAddress.neighborhood) {
              newAddress.neighborhood = component.long_name;
            }
            if (types.includes('administrative_area_level_2')) newAddress.city = component.long_name;
            if (types.includes('administrative_area_level_1')) newAddress.state = component.short_name;
            if (types.includes('postal_code')) newAddress.zipCode = component.long_name.replace(/\D/g, "");
          });

          setAddressData((prev: any) => ({ ...prev, ...newAddress }));

          // Lógica de Foco Automático
          setTimeout(() => {
            if (!newAddress.number) {
              numberInputRef.current?.focus();
            } else {
              complementInputRef.current?.focus();
            }
          }, 100);
        });
      } catch (err) {
        console.error("Erro Google Maps v2:", err);
      }
    };

    if (showNewAddressForm || addressesList.length === 0) {
      init();
    }

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
  }, [showNewAddressForm, addressesList.length, setAddressData, addressData.complement]);

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

  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddressData((prev: any) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-4">
      {addressesList.length > 0 && (
        <div className="space-y-1">
          <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Endereço Salvo</Label>
          <select 
            onChange={handleSelectChange}
            className="w-full px-3 py-3 border-2 rounded-xl bg-white font-bold text-sm outline-none focus:border-orange-500 transition-all shadow-sm"
            value={showNewAddressForm ? 'new' : (addressData.id || '')}
          >
            <option value="">Selecione...</option>
            {addressesList.map(a => (
              <option key={a.id} value={a.id}>{a.street}, {a.number} - {a.neighborhood}</option>
            ))}
            <option value="new" className="text-orange-600 font-bold">+ CADASTRAR NOVO</option>
          </select>
        </div>
      )}

      {(showNewAddressForm || addressesList.length === 0) && (
        <div className="grid grid-cols-1 gap-3 p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 animate-in fade-in duration-300">
          <div className="space-y-1">
            <Label className="text-[9px] font-black uppercase ml-1">Rua / Logradouro</Label>
            <Input 
              ref={streetInputRef}
              name="street"
              placeholder="Ex: Av. Brasil..." 
              className="bg-white border-none shadow-sm font-bold h-11 focus:ring-2 focus:ring-orange-500"
              value={addressData.street || ''} 
              onChange={handleManualChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[9px] font-black uppercase ml-1">Número</Label>
              <Input 
                ref={numberInputRef}
                name="number"
                placeholder="Ex: 123" 
                className="bg-white border-none shadow-sm font-bold h-11 focus:ring-2 focus:ring-orange-500" 
                value={addressData.number || ''} 
                onChange={handleManualChange} 
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[9px] font-black uppercase ml-1">Complemento</Label>
              <Input 
                ref={complementInputRef}
                name="complement"
                placeholder="Apto/Bloco" 
                className="bg-white border-none shadow-sm font-bold h-11 focus:ring-2 focus:ring-orange-500" 
                value={addressData.complement || ''} 
                onChange={handleManualChange} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[9px] font-black uppercase ml-1">Bairro</Label>
              <Input 
                name="neighborhood"
                placeholder="Bairro" 
                readOnly={!!addressData.neighborhood}
                tabIndex={-1}
                className={`border-none shadow-sm font-bold h-11 ${!!addressData.neighborhood ? 'bg-slate-100 text-slate-500' : 'bg-white'}`}
                value={addressData.neighborhood || ''} 
                onChange={handleManualChange} 
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[9px] font-black uppercase ml-1">CEP</Label>
              <Input 
                name="zipCode"
                placeholder="00000-000" 
                readOnly={!!addressData.zipCode}
                tabIndex={-1}
                className={`border-none shadow-sm font-bold h-11 ${!!addressData.zipCode ? 'bg-slate-100 text-slate-500' : 'bg-white'}`}
                value={addressData.zipCode || ''} 
                onChange={handleManualChange} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[9px] font-black uppercase ml-1">Cidade</Label>
              <Input value={addressData.city || ''} readOnly tabIndex={-1} className="bg-slate-100 border-none shadow-sm font-bold h-11 text-slate-500" />
            </div>
            <div className="space-y-1">
              <Label className="text-[9px] font-black uppercase ml-1">UF</Label>
              <Input value={addressData.state || ''} readOnly tabIndex={-1} className="bg-slate-100 border-none shadow-sm font-bold h-11 text-slate-500" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}