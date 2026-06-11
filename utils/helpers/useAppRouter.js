"use client";
import { useRouter } from "@bprogress/next/app";

/**
 * A central wrapper hook for Next.js navigation.
 * All programmatic routing logic in the application should use this hook 
 * instead of importing from 'next/navigation' or external libraries directly.
 * 
 * If we ever need to swap out progress loader libraries or centralize route interception, 
 * it only needs to be updated here.
 */
export const useAppRouter = () => {
  const router = useRouter();
  return router;
};
