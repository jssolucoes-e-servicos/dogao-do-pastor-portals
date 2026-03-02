import { NumbersHelper } from "@/common/helpers/numbers-helper";

interface CardTotalProps {
  count: number;
  value: number;
}

export function CardTotal({ count, value }: CardTotalProps) {
  return (
    <div className=" p-4 bg-gray-100 rounded-md">
      <div className="flex justify-between items-center font-bold text-lg">
        <span> Total ({count} { count> 1 ? 'Dogões' : 'Dogão'}):</span>
        <span>{NumbersHelper.formatCurrency(value)}</span>     
      </div>
    </div>
  )
}