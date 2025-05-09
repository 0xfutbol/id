import React from "react";

import { OxFutbolIdContext } from "@/providers";

export const useOxFutbolIdContext = () => {
  const context = React.useContext(OxFutbolIdContext);
  if (context === undefined) {
    throw new Error("useOxFutbolIdContext must be used within a OxFutbolIdProvider");
  }
  return context;
};