import { ChainName } from "@0xfutbol/constants";
import { BigNumber, Contract, Signer } from "ethers";
import * as React from "react";
import { createContext, useCallback } from "react";
import { AutoConnect } from "thirdweb/react";
import { createWallet, inAppWallet, walletConnect } from "thirdweb/wallets";
import { MatchIdContextProvider, useMatchIdContext } from "./MatchIdContext";
import { ThirdwebContextProvider, useThirdwebContext } from "./ThirdwebContext";

import { thirdwebClient } from "@/config";

import { useLocalStorage } from "react-use";
import { base } from "thirdweb/chains";

const OxFUTBOL_ID_PROVIDER = "OxFUTBOL_ID_PROVIDER";

export const WALLET_OPTIONS = [
  {
    key: "thirdweb",
    label: "Discord, Telegram, email, and others.",
    description: "Connect with your existing account.",
    icon: (
      <img
        alt="Thirdweb"
        height={48}
        src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSJ1cmwoI3BhaW50MF9yYWRpYWxfNTYxNV8xMjQ2NSkiLz4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzU2MTVfMTI0NjUpIj4KPHBhdGggZD0iTTI0IDI4QzI2LjIwOTEgMjggMjggMjYuMjA5MSAyOCAyNEMyOCAyMS43OTA5IDI2LjIwOTEgMjAgMjQgMjBDMjEuNzkwOSAyMCAyMCAyMS43OTA5IDIwIDI0QzIwIDI2LjIwOTEgMjEuNzkwOSAyOCAyNCAyOFoiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik0yOCAyMFYyNUMyOCAyNS43OTU3IDI4LjMxNjEgMjYuNTU4NyAyOC44Nzg3IDI3LjEyMTNDMjkuNDQxMyAyNy42ODM5IDMwLjIwNDQgMjggMzEgMjhDMzEuNzk1NyAyOCAzMi41NTg3IDI3LjY4MzkgMzMuMTIxMyAyNy4xMjEzQzMzLjY4MzkgMjYuNTU4NyAzNCAyNS43OTU3IDM0IDI1VjI0QzM0IDIxLjc0NzMgMzMuMjM5NCAxOS41NjA2IDMxLjg0MTQgMTcuNzk0MkMzMC40NDM0IDE2LjAyNzcgMjguNDkgMTQuNzg1MSAyNi4yOTc1IDE0LjI2NzVDMjQuMTA1MSAxMy43NSAyMS44MDIxIDEzLjk4NzggMTkuNzYxOCAxNC45NDI2QzE3LjcyMTQgMTUuODk3MyAxNi4wNjMyIDE3LjUxMyAxNS4wNTU3IDE5LjUyNzlDMTQuMDQ4MyAyMS41NDI3IDEzLjc1MDcgMjMuODM4NyAxNC4yMTExIDI2LjA0MzlDMTQuNjcxNSAyOC4yNDkgMTUuODYzIDMwLjIzNDEgMTcuNTkyNSAzMS42Nzc1QzE5LjMyMiAzMy4xMjA5IDIxLjQ4ODMgMzMuOTM4MSAyMy43NDAyIDMzLjk5NjZDMjUuOTkyMSAzNC4wNTUyIDI4LjE5NzkgMzMuMzUxNiAzMCAzMiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9nPgo8ZGVmcz4KPHJhZGlhbEdyYWRpZW50IGlkPSJwYWludDBfcmFkaWFsXzU2MTVfMTI0NjUiIGN4PSIwIiBjeT0iMCIgcj0iMSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIGdyYWRpZW50VHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjUgMjYuNzUpIHJvdGF0ZSg0NS4zNTU5KSBzY2FsZSgyOC40NjE2KSI+CjxzdG9wIHN0b3AtY29sb3I9IiM5MjU3REYiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjNzEwNUZGIi8+CjwvcmFkaWFsR3JhZGllbnQ+CjxjbGlwUGF0aCBpZD0iY2xpcDBfNTYxNV8xMjQ2NSI+CjxyZWN0IHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgZmlsbD0id2hpdGUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEyIDEyKSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+Cjwvc3ZnPgo="
        style={{ borderRadius: 8 }}
        width={48}
      />
    ),
    provider: "thirdweb",
    component: () => <AutoConnect client={thirdwebClient} />,
    wallet: ({ sponsorGas }: { sponsorGas?: boolean }) => inAppWallet({
      auth: {
        options: ["apple", "discord", "google", "telegram", "email", "passkey"],
        
      },
      smartAccount: sponsorGas ? {
        chain: base,
        sponsorGas: sponsorGas,
      } : undefined
    }),
  },
  {
    key: "matchain_id",
    label: "Matchain ID",
    description: "Use Matchain ID to connect",
    icon: (
      <img
        alt="Matchain ID"
        height={48}
        src="data:image/jpg;base64,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"
        style={{ borderRadius: 8 }}
        width={48}
      />
    ),
    provider: "matchain_id",
    wallet: () => undefined
  },
  {
    key: "metamask",
    label: "MetaMask",
    description: "Use your MetaMask wallet to connect",
    icon: (
      <img
        alt="MetaMask"
        height={48}
        src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTIiIGZpbGw9IiNGRkU2Q0UiLz4KPHBhdGggZD0iTTY0Ljk3MTIgMTQuMTc5TDQzLjI5MDMgMzAuMjgxN0w0Ny4yOTk2IDIwLjc4MTRMNjQuOTcxMiAxNC4xNzlaIiBmaWxsPSIjRTI3NjFCIiBzdHJva2U9IiNFMjc2MUIiIHN0cm9rZS13aWR0aD0iMC4xMjQ1MTQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cGF0aCBkPSJNMTQuOTE5OCAxNC4xNzlMMzYuNDI2NCAzMC40MzQzTDMyLjYxMzIgMjAuNzgxNEwxNC45MTk4IDE0LjE3OVpNNTcuMTcwNCA1MS41MDUxTDUxLjM5NjEgNjAuMzUxOEw2My43NTEgNjMuNzUxTDY3LjMwMjcgNTEuNzAxMkw1Ny4xNzA0IDUxLjUwNTFaTTEyLjYzMTkgNTEuNzAxMkwxNi4xNjE5IDYzLjc1MUwyOC41MTY3IDYwLjM1MThMMjIuNzQyNCA1MS41MDUxTDEyLjYzMTkgNTEuNzAxMloiIGZpbGw9IiNFNDc2MUIiIHN0cm9rZT0iI0U0NzYxQiIgc3Ryb2tlLXdpZHRoPSIwLjEyNDUxNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik0yNy44MTk0IDM2LjU1NzJMMjQuMzc2NiA0MS43NjVMMzYuNjQ0NCA0Mi4zMDk3TDM2LjIwODYgMjkuMTI2OEwyNy44MTk0IDM2LjU1NzJaTTUyLjA3MTYgMzYuNTU3Mkw0My41NzM1IDI4Ljk3NDNMNDMuMjkwMyA0Mi4zMDk3TDU1LjUzNjIgNDEuNzY1TDUyLjA3MTYgMzYuNTU3MlpNMjguNTE2NyA2MC4zNTE3TDM1Ljg4MTcgNTYuNzU2NEwyOS41MTkxIDUxLjc4ODNMMjguNTE2NyA2MC4zNTE3Wk00NC4wMDkzIDU2Ljc1NjRMNTEuMzk2MSA2MC4zNTE3TDUwLjM3MiA1MS43ODgzTDQ0LjAwOTMgNTYuNzU2NFoiIGZpbGw9IiNFNDc2MUIiIHN0cm9rZT0iI0U0NzYxQiIgc3Ryb2tlLXdpZHRoPSIwLjEyNDUxNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik01MS4zOTYxIDYwLjM1MTdMNDQuMDA5MyA1Ni43NTY0TDQ0LjU5NzcgNjEuNTcyTDQ0LjUzMjMgNjMuNTk4NEw1MS4zOTYxIDYwLjM1MTdaTTI4LjUxNjcgNjAuMzUxN0wzNS4zODA1IDYzLjU5ODRMMzUuMzM3IDYxLjU3MkwzNS44ODE3IDU2Ljc1NjRMMjguNTE2NyA2MC4zNTE3WiIgZmlsbD0iI0Q3QzFCMyIgc3Ryb2tlPSIjRDdDMUIzIiBzdHJva2Utd2lkdGg9IjAuMTI0NTE0IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHBhdGggZD0iTTM1LjQ4OTUgNDguNjA3TDI5LjM0NDcgNDYuNzk4NEwzMy42ODA5IDQ0LjgxNTZMMzUuNDg5NSA0OC42MDdaTTQ0LjQwMTUgNDguNjA3TDQ2LjIxMDEgNDQuODE1Nkw1MC41NjgxIDQ2Ljc5ODRMNDQuNDAxNSA0OC42MDdaIiBmaWxsPSIjMjMzNDQ3IiBzdHJva2U9IiMyMzM0NDciIHN0cm9rZS13aWR0aD0iMC4xMjQ1MTQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cGF0aCBkPSJNMjguNTE2NyA2MC4zNTE3TDI5LjU2MjYgNTEuNTA1TDIyLjc0MjQgNTEuNzAxMUwyOC41MTY3IDYwLjM1MTdaTTUwLjM1MDIgNTEuNTA1TDUxLjM5NjEgNjAuMzUxN0w1Ny4xNzA0IDUxLjcwMTFMNTAuMzUwMiA1MS41MDVaTTU1LjUzNjIgNDEuNzY1TDQzLjI5MDMgNDIuMzA5N0w0NC40MjMzIDQ4LjYwN0w0Ni4yMzE5IDQ0LjgxNTVMNTAuNTg5OSA0Ni43OTg0TDU1LjUzNjIgNDEuNzY1Wk0yOS4zNDQ3IDQ2Ljc5ODRMMzMuNzAyNyA0NC44MTU1TDM1LjQ4OTUgNDguNjA3TDM2LjY0NDMgNDIuMzA5N0wyNC4zNzY2IDQxLjc2NUwyOS4zNDQ3IDQ2Ljc5ODRaIiBmaWxsPSIjQ0Q2MTE2IiBzdHJva2U9IiNDRDYxMTYiIHN0cm9rZS13aWR0aD0iMC4xMjQ1MTQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cGF0aCBkPSJNMjQuMzc2NiA0MS43NjVMMjkuNTE5MSA1MS43ODgzTDI5LjM0NDcgNDYuNzk4NEwyNC4zNzY2IDQxLjc2NVpNNTAuNTg5OSA0Ni43OTg0TDUwLjM3MiA1MS43ODgzTDU1LjUzNjIgNDEuNzY1TDUwLjU4OTkgNDYuNzk4NFpNMzYuNjQ0NCA0Mi4zMDk3TDM1LjQ4OTUgNDguNjA3TDM2LjkyNzYgNTYuMDM3M0wzNy4yNTQ1IDQ2LjI1MzdMMzYuNjQ0NCA0Mi4zMDk3Wk00My4yOTAzIDQyLjMwOTdMNDIuNzAxOSA0Ni4yMzE5TDQyLjk2MzQgNTYuMDM3M0w0NC40MjMzIDQ4LjYwN0w0My4yOTAzIDQyLjMwOTdaIiBmaWxsPSIjRTQ3NTFGIiBzdHJva2U9IiNFNDc1MUYiIHN0cm9rZS13aWR0aD0iMC4xMjQ1MTQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cGF0aCBkPSJNNDQuNDIzMyA0OC42MDdMNDIuOTYzNCA1Ni4wMzc0TDQ0LjAwOTMgNTYuNzU2NEw1MC4zNzIgNTEuNzg4M0w1MC41ODk5IDQ2Ljc5ODVMNDQuNDIzMyA0OC42MDdaTTI5LjM0NDcgNDYuNzk4NUwyOS41MTkgNTEuNzg4M0wzNS44ODE3IDU2Ljc1NjRMMzYuOTI3NiA1Ni4wMzc0TDM1LjQ4OTUgNDguNjA3TDI5LjM0NDcgNDYuNzk4NVoiIGZpbGw9IiNGNjg1MUIiIHN0cm9rZT0iI0Y2ODUxQiIgc3Ryb2tlLXdpZHRoPSIwLjEyNDUxNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik00NC41MzIzIDYzLjU5ODRMNDQuNTk3NyA2MS41NzJMNDQuMDUyOSA2MS4wOTI2SDM1LjgzODFMMzUuMzM3IDYxLjU3MkwzNS4zODA1IDYzLjU5ODRMMjguNTE2NyA2MC4zNTE3TDMwLjkxMzYgNjIuMzEyOEwzNS43NzI4IDY1LjY5MDNINDQuMTE4M0w0OC45OTkyIDYyLjMxMjhMNTEuMzk2MSA2MC4zNTE3TDQ0LjUzMjMgNjMuNTk4NFoiIGZpbGw9IiNDMEFEOUUiIHN0cm9rZT0iI0MwQUQ5RSIgc3Ryb2tlLXdpZHRoPSIwLjEyNDUxNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik00NC4wMDkzIDU2Ljc1NjRMNDIuOTYzNCA1Ni4wMzc0SDM2LjkyNzZMMzUuODgxNyA1Ni43NTY0TDM1LjMzNyA2MS41NzJMMzUuODM4MSA2MS4wOTI2SDQ0LjA1MjlMNDQuNTk3NyA2MS41NzJMNDQuMDA5MyA1Ni43NTY0WiIgZmlsbD0iIzE2MTYxNiIgc3Ryb2tlPSIjMTYxNjE2IiBzdHJva2Utd2lkdGg9IjAuMTI0NTE0IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHBhdGggZD0iTTY1Ljg4NjQgMzEuMzI3N0w2Ny43Mzg1IDIyLjQzNzRMNjQuOTcxMiAxNC4xNzlMNDQuMDA5MyAyOS43MzdMNTIuMDcxNiAzNi41NTcyTDYzLjQ2NzcgMzkuODkxMUw2NS45OTUzIDM2Ljk0OTRMNjQuOTA1OCAzNi4xNjVMNjYuNjQ5IDM0LjU3NDNMNjUuMjk4MSAzMy41Mjg0TDY3LjA0MTIgMzIuMTk5Mkw2NS44ODY0IDMxLjMyNzdaTTEyLjE3NDMgMjIuNDM3NEwxNC4wMjY1IDMxLjMyNzdMMTIuODQ5OCAzMi4xOTkyTDE0LjU5MyAzMy41Mjg0TDEzLjI2MzggMzQuNTc0M0wxNS4wMDcgMzYuMTY1TDEzLjkxNzUgMzYuOTQ5NEwxNi40MjMzIDM5Ljg5MTFMMjcuODE5NSAzNi41NTcyTDM1Ljg4MTcgMjkuNzM3TDE0LjkxOTggMTQuMTc5TDEyLjE3NDMgMjIuNDM3NFoiIGZpbGw9IiM3NjNEMTYiIHN0cm9rZT0iIzc2M0QxNiIgc3Ryb2tlLXdpZHRoPSIwLjEyNDUxNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik02My40Njc3IDM5Ljg5MUw1Mi4wNzE2IDM2LjU1NzJMNTUuNTM2MiA0MS43NjVMNTAuMzcyIDUxLjc4ODNMNTcuMTcwNCA1MS43MDEySDY3LjMwMjdMNjMuNDY3NyAzOS44OTFaTTI3LjgxOTQgMzYuNTU3MkwxNi40MjMzIDM5Ljg5MUwxMi42MzE5IDUxLjcwMTJIMjIuNzQyNEwyOS41MTkxIDUxLjc4ODNMMjQuMzc2NiA0MS43NjVMMjcuODE5NCAzNi41NTcyWk00My4yOTAzIDQyLjMwOTdMNDQuMDA5MyAyOS43MzdMNDcuMzIxNCAyMC43ODEzSDMyLjYxMzJMMzUuODgxNyAyOS43MzdMMzYuNjQ0MyA0Mi4zMDk3TDM2LjkwNTggNDYuMjc1NUwzNi45Mjc2IDU2LjAzNzNINDIuOTYzNEw0My4wMDcgNDYuMjc1NUw0My4yOTAzIDQyLjMwOTdaIiBmaWxsPSIjRjY4NTFCIiBzdHJva2U9IiNGNjg1MUIiIHN0cm9rZS13aWR0aD0iMC4xMjQ1MTQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K"
        width={48}
      />
    ),
    provider: "thirdweb",
    component: () => <AutoConnect client={thirdwebClient} />,
    wallet: () => createWallet("io.metamask")
  },
  {
    key: "walletconnect",
    label: "WalletConnect",
    description: "Scan with WalletConnect to connect",
    icon: (
      <img
        alt="WalletConnect"
        height={48}
        src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTIiIGZpbGw9IiMxQzdERkMiLz4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTIiIGZpbGw9InVybCgjcGFpbnQwX3JhZGlhbF8xXzQ2KSIvPgo8cGF0aCBkPSJNMjYuNDIyNyAzMS40NzMxQzMzLjkxNzEgMjQuMTc1NiA0Ni4wODI5IDI0LjE3NTYgNTMuNTc3MyAzMS40NzMxTDU0LjQ3OTYgMzIuMzU4QzU0Ljg1OCAzMi43MjA3IDU0Ljg1OCAzMy4zMTU1IDU0LjQ3OTYgMzMuNjc4Mkw1MS4zOTQ1IDM2LjY4MTNDNTEuMjA1MyAzNi44Njk5IDUwLjg5OTcgMzYuODY5OSA1MC43MTA1IDM2LjY4MTNMNDkuNDczNiAzNS40NzcyQzQ0LjIzNDcgMzAuMzg1IDM1Ljc2NTMgMzAuMzg1IDMwLjUyNjQgMzUuNDc3MkwyOS4yMDIxIDM2Ljc2ODRDMjkuMDEzIDM2Ljk1NyAyOC43MDc0IDM2Ljk1NyAyOC41MTgyIDM2Ljc2ODRMMjUuNDMzMSAzMy43NjUzQzI1LjA1NDcgMzMuNDAyNiAyNS4wNTQ3IDMyLjgwNzggMjUuNDMzMSAzMi40NDUxTDI2LjQyMjcgMzEuNDczMVpNNTkuOTY1OCAzNy42ODI0TDYyLjcxNjIgNDAuMzUxOEM2My4wOTQ2IDQwLjcxNDUgNjMuMDk0NiA0MS4zMDkzIDYyLjcxNjIgNDEuNjcyTDUwLjMzMjIgNTMuNzI4QzQ5Ljk1MzggNTQuMDkwNyA0OS4zNDI2IDU0LjA5MDcgNDguOTc4OCA1My43MjhMNDAuMTg5MiA0NS4xNjg0QzQwLjEwMTkgNDUuMDgxMyAzOS45NDE4IDQ1LjA4MTMgMzkuODU0NSA0NS4xNjg0TDMxLjA2NDkgNTMuNzI4QzMwLjY4NjUgNTQuMDkwNyAzMC4wNzUzIDU0LjA5MDcgMjkuNzExNSA1My43MjhMMTcuMjgzOCA0MS42NzJDMTYuOTA1NCA0MS4zMDkzIDE2LjkwNTQgNDAuNzE0NSAxNy4yODM4IDQwLjM1MThMMjAuMDM0MiAzNy42ODI0QzIwLjQxMjUgMzcuMzE5NyAyMS4wMjM3IDM3LjMxOTcgMjEuMzg3NSAzNy42ODI0TDMwLjE3NzIgNDYuMjQyQzMwLjI2NDUgNDYuMzI5IDMwLjQyNDUgNDYuMzI5IDMwLjUxMTkgNDYuMjQyTDM5LjMwMTUgMzcuNjgyNEMzOS42Nzk5IDM3LjMxOTcgNDAuMjkxIDM3LjMxOTcgNDAuNjU0OSAzNy42ODI0TDQ5LjQ0NDUgNDYuMjQyQzQ5LjUzMTggNDYuMzI5IDQ5LjY5MTkgNDYuMzI5IDQ5Ljc3OTIgNDYuMjQyTDU4LjU2ODggMzcuNjgyNEM1OC45NzYzIDM3LjMxOTcgNTkuNTg3NSAzNy4zMTk3IDU5Ljk2NTggMzcuNjgyNFoiIGZpbGw9IndoaXRlIi8+CjxkZWZzPgo8cmFkaWFsR3JhZGllbnQgaWQ9InBhaW50MF9yYWRpYWxfMV80NiIgY3g9IjAiIGN5PSIwIiByPSIxIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgZ3JhZGllbnRUcmFuc2Zvcm09InRyYW5zbGF0ZSgwLjAwMDI0Nzk1NSA0MC4wMDEyKSBzY2FsZSg4MCkiPgo8c3RvcCBzdG9wLWNvbG9yPSIjNUQ5REY2Ii8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzAwNkZGRiIvPgo8L3JhZGlhbEdyYWRpZW50Pgo8L2RlZnM+Cjwvc3ZnPgo="
        width={48}
      />
    ),
    provider: "thirdweb",
    wallet: () => walletConnect()
  },
];

