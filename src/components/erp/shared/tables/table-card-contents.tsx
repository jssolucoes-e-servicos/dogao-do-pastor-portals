// src/components/erp/shared/tables/table-card-contents.tsx
import { cn } from "@/lib/utils";
import { ComponentPropsWithoutRef, ReactNode } from "react";

interface TableCardContentsProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
  cols?: 3 | 4 | 5;
}

export function TableCardContents({ children, className, cols = 4, ...props }: TableCardContentsProps) {
  const gridConfig = {
    3: "md:grid-cols-[1fr_1fr_140px]",
    4: "md:grid-cols-[1.5fr_1fr_2fr_140px]",
    5: "md:grid-cols-[2fr_1fr_1.5fr_1fr_140px]"
  }[cols];

  return (
    <div 
      className={cn(
        "bg-card border border-slate-200 dark:border-slate-800 rounded-xl p-4 md:px-6 md:py-4 transition-all hover:border-orange-400 shadow-sm w-full grid grid-cols-1 gap-4",
        gridConfig,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}