// src/components/erp/shared/table-pagination.tsx
"use client"

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TablePaginationProps {
  page: number;
  totalPages: number;
  isLoading?: boolean;
  onPageChange: (newPage: number) => void;
}

export function TablePagination({ 
  page, 
  totalPages, 
  isLoading, 
  onPageChange 
}: TablePaginationProps) {
  
  if (!totalPages || totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-2 text-muted-foreground mt-4">
      <span className="text-[12px] font-medium italic">
        Página {page} de {totalPages}
      </span>
      <div className="flex gap-2 mb-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 border-orange-200 hover:bg-orange-50 hover:text-orange-700"
          disabled={page === 1 || isLoading}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 border-orange-200 hover:bg-orange-50 hover:text-orange-700"
          disabled={page === totalPages || isLoading}
          onClick={() => onPageChange(page + 1)}
        >
          Próximo <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}