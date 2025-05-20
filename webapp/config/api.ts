"use client";

export const API_CONFIG = {
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL ?? 'https://id.0xfutbol.com/api-dev',
} as const;