"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ListEditionsAction, EditionItem } from "@/actions/editions/list-editions.action";

interface EditionContextValue {
  editions: EditionItem[];
  selectedId: string;
  selected: EditionItem | undefined;
  setSelectedId: (id: string) => void;
}

const EditionContext = createContext<EditionContextValue>({
  editions: [],
  selectedId: "",
  selected: undefined,
  setSelectedId: () => {},
});

export function EditionProvider({ children }: { children: ReactNode }) {
  const [editions, setEditions] = useState<EditionItem[]>([]);
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    ListEditionsAction().then((data) => {
      setEditions(data);
      // Pré-seleciona a ativa, ou a mais recente
      const active = data.find((e) => e.active) ?? data[0];
      if (active) setSelectedId(active.id);
    });
  }, []);

  const selected = editions.find((e) => e.id === selectedId);

  return (
    <EditionContext.Provider value={{ editions, selectedId, selected, setSelectedId }}>
      {children}
    </EditionContext.Provider>
  );
}

export function useEdition() {
  return useContext(EditionContext);
}
