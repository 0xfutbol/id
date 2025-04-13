import { AUTH_MESSAGE, MAX_SIGNATURE_EXPIRATION } from "@0xfutbol/id-sign";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Account } from "thirdweb/wallets";

import { OxFUTBOL_ID_REFERRER, useReferrerParam } from "@/hooks";
import { accountService, authService } from "@/services";
import { decodeJWT, getSavedJWT, setSavedJWT } from "@/utils";

import { useWeb3Context } from "./Web3Context";

type AuthContextProviderProps = { children: React.ReactNode };

const useAuthContextState = () => {
  const { activeWallet, disconnect, status } = useWeb3Context();
  const account = activeWallet?.getAccount();

  useReferrerParam();

  const redirectUri = useRef<string | undefined>(undefined);
  const savedJWTChecked = useRef(false);
  const username = useRef<string | undefined>(undefined);
  const validJWT = useRef<string | undefined>(undefined);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isClaimPending, setIsClaimPending] = useState(false);
  const [isWaitingForSignature, setIsWaitingForSignature] = useState(false);

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
      window?.parent?.postMessage({ type: 'JWT', jwt }, redirectUri.current);
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
      window?.parent?.postMessage({ type: 'JWT', jwt: undefined }, redirectUri.current);
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
    const urlParams = new URLSearchParams(window?.location?.search ?? "");
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
    isAuthenticated,
    isClaimPending,
    isWaitingForSignature,
    status,
    username: username.current,
    claim
  };
};

export const AuthContext = React.createContext<ReturnType<typeof useAuthContextState> | undefined>(undefined);

export const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
  const state = useAuthContextState();
  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
	const context = React.useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuthContext must be used within a AuthContextProvider");
	}
	return context;
};