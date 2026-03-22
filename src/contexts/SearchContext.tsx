import React, { createContext, useContext, useState, ReactNode } from "react";
import { SearchFilter, SearchResult } from "../types";
import toast from "react-hot-toast";

interface SearchContextType {
  searchResults: SearchResult[];
  performSearch: (
    query: string,
    filters: SearchFilter,
    userId?: string,
  ) => Promise<void>;
  loading: boolean;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context)
    throw new Error("useSearch must be used within a SearchProvider");
  return context;
};

export const SearchProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const performSearch = async (
    query: string,
    filters: SearchFilter,
    userId?: string,
  ) => {
    setLoading(true);
    try {
      const results = await import("../services/database").then(
        ({ searchPeople }) => searchPeople(filters),
      );
      setSearchResults(results);

      toast.success(
        `Found ${results.length} result${results.length !== 1 ? "s" : ""}`,
      );
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SearchContext.Provider value={{ searchResults, performSearch, loading }}>
      {children}
    </SearchContext.Provider>
  );
};
