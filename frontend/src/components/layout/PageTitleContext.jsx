import { createContext, useContext, useMemo, useState } from "react";

const PageTitleContext = createContext(null);

export function PageTitleProvider({ children }) {
  const [overrideTitle, setOverrideTitle] = useState(null);
  const value = useMemo(
    () => ({ overrideTitle, setOverrideTitle }),
    [overrideTitle]
  );
  return (
    <PageTitleContext.Provider value={value}>{children}</PageTitleContext.Provider>
  );
}

export function usePageTitle() {
  const context = useContext(PageTitleContext);
  if (!context) {
    return { overrideTitle: null, setOverrideTitle: () => {} };
  }
  return context;
}
