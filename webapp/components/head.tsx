"use client";

import Head from "next/head";
import { useEffect, useState } from "react";

import { APP_CONFIG } from "@/config/apps";
import { useAppParam } from "@/context/AppContext";

export default function DynamicHead() {
  const [mounted, setMounted] = useState(false);
  
  const app = useAppParam();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Head>
      <title>{APP_CONFIG[app].name}</title>
      <link 
        rel="icon" 
        type="image/x-icon" 
        href={APP_CONFIG[app].favicon} 
      />
      <meta 
        name="description" 
        content={APP_CONFIG[app].description} 
      />
      <style>
        {`
          a {
            color: ${APP_CONFIG[app].accentColor} !important;
          }
        `}
      </style>
    </Head>
  );
}
