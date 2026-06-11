"use client";
import { useRef } from "react";
import { Provider } from "react-redux";
import { tpoStore } from "./tpoStore";

export default function StoreProvider({ children }) {
  const storeRef = useRef();
  if (!storeRef.current) {
    storeRef.current = tpoStore;
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}
