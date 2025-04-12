"use client";

import { AuthScreen } from "@0xfutbol/id";

import { APP_CONFIG } from "@/config/apps";
import { useAppParam } from "@/context/AppContext";

export default function Login() {
  const app = useAppParam();

  return (
    <AuthScreen
      appName={APP_CONFIG[app].name}
      background={APP_CONFIG[app].background}
      color={APP_CONFIG[app].accentColor}
      logo={APP_CONFIG[app].logo}
      pre={APP_CONFIG[app].pre}
    />
  );
}
