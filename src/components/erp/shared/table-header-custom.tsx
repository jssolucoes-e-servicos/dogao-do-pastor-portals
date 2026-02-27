// src/components/erp/shared/table-header-custom.tsx
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
}