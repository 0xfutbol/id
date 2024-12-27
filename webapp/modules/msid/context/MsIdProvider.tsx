import { authService } from "@/modules/msid/services/AuthService";
import { decodeJWT } from "@/utils/decodeJWT";
import { AUTH_MESSAGE, MAX_SIGNATURE_EXPIRATION, OxFUTBOL_LOCAL_STORAGE_KEY } from "@0xfutbol/id";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useActiveWallet, useActiveWalletConnectionStatus, useDisconnect } from "thirdweb/react";
import { Account } from "thirdweb/wallets";
import { accountService } from "../services/AccountService";
import { OxFUTBOL_ID_REFERRER, useReferrerParam } from "./useReferrerParam";

export const getSavedJWT = (): string | undefined => {
  return localStorage?.getItem(OxFUTBOL_LOCAL_STORAGE_KEY)?.replaceAll("\"", "") || undefined;
};

export const setSavedJWT = (jwt: string | undefined) => {
  if (jwt) {
    console.debug("[0xFútbol ID] Setting JWT in localStorage:", jwt);
    localStorage?.setItem(OxFUTBOL_LOCAL_STORAGE_KEY, jwt);
  } else {
    console.debug("[0xFútbol ID] Removing JWT from localStorage");
    localStorage?.removeItem(OxFUTBOL_LOCAL_STORAGE_KEY);
  }
};

type MsIdContextProviderProps = { children: React.ReactNode };

const useMsIdState = () => {
  const status = useActiveWalletConnectionStatus();
  const activeWallet = useActiveWallet();
  const account = activeWallet?.getAccount();

  const { disconnect } = useDisconnect();

  useReferrerParam();

  const redirectUri = useRef<string | undefined>(undefined);
  const savedJWTChecked = useRef(false);
  const username = useRef<string | undefined>(undefined);
  const validJWT = useRef<string | undefined>(undefined);

  const [isClaimPending, setIsClaimPending] = useState(false);
  const [isWaitingForSignature, setIsWaitingForSignature] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const claim = useCallback(async (username: string) => {
    console.debug("[0xFútbol ID] Claiming username:", username);
    if (!account) throw new Error("No account found");

    const { claimed, signature, signatureExpiration } = await authService.sign(username, account.address);
    console.debug("[0xFútbol ID] Claim signature response:", { claimed, signature, signatureExpiration });

    const handleClaimedUsername = async (username: string) => {
      console.debug("[0xFútbol ID] Handling claimed username:", username);
      const expiration = Date.now() + MAX_SIGNATURE_EXPIRATION;
      const message = AUTH_MESSAGE.replace("{username}", username).replace("{expiration}", expiration.toString());
      setIsWaitingForSignature(true);
      try {
        const signedMessage = await account.signMessage({ message });
        console.debug("[0xFútbol ID] Signed message:", signedMessage);
        const jwt = await authService.getJWT(username, signedMessage, expiration);
        console.debug("[0xFútbol ID] JWT received");
        login(jwt);
      } finally {
        setIsWaitingForSignature(false);
      }
    };

    const handleUnclaimedUsername = async (username: string) => {
      console.debug("[0xFútbol ID] Handling unclaimed username:", username);
      const expiration = Date.now() + MAX_SIGNATURE_EXPIRATION;
      const message = AUTH_MESSAGE.replace("{username}", username).replace("{expiration}", expiration.toString());
      setIsWaitingForSignature(true);
      try {
        const signedMessage = await account.signMessage({ message });
        console.debug("[0xFútbol ID] Signed message:", signedMessage);
        await authService.claim(username, account.address, signedMessage, expiration);
        console.debug("[0xFútbol ID] Registered username");
        const jwt = await authService.getJWT(username, signedMessage, expiration);
        console.debug("[0xFútbol ID] JWT received");
        login(jwt);
      } finally {
        setIsWaitingForSignature(false);
      }
    };

    if (claimed) {
      return handleClaimedUsername(username);
    } else {
      return handleUnclaimedUsername(username);
    }
  }, [account, activeWallet]);

  const login = useCallback((jwt: string) => {
    console.debug("[0xFútbol ID] Logging in with JWT");

    setIsAuthenticated(true);
    setSavedJWT(jwt);

    username.current = decodeJWT(jwt).payload.username;
    validJWT.current = jwt;

    console.debug("[0xFútbol ID] Posting JWT to redirect URI:", redirectUri.current);

    if (redirectUri.current) {
      window.parent.postMessage({ type: 'JWT', jwt }, redirectUri.current);
    }
  }, []);

  const logout = useCallback(() => {
    console.debug("[0xFútbol ID] Logging out");

    if (activeWallet) {
      disconnect(activeWallet);
    }

    setIsAuthenticated(false);
    setIsClaimPending(false);
    setIsWaitingForSignature(false);
    setSavedJWT(undefined);

    username.current = undefined;
    validJWT.current = undefined;

    if (redirectUri.current) {
      window.parent.postMessage({ type: 'JWT', jwt: undefined }, redirectUri.current);
    }
  }, [activeWallet, disconnect]);

  const signForJWT = useCallback(async (account: Account, username: string) => {
    console.debug("[0xFútbol ID] Signing for JWT with username:", username);
    const expiration = Date.now() + MAX_SIGNATURE_EXPIRATION;
    const message = AUTH_MESSAGE.replace("{username}", username).replace("{expiration}", expiration.toString());

    setIsWaitingForSignature(true);
    try {
      const signedMessage = await account.signMessage({ message });
      console.debug("[0xFútbol ID] Signed message for JWT:", signedMessage);
      return await authService.getJWT(username, signedMessage, expiration);
    } finally {
      setIsWaitingForSignature(false);
    }
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const uri = urlParams.get('redirect_uri');
    console.debug("[0xFútbol ID] Redirect URI:", uri);
    redirectUri.current = uri ?? undefined;
  }, []);

  useEffect(() => {
    if (!account?.address) return;

    const checkExistingToken = async () => {
      console.debug("[0xFútbol ID] Checking existing token for account:", account.address);
      const existingJWT = getSavedJWT();
      const existingToken = existingJWT ? decodeJWT(existingJWT).payload : undefined;
      const existingTokenExpiration = existingToken?.expiration;
      const existingTokenOwner = existingToken?.owner;

      if (existingJWT && existingTokenExpiration && existingTokenExpiration >= Date.now() && 
          existingTokenOwner && existingTokenOwner.toLowerCase() === account.address.toLowerCase()) {
        console.debug("[0xFútbol ID] Existing valid JWT found");
        login(existingJWT);
      } else {
        console.debug("[0xFútbol ID] Checking account:", account.address);
        const { username } = await authService.pre(account.address);
        if (username) {
          console.debug("[0xFútbol ID] Username found for account:", username);
          const jwt = await signForJWT(account, username);
          login(jwt)
        } else {
          console.debug("[0xFútbol ID] No username found, claim pending");
          setIsClaimPending(true);
        }
      }

      savedJWTChecked.current = true;
    };

    const pingAccount = async () => {
      console.debug("[0xFútbol ID] Pinging account service with address:", account.address);
      accountService.ping(account.address, localStorage.getItem(OxFUTBOL_ID_REFERRER) ?? undefined);
    };

    checkExistingToken();
    pingAccount();
  }, [account?.address]);

  useEffect(() => {
    if (!savedJWTChecked.current) return;

    if (status === "disconnected") {
      console.debug("[0xFútbol ID] Status is disconnected, logging out");
      logout();
    }
  }, [status, logout]);

  return {
    address: account?.address,
    clientId: decodeURIComponent(redirectUri.current ?? "undefined"),
    isAuthenticated,
    isClaimPending,
    isWaitingForSignature,
    status,
    username: username.current,
    claim
  };
};

const MsIdContext = React.createContext<ReturnType<typeof useMsIdState> | undefined>(undefined);

const MsIdContextProvider = ({ children }: MsIdContextProviderProps) => {
  const state = useMsIdState();
  return <MsIdContext.Provider value={state}>{children}</MsIdContext.Provider>;
};

export { MsIdContext, MsIdContextProvider };
