"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useSessionStorage } from "react-use";

const OxFUTBOL_ID_SESSION_APP = "OxFUTBOL_ID_SESSION_APP";

export function useAppParam() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const appParam = searchParams.get("app")?.toUpperCase();
  const [app] = useSessionStorage(OxFUTBOL_ID_SESSION_APP, appParam ?? "ID");

  useEffect(() => {
    if (appParam) {
      // Create a new URLSearchParams object from the current search params
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      // Remove the 'app' parameter
      params.delete("app");
      // Construct the new URL without the 'app' parameter
      const newQueryString = params.toString();
      const newUrl = newQueryString ? `?${newQueryString}` : "/";
      // Replace the current URL without the 'app' parameter
      router.replace(newUrl);
    }
  }, [appParam, router, searchParams]);

  return app;
}