"use client";
import { ProgressProvider } from "@bprogress/next/app";

const Providers = ({ children }) => {
    return (
        <ProgressProvider
            height="4px"
            color="linear-gradient(to right, #1E69DA, #5694F0)"
            options={{ showSpinner: false }}
            shallowRouting
        >
            {children}
        </ProgressProvider>
    );
};

export default Providers;