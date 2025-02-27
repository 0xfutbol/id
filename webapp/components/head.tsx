"use client";

import { useEffect } from "react";

import { APP_CONFIG } from "@/config/apps";
import { useAppParam } from "@/context/AppContext";

export default function DynamicHead() {
  const app = useAppParam();

  useEffect(() => {
    // Set page title
    document.title = APP_CONFIG[app].name;

    // Set favicon
    const favicon = document.querySelector("link[rel='icon']") || document.createElement('link') as any;
    favicon.type = "image/x-icon";
    favicon.rel = "icon";
    favicon.href = APP_CONFIG[app].favicon;
    document.head.appendChild(favicon);

    // Set meta description
    const metaDescription = document.querySelector("meta[name='description']") || document.createElement('meta') as any;
    metaDescription.name = "description";
    metaDescription.content = APP_CONFIG[app].description;
    document.head.appendChild(metaDescription);
  }, [app]);

  return null;
}
