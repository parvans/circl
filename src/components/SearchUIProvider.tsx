"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

type SearchUIContextValue = {
  isSearchFocused: boolean;
  setIsSearchFocused: (value: boolean) => void;
};

const SearchUIContext = createContext<SearchUIContextValue | null>(null);

export function SearchUIProvider({ children }: { children: ReactNode }) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <SearchUIContext.Provider value={{ isSearchFocused, setIsSearchFocused }}>
      {children}
    </SearchUIContext.Provider>
  );
}

export function useSearchUI() {
  const context = useContext(SearchUIContext);

  if (!context) {
    throw new Error("useSearchUI must be used within SearchUIProvider");
  }

  return context;
}
