import { StringsHelper } from "@/common/helpers/string-helpers";

interface EditPageHeaderProps {
  module: string;
  page: string;
  tag: string;
  id: string;
  children: React.ReactNode;
}

export async function EditPageContents({ module, page, tag, id, children }: EditPageHeaderProps) {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 flex flex-col gap-8">
      <header>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground dark:text-orange-500">
            {module}
          </span>
          <span className="w-1 h-1 rounded-full bg-orange-400" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-orange-600">
            {page}
          </span>
        </div>
        <h1 className="text-3xl font-black uppercase text-foreground dark:text-orange-400">
          Editar cadastro
        </h1>
        <p className="text-muted-foreground text-sm uppercase font-medium tracking-wide">
          {tag}-<span className="text-orange-600 dark:text-orange-500 font-bold">{StringsHelper.smallId(id)}</span>
        </p>
      </header>
      {children}
    </div>
  )
} 