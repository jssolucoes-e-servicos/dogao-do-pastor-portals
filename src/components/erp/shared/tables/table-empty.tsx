import { AlertCircle } from "lucide-react";

export function TableEmpty() {
  return (
    <div className="bg-card border rounded-xl border-dashed py-20 text-center text-muted-foreground">
      <div className="flex flex-col items-center gap-2 opacity-50">
        <AlertCircle className="h-10 w-10" />
        <p className="italic uppercase text-xs font-bold">Nenhum resultado encontrado.</p>
      </div>
    </div>
  )
}