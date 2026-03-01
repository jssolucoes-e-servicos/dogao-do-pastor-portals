interface TablePageContentProps {
  children: React.ReactNode;
}
export function TablePageContent({ children }: TablePageContentProps) {
  return(
    <div className="flex flex-col gap-4 relative w-full">
      {children}
    </div>
  )
}