import { useEffect } from "react";
import { useLocalStorage } from "react-use";

export const OxFUTBOL_ID_REFERRER = "OxFUTBOL_ID_REFERRER";

export const useReferrerParam = () => {
  const [, setSavedReferrer] = useLocalStorage<string>(OxFUTBOL_ID_REFERRER);

  useEffect(() => {
    if (!window) return;

    // Parse search params manually from URL
    const urlSearchParams = window.location.search;
    const searchParamsObj = new URLSearchParams(urlSearchParams);
    const referrer = searchParamsObj.get("referrer");

    if (typeof referrer === "string" && referrer.length > 0) {
      setSavedReferrer(referrer);

      // Remove the referrer from the URL
      searchParamsObj.delete("referrer");
      const newPathname = 
        window.location.pathname + (searchParamsObj.toString() ? "?" + searchParamsObj.toString() : "");

      // Update URL without reloading the page
      window.history.replaceState({}, "", newPathname);

    }
  }, [setSavedReferrer]);
};
