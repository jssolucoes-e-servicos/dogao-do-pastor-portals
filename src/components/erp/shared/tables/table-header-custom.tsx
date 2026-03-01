/* // src/components/erp/shared/table-header-custom.tsx
"use client"

import { useDebounce } from "@/common/hooks/use-debounce"; // Você vai precisar desse hook
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface TableHeaderCustomProps {
  title: string;
  description?: string;
  onSearch: (value: string) => void;
  buttonLabel?: string;
  buttonHref?: string;
  actionButton?: React.ReactNode;
}

export function TableHeaderCustom({ 
  title, 
  description, 
  onSearch, 
  buttonLabel, 
  buttonHref,
  actionButton,
}: TableHeaderCustomProps) {
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 500);

  // Dispara a busca apenas após o usuário parar de digitar por 500ms
  useEffect(() => {
    onSearch(debouncedSearch);
  }, [debouncedSearch, onSearch]);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-xl font-black uppercase tracking-tighter text-foreground">{title}</h1>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>

      <div className="flex flex-1 md:justify-end items-center gap-2 max-w-xl">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar (lembre-se das acentuações)..."
            className="pl-9 h-10 border-orange-200 focus-visible:ring-orange-500"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          {searchValue && (
            <button 
              onClick={() => setSearchValue("")}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {buttonLabel && buttonHref && (
          <Button asChild className="bg-orange-600 hover:bg-orange-700 font-bold gap-2 h-10">
            <Link href={buttonHref}>
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{buttonLabel}</span>
            </Link>
          </Button>
        )}
        
        {actionButton && (
          <div className="flex items-center">
            {actionButton}
          </div>
        )}
      </div>
    </div>
  );
} */

  // src/components/erp/shared/table-header-custom.tsx
"use client"

import { useDebounce } from "@/common/hooks/use-debounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface TableHeaderCustomProps {
  title: string;
  description?: string;
  onSearch: (value: string) => void;
  buttonLabel?: string;
  buttonHref?: string;
  actionButton?: React.ReactNode;
}

export function TableHeaderCustom({ 
  title, 
  description, 
  onSearch, 
  buttonLabel, 
  buttonHref,
  actionButton,
}: TableHeaderCustomProps) {
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 500);

  useEffect(() => {
    onSearch(debouncedSearch);
  }, [debouncedSearch, onSearch]);

  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Título e Botão de Adicionar Lado a Lado no Mobile */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-foreground leading-none">{title}</h1>
          {description && <p className="text-[10px] md:text-xs text-muted-foreground mt-1 uppercase font-bold opacity-70">{description}</p>}
        </div>

        {buttonLabel && buttonHref && (
          <Button asChild className="bg-primary hover:opacity-90 font-black gap-2 h-11 px-4 shadow-sm md:hidden">
            <Link href={buttonHref}>
              <Plus className="h-5 w-5" />
            </Link>
          </Button>
        )}
      </div>

      {/* Barra de Busca e Botão Desktop */}
      <div className="flex flex-col md:flex-row items-center gap-3 w-full">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar..."
            className="pl-10 h-12 md:h-11 border-slate-200 bg-background focus-visible:ring-primary shadow-sm"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          {searchValue && (
            <button 
              onClick={() => setSearchValue("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {buttonLabel && buttonHref && (
            <Button asChild className="hidden md:flex bg-primary hover:opacity-90 font-black gap-2 h-11 px-6 shadow-md">
              <Link href={buttonHref}>
                <Plus className="h-4 w-4" />
                <span>{buttonLabel}</span>
              </Link>
            </Button>
          )}
          
          {actionButton && (
            <div className="flex-1 md:flex-none">
              {actionButton}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}