"use client";
import { useRef } from "react";
import { Provider } from "react-redux";
import { companyStore } from "./companyStore";

export default function CompanyStoreProvider({ children }) {
  const storeRef = useRef();
  if (!storeRef.current) {
    storeRef.current = companyStore;
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}
