import { ComponentPropsWithoutRef } from "react";

interface TableHeadersProps extends ComponentPropsWithoutRef<"span"> {
  children: React.ReactNode;
  action?: boolean;
}

export function TableHeadersItem({ children, action = false }: TableHeadersProps){
  return (
    <span 
      className={`text-[10px] font-black uppercase text-muted-foreground tracking-widest
        ${action && 'text-right'}`}
    >{children}</span>
  ) 
}