"use client";
import { ProgressProvider } from "@bprogress/next/app";

const Providers = ({ children }) => {
    return (
        <ProgressProvider
            height="4px"
            color="#24A058"
            options={{ showSpinner: false }}
            shallowRouting
        >
            {children}
        </ProgressProvider>
    );
};

export default Providers;