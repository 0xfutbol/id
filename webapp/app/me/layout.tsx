"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Navbar } from "@/components/navbar";

const queryClient = new QueryClient();

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
    <div className="flex flex-col items-center px-2">
      <Navbar />
      {children}
    </div>
    </QueryClientProvider>
  );
}
