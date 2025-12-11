"use client";

export const API_CONFIG = {
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL ?? 'https://id.0xfutbol.com/api',
  waasBaseUrl: process.env.NEXT_PUBLIC_WAAS_BASE_URL ?? '',
} as const;
