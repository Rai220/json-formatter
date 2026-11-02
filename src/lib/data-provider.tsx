/**
 * Client-only data provider for the JSON Formatter.
 *
 * Page and child components never import `src/data/seed.ts` directly — they
 * read through `useDataProvider()`. This module is the ONLY file that imports
 * `@/data/seed`.
 *
 * There is no backend / dual-mode split: the single source is the client-only
 * seed used as the first-visit document plus the static tab-width reference
 * data. There are no filterable collections and no mutations — the document
 * lives in browser memory, localStorage, and the URL hash.
 */
import { createContext, useContext, type ReactNode } from "react";
import {
  sampleJson,
  defaultTabWidth,
  tabWidthOptions,
  LS_KEY,
  type TabWidth,
  type TabWidthOption,
} from "@/data/seed";

export type { TabWidth, TabWidthOption };

export interface AppDataProvider {
  /** Seed document restored on first visit (no URL hash, no localStorage). */
  sampleJson: string;
  /** Default indent width for the Formatted tab. */
  defaultTabWidth: TabWidth;
  /** Static reference data for the indent `Select`. */
  tabWidthOptions: TabWidthOption[];
  /** localStorage key for the autosaved document. */
  storageKey: string;
}

const DataProviderContext = createContext<AppDataProvider | null>(null);

export function useDataProvider(): AppDataProvider {
  const ctx = useContext(DataProviderContext);
  if (!ctx) throw new Error("useDataProvider must be used inside a DataProvider");
  return ctx;
}

const clientProvider: AppDataProvider = {
  sampleJson,
  defaultTabWidth,
  tabWidthOptions,
  storageKey: LS_KEY,
};

export function DataProvider({ children }: { children: ReactNode }) {
  return (
    <DataProviderContext.Provider value={clientProvider}>
      {children}
    </DataProviderContext.Provider>
  );
}
