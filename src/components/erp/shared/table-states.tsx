// src/components/erp/shared/table-states.tsx
"use client"
import { AlertCircle, Loader2 } from "lucide-react";
import { Fragment } from "react";

interface TableStatesProps {
  isLoading: boolean;
  error: string | null | undefined;
}

export function TableStates({ isLoading, error }: TableStatesProps) {
  return (
    <Fragment>
      {isLoading && (
        <div className="absolute top-2 right-2 z-20">
          <Loader2 className="h-4 w-4 animate-spin text-orange-500 opacity-50" />
        </div>
      )}

      {error && (
        <div className="p-3 text-[11px] font-medium text-red-600 bg-red-50 border-b flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>Erro ao sincronizar dados: {error}</span>
        </div>
      )}
    </Fragment>
  );
}