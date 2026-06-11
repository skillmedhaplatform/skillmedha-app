"use client";
import { useSearchParams } from "next/navigation";
import React from "react";
import { Suspense, useEffect, useState } from "react";

const SearchParamsComp = () => {
  const searchQuery = useSearchParams();
  const userId = searchQuery.get("sId");
  const testIdEnc = searchQuery.get("st_d");

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("userId", userId);
      sessionStorage.setItem("testIdEnc", testIdEnc);
    }
  }, [userId, testIdEnc]);
  return <Suspense></Suspense>;
};

export default SearchParamsComp;
