//components/order-online/steps/order-type/type-pickup.tsx
'use client';
export function TypePickup() {
  return (
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-2">
      <p className="text-blue-800 font-bold text-sm">📍 Local de Retirada:</p>
      <p className="text-slate-600 text-sm leading-relaxed">
        Avenida Dr. João Dentice, 241, Restinga, Porto Alegre/RS.<br/>
        <span className="font-semibold text-slate-900 italic">Disponível das 10h às 21h.</span>
      </p>
    </div>
  )
}