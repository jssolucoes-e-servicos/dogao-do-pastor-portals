
interface TableContentsProps {
  children: React.ReactNode
}

export function TableContents({ children }: TableContentsProps) {
  return (
    <div className="flex flex-col gap-2 w-full">{children}</div>
  )
}