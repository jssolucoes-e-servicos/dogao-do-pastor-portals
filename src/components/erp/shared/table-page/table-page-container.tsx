interface TablePageContainerProps {
  children: React.ReactNode;
}
export function TablePageContainer({ children }: TablePageContainerProps) {
  return(
    <div className="flex flex-col gap-6 p-4 md:p-0 w-full max-w-full overflow-hidden">
      {children}
    </div>
  )
}