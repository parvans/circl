"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchIcon, XIcon } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "./ui/input-group";
import { useSearchUI } from "./SearchUIProvider";

export default function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { isSearchFocused, setIsSearchFocused } = useSearchUI();
  const currentQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(currentQuery);
  const skipNextNavigation = useRef(false);

  const updateSearch = (nextQuery: string) => {
    const trimmedQuery = nextQuery.trim();
    const normalizedCurrentQuery = currentQuery.trim();

    if (trimmedQuery === normalizedCurrentQuery) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());

    if (trimmedQuery.length > 0) {
      params.set("q", trimmedQuery);
    } else {
      params.delete("q");
    }

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;

    startTransition(() => {
      router.replace(nextUrl, { scroll: false });
    });
  };

  const clearSearch = () => {
    skipNextNavigation.current = false;
    setQuery("");
    updateSearch("");
  };

  useEffect(() => {
    if (query !== currentQuery) {
      skipNextNavigation.current = true;
    }
    setQuery(currentQuery);
  }, [currentQuery]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (skipNextNavigation.current) {
        skipNextNavigation.current = false;
        return;
      }
      updateSearch(query);
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [currentQuery, pathname, query, router, searchParams]);

  return (
    <InputGroup
      className={isSearchFocused ? "relative z-50 border-primary/50 ring-4 ring-primary/10" : "relative z-50"}
    >
      <InputGroupInput
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search users and posts..."
        aria-label="Search users and posts"
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            skipNextNavigation.current = false;
            updateSearch(query);
          }
        }}
        onFocus={() => setIsSearchFocused(true)}
        onBlur={() => {
          window.setTimeout(() => setIsSearchFocused(false), 120);
        }}
      />
      <InputGroupAddon align="inline-start">
        <SearchIcon className="w-4 h-4 text-muted-foreground" />
      </InputGroupAddon>
      {query ? (
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            className="text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
            onMouseDown={(event) => event.preventDefault()}
            onClick={clearSearch}
          >
            <XIcon className="size-3.5" />
          </InputGroupButton>
        </InputGroupAddon>
      ) : null}
      {isPending ? (
        <InputGroupAddon align="inline-end" className="text-xs">
          Searching
        </InputGroupAddon>
      ) : null}
    </InputGroup>
  );
}
