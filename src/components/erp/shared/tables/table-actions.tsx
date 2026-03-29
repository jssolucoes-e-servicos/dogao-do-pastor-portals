// Localização provável: src/components/erp/shared/tables/table-actions.tsx (ou index.tsx)
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { ComponentPropsWithoutRef } from "react";

export interface TableActionsProps extends ComponentPropsWithoutRef<"div"> {
  path: string;
  id: string;
  hideDefaultStyle?: boolean;
  hideDelete?: boolean;
}

export function TableActions({ 
  path, 
  id, 
  hideDefaultStyle = false,
  hideDelete = false,
  className, 
  ...props 
}: TableActionsProps) {
  
  const defaultClasses = hideDefaultStyle 
    ? "flex items-center gap-1.5" 
    : "flex items-center justify-end md:justify-center gap-1.5 w-full";

  return (
    <div className={cn(defaultClasses, className)} {...props}>
      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50 rounded-full" asChild>
        <Link href={`/erp/${path}/${id}`}><Eye className="h-4 w-4" /></Link>
      </Button>

      <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600 hover:bg-amber-50 rounded-full" asChild>
        <Link href={`/erp/${path}/${id}/editar`}><Pencil className="h-4 w-4" /></Link>
      </Button>

      {!hideDelete && (
        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50 rounded-full">
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}