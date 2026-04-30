import React, { createContext, useContext, useState, ReactNode } from "react";
import { SearchFilter, SearchResult } from "../types";
import toast from "react-hot-toast";
import { useAuth, mapUserFromMetadata } from "./AuthContext";

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
  const { setUser } = useAuth(); // Import useAuth to get the setter
  const { updateUser } = useAuth();
  const performSearch = async (
    query: string,
    filters: SearchFilter,
    userId?: string,
  ) => {
    setLoading(true);
    try {
      const response = await import("../services/database").then(
        ({ searchPeople }) => searchPeople(filters),
      );
      console.log("1. RAW API RESPONSE:", response);
      const results = response.results;
      setSearchResults(results);

      // Update User State (Credits)
      if (response.user) {
        updateUser(response.user);
      }

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
