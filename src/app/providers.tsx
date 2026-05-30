"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 60 * 1000,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#222",
            color: "#fff",
            borderRadius: "16px",
            fontSize: "1.25rem",
            padding: "16px 24px",
            maxWidth: "600px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
