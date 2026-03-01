// src/components/erp/shared/tables/table-headers.tsx
import { cn } from "@/lib/utils";
import { ComponentPropsWithoutRef, ReactNode } from "react";

interface TableHeadersProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
  cols?: 3 | 4 | 5;
}

export function TableHeaders({ children, className, cols = 4, ...props }: TableHeadersProps) {
  const gridConfig = {
    3: "md:grid-cols-[1fr_1fr_140px]",
    4: "md:grid-cols-[1.5fr_1fr_2fr_140px]",
    5: "md:grid-cols-[2fr_1fr_1.5fr_1fr_140px]"
  }[cols];

  return (
    <div 
      className={cn(
        "hidden md:grid items-center gap-4 px-6 py-2 bg-muted/50 rounded-lg border border-transparent italic",
        gridConfig,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}