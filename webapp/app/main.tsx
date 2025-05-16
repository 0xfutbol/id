"use client";

import { OxFutbolIdProvider } from "@0xfutbol/id";
import flagsmith from "flagsmith";
import { FlagsmithProvider } from "flagsmith/react";
import { ThemeProviderProps } from "next-themes/dist/types";
import { useEffect } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import { AuthGuard } from "@/components/auth-guard";
import LoadingScreen from "@/components/loading-screen";
import { API_CONFIG } from "@/config/api";
import { persistor, store } from "@/store";
import { selectIsMounted, setMounted } from "@/store/features/app";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { ToastProvider, HeroUIProvider as UIProvider } from "@heroui/react";
import { useRouter } from "next/navigation";

const FLAGSMITH_OPTIONS = {
  environmentID: process.env.NEXT_PUBLIC_FLAG_ENVIRONMENT_ID ?? "LC7s8jPGYB5aK5smocTyQq",
  cacheFlags: true,
};

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

function MainContent({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const isMounted = useAppSelector(selectIsMounted);

  useEffect(() => {
    dispatch(setMounted(true));
  }, [dispatch]);

  if (!isMounted) {
    return (<LoadingScreen />);
  }

  return (
    <OxFutbolIdProvider backendUrl={API_CONFIG.backendUrl} chains={["base", "boba", "matchain", "polygon", "xdc"]}>
      <FlagsmithProvider flagsmith={flagsmith} options={FLAGSMITH_OPTIONS}>
        <AuthGuard>{children}</AuthGuard>
      </FlagsmithProvider>
    </OxFutbolIdProvider>
  );
}

export default function Main({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <UIProvider navigate={router.push}>
      <ReduxProvider store={store}>
        <PersistGate loading={<LoadingScreen />} persistor={persistor}>
          <MainContent>{children}</MainContent>
          <ToastProvider placement="bottom-center" />
        </PersistGate>
      </ReduxProvider>
    </UIProvider>
  );
}