type Web3ContextProviderProps = {
  chains: Array<ChainName>;
  children: React.ReactNode;
  sponsorGas?: boolean;
}

export type Web3ContextState = {
  address?: string;
  chainId?: number;
  defaultChain?: ChainName;
  signer?: Record<ChainName, Signer>;
  status: "disconnected" | "connecting" | "connected" | "unknown";
  userDetails?: Array<{
    provider: string;
  } & Record<string, any>>;
  walletProvider: "matchain_id" | "thirdweb" | "unknown";
  web3Ready: boolean;
  connect: (walletKey: string) => Promise<void>;
  disconnect: () => Promise<void>;
  nativeBalanceOf: (address: string, chainId: number) => Promise<BigNumber>;
  newContract: (chain: ChainName, contractAddress: string, contractAbi: any) => Contract;
  switchChain: (chain: ChainName) => Promise<void>;
}

const useWeb3ContextState = (sponsorGas?: boolean): Web3ContextState => {
  const matchIdContext = useMatchIdContext();
  const thirdwebContext = useThirdwebContext();

  const [walletProvider, setWalletProvider] = useLocalStorage<"matchain_id" | "thirdweb" | "unknown">(OxFUTBOL_ID_PROVIDER, "unknown");

  const connect = useCallback(async (walletKey: string) => {
    const option = WALLET_OPTIONS.find((option) => option.key === walletKey);

    if (!option) {
      throw new Error(`Invalid wallet key: ${walletKey}`);
    }

    if (option.provider === "thirdweb") {
      await thirdwebContext.connect(option.wallet({ sponsorGas })!);
    } else if (option.provider === "matchain_id") {
      await matchIdContext.connect();
    } else {
      throw new Error(`Invalid provider: ${option.provider}`);
    }

    setWalletProvider(option.provider);
  }, [matchIdContext, thirdwebContext]);

  const newContract = useCallback((chain: ChainName, contractAddress: string, contractAbi: any) => {
    const signer = (() => {
      switch (walletProvider) {
        case "matchain_id":
          return matchIdContext.signer;
        case "thirdweb":
          return thirdwebContext.signer;
        default:
          console.error(`[0xFútbol ID] Invalid provider: ${walletProvider}`);
          throw new Error(`Invalid provider: ${walletProvider}`);
      }
    })();

    return new Contract(contractAddress, contractAbi, signer?.[chain]);
  }, [matchIdContext, thirdwebContext, walletProvider]);

  const disconnect = useCallback(async () => {
    if (walletProvider === "thirdweb") {
      await thirdwebContext.disconnect();
    } else if (walletProvider === "matchain_id") {
      await matchIdContext.disconnect();
    } else {
      throw new Error(`Invalid provider: ${walletProvider}`);
    }
  }, [matchIdContext, thirdwebContext, walletProvider]);

  const nativeBalanceOf = useCallback(async (address: string, chainId: number) => {
    if (walletProvider === "thirdweb") {
      return thirdwebContext.nativeBalanceOf(address, chainId);
    } else if (walletProvider === "matchain_id") {
      return matchIdContext.nativeBalanceOf(address, chainId);
    } else {
      console.warn("No provider found for native balance of", address, chainId);
      return BigNumber.from(0);
    }
  }, [matchIdContext, thirdwebContext, walletProvider]);

  const switchChain = useCallback(async (chain: ChainName) => {
    if (walletProvider === "thirdweb") {
      await thirdwebContext.switchChain(chain);
    } else if (walletProvider === "matchain_id") {
      await matchIdContext.switchChain(chain);
    }
  }, [matchIdContext, thirdwebContext, walletProvider]);

  return {
    address: {
      matchain_id: matchIdContext.address,
      thirdweb: thirdwebContext.address,
      unknown: undefined
    }[walletProvider!],
    chainId: {
      matchain_id: matchIdContext.chainId,
      thirdweb: thirdwebContext.chainId,
      unknown: undefined
    }[walletProvider!],
    defaultChain: {
      matchain_id: "matchain" as ChainName,
      thirdweb: "xdc" as ChainName,
      unknown: undefined
    }[walletProvider!],
    signer: {
      matchain_id: matchIdContext.signer,
      thirdweb: thirdwebContext.signer,
      unknown: undefined
    }[walletProvider!],
    status: {
      matchain_id: matchIdContext.status,
      thirdweb: thirdwebContext.status,
      unknown: "disconnected" as const
    }[walletProvider!],
    userDetails: {
      matchain_id: undefined,
      thirdweb: thirdwebContext.userDetails,
      unknown: undefined
    }[walletProvider!],
    walletProvider: walletProvider!,
    web3Ready: matchIdContext.web3Ready && thirdwebContext.web3Ready,
    connect,
    disconnect,
    nativeBalanceOf,
    newContract,
    switchChain
  };
};

export const Web3Context = createContext<ReturnType<typeof useWeb3ContextState> | undefined>(undefined);

function Web3ContextInnerProvider({ children, sponsorGas }: Omit<Web3ContextProviderProps, "chains">) {
  const state = useWeb3ContextState(sponsorGas);

  return (
    <Web3Context.Provider value={state}>
      {children}
    </Web3Context.Provider>
  );
}

export function Web3ContextProvider({ chains, children, sponsorGas }: Web3ContextProviderProps) {
  return (
    <ThirdwebContextProvider chains={chains}>
      <MatchIdContextProvider chains={chains}>
        <Web3ContextInnerProvider sponsorGas={sponsorGas}>
          {children}
        </Web3ContextInnerProvider>
      </MatchIdContextProvider>
    </ThirdwebContextProvider>
  );
}

export const useWeb3Context = () => {
	const context = React.useContext(Web3Context);
	if (context === undefined) {
		throw new Error("useWeb3Context must be used within a Web3ContextProvider");
	}
	return context;
};
