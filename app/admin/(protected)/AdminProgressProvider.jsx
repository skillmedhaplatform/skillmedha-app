"use client";
import { ProgressProvider } from '@bprogress/next/app';
import { Suspense } from 'react';

export default function AdminProgressProvider({ children }) {
  return (
    <Suspense fallback={<div />}>
      <ProgressProvider
        height="3px"
        color="linear-gradient(to right, #1E69DA, #5694F0)"
        options={{ showSpinner: false }}
        shallowRouting
      >
        {children}
      </ProgressProvider>
    </Suspense>
  );
}
