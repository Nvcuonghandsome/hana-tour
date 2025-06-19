import { create } from 'zustand';

type SearchState = {
  search: string;
  debouncedSearch: string;
  setSearch: (value: string) => void;
  setDebouncedSearch: (value: string) => void;
};

export const useSearchStore = create<SearchState>((set) => ({
  search: '',
  debouncedSearch: '',
  setSearch: (value) => set({ search: value }),
  setDebouncedSearch: (value) => set({ debouncedSearch: value }),
}));
