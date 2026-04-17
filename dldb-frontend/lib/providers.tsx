"use client";

import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { makeStore, setupListeners, type AppStore } from "./store";

export function Providers({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }
  useEffect(() => {
    if (storeRef.current) {
      return setupListeners(storeRef.current.dispatch);
    }
  }, []);
  return <Provider store={storeRef.current}>{children}</Provider>;
}
