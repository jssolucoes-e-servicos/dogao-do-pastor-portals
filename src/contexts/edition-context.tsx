"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ListEditionsAction, EditionItem } from "@/actions/editions/list-editions.action";
import { getValidatedSaleStatus } from "@/actions/editions/validate-sale";

interface EditionContextValue {
  editions: EditionItem[];
  selectedId: string;
  selected: EditionItem | undefined;
  setSelectedId: (id: string) => void;
  isProductionDay: boolean;
}

const EditionContext = createContext<EditionContextValue>({
  editions: [],
  selectedId: "",
  selected: undefined,
  setSelectedId: () => {},
  isProductionDay: false,
});

export function EditionProvider({ children }: { children: ReactNode }) {
  const [editions, setEditions] = useState<EditionItem[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [isProductionDay, setIsProductionDay] = useState(false);

  useEffect(() => {
    ListEditionsAction().then((data) => {
      setEditions(data);
      const active = data.find((e) => e.active) ?? data[0];
      if (active) setSelectedId(active.id);
    });
    getValidatedSaleStatus().then((status) => {
      setIsProductionDay(!!status.edition?.active && (status.canSell || status.isWaiting));
    });
  }, []);

  const selected = editions.find((e) => e.id === selectedId);

  return (
    <EditionContext.Provider value={{ editions, selectedId, selected, setSelectedId, isProductionDay }}>
      {children}
    </EditionContext.Provider>
  );
}

export function useEdition() {
  return useContext(EditionContext);
}
