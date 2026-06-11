"use client";
import { useRef } from "react";
import { Provider } from "react-redux";
import { testportalStore } from "./testportalStore";

export default function StoreProvider({ children }) {
  const storeRef = useRef();
  if (!storeRef.current) {
    storeRef.current = testportalStore;
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}
