"use client";

import { siteConfig } from "@/config/site";
import { useMsIdContext } from "@/modules/msid/context/useMsIdContext";
import { getImgUrl } from "@/utils/getImgUrl";
import { Link, Listbox, ListboxItem } from "@nextui-org/react";
import Image from 'next/image';
import { ConnectButton } from "thirdweb/react";
import { createWallet, inAppWallet } from "thirdweb/wallets";

const walletOptions = [
  {
    key: "metamask",
    label: "MetaMask",
    description: "Recommended",
    icon: <Image src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTIiIGZpbGw9IiNGRkU2Q0UiLz4KPHBhdGggZD0iTTY0Ljk3MTIgMTQuMTc5TDQzLjI5MDMgMzAuMjgxN0w0Ny4yOTk2IDIwLjc4MTRMNjQuOTcxMiAxNC4xNzlaIiBmaWxsPSIjRTI3NjFCIiBzdHJva2U9IiNFMjc2MUIiIHN0cm9rZS13aWR0aD0iMC4xMjQ1MTQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cGF0aCBkPSJNMTQuOTE5OCAxNC4xNzlMMzYuNDI2NCAzMC40MzQzTDMyLjYxMzIgMjAuNzgxNEwxNC45MTk4IDE0LjE3OVpNNTcuMTcwNCA1MS41MDUxTDUxLjM5NjEgNjAuMzUxOEw2My43NTEgNjMuNzUxTDY3LjMwMjcgNTEuNzAxMkw1Ny4xNzA0IDUxLjUwNTFaTTEyLjYzMTkgNTEuNzAxMkwxNi4xNjE5IDYzLjc1MUwyOC41MTY3IDYwLjM1MThMMjIuNzQyNCA1MS41MDUxTDEyLjYzMTkgNTEuNzAxMloiIGZpbGw9IiNFNDc2MUIiIHN0cm9rZT0iI0U0NzYxQiIgc3Ryb2tlLXdpZHRoPSIwLjEyNDUxNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik0yNy44MTk0IDM2LjU1NzJMMjQuMzc2NiA0MS43NjVMMzYuNjQ0NCA0Mi4zMDk3TDM2LjIwODYgMjkuMTI2OEwyNy44MTk0IDM2LjU1NzJaTTUyLjA3MTYgMzYuNTU3Mkw0My41NzM1IDI4Ljk3NDNMNDMuMjkwMyA0Mi4zMDk3TDU1LjUzNjIgNDEuNzY1TDUyLjA3MTYgMzYuNTU3MlpNMjguNTE2NyA2MC4zNTE3TDM1Ljg4MTcgNTYuNzU2NEwyOS41MTkxIDUxLjc4ODNMMjguNTE2NyA2MC4zNTE3Wk00NC4wMDkzIDU2Ljc1NjRMNTEuMzk2MSA2MC4zNTE3TDUwLjM3MiA1MS43ODgzTDQ0LjAwOTMgNTYuNzU2NFoiIGZpbGw9IiNFNDc2MUIiIHN0cm9rZT0iI0U0NzYxQiIgc3Ryb2tlLXdpZHRoPSIwLjEyNDUxNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik01MS4zOTYxIDYwLjM1MTdMNDQuMDA5MyA1Ni43NTY0TDQ0LjU5NzcgNjEuNTcyTDQ0LjUzMjMgNjMuNTk4NEw1MS4zOTYxIDYwLjM1MTdaTTI4LjUxNjcgNjAuMzUxN0wzNS4zODA1IDYzLjU5ODRMMzUuMzM3IDYxLjU3MkwzNS44ODE3IDU2Ljc1NjRMMjguNTE2NyA2MC4zNTE3WiIgZmlsbD0iI0Q3QzFCMyIgc3Ryb2tlPSIjRDdDMUIzIiBzdHJva2Utd2lkdGg9IjAuMTI0NTE0IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHBhdGggZD0iTTM1LjQ4OTUgNDguNjA3TDI5LjM0NDcgNDYuNzk4NEwzMy42ODA5IDQ0LjgxNTZMMzUuNDg5NSA0OC42MDdaTTQ0LjQwMTUgNDguNjA3TDQ2LjIxMDEgNDQuODE1Nkw1MC41NjgxIDQ2Ljc5ODRMNDQuNDAxNSA0OC42MDdaIiBmaWxsPSIjMjMzNDQ3IiBzdHJva2U9IiMyMzM0NDciIHN0cm9rZS13aWR0aD0iMC4xMjQ1MTQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cGF0aCBkPSJNMjguNTE2NyA2MC4zNTE3TDI5LjU2MjYgNTEuNTA1TDIyLjc0MjQgNTEuNzAxMUwyOC41MTY3IDYwLjM1MTdaTTUwLjM1MDIgNTEuNTA1TDUxLjM5NjEgNjAuMzUxN0w1Ny4xNzA0IDUxLjcwMTFMNTAuMzUwMiA1MS41MDVaTTU1LjUzNjIgNDEuNzY1TDQzLjI5MDMgNDIuMzA5N0w0NC40MjMzIDQ4LjYwN0w0Ni4yMzE5IDQ0LjgxNTVMNTAuNTg5OSA0Ni43OTg0TDU1LjUzNjIgNDEuNzY1Wk0yOS4zNDQ3IDQ2Ljc5ODRMMzMuNzAyNyA0NC44MTU1TDM1LjQ4OTUgNDguNjA3TDM2LjY0NDMgNDIuMzA5N0wyNC4zNzY2IDQxLjc2NUwyOS4zNDQ3IDQ2Ljc5ODRaIiBmaWxsPSIjQ0Q2MTE2IiBzdHJva2U9IiNDRDYxMTYiIHN0cm9rZS13aWR0aD0iMC4xMjQ1MTQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cGF0aCBkPSJNMjQuMzc2NiA0MS43NjVMMjkuNTE5MSA1MS43ODgzTDI5LjM0NDcgNDYuNzk4NEwyNC4zNzY2IDQxLjc2NVpNNTAuNTg5OSA0Ni43OTg0TDUwLjM3MiA1MS43ODgzTDU1LjUzNjIgNDEuNzY1TDUwLjU4OTkgNDYuNzk4NFpNMzYuNjQ0NCA0Mi4zMDk3TDM1LjQ4OTUgNDguNjA3TDM2LjkyNzYgNTYuMDM3M0wzNy4yNTQ1IDQ2LjI1MzdMMzYuNjQ0NCA0Mi4zMDk3Wk00My4yOTAzIDQyLjMwOTdMNDIuNzAxOSA0Ni4yMzE5TDQyLjk2MzQgNTYuMDM3M0w0NC40MjMzIDQ4LjYwN0w0My4yOTAzIDQyLjMwOTdaIiBmaWxsPSIjRTQ3NTFGIiBzdHJva2U9IiNFNDc1MUYiIHN0cm9rZS13aWR0aD0iMC4xMjQ1MTQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cGF0aCBkPSJNNDQuNDIzMyA0OC42MDdMNDIuOTYzNCA1Ni4wMzc0TDQ0LjAwOTMgNTYuNzU2NEw1MC4zNzIgNTEuNzg4M0w1MC41ODk5IDQ2Ljc5ODVMNDQuNDIzMyA0OC42MDdaTTI5LjM0NDcgNDYuNzk4NUwyOS41MTkgNTEuNzg4M0wzNS44ODE3IDU2Ljc1NjRMMzYuOTI3NiA1Ni4wMzc0TDM1LjQ4OTUgNDguNjA3TDI5LjM0NDcgNDYuNzk4NVoiIGZpbGw9IiNGNjg1MUIiIHN0cm9rZT0iI0Y2ODUxQiIgc3Ryb2tlLXdpZHRoPSIwLjEyNDUxNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik00NC41MzIzIDYzLjU5ODRMNDQuNTk3NyA2MS41NzJMNDQuMDUyOSA2MS4wOTI2SDM1LjgzODFMMzUuMzM3IDYxLjU3MkwzNS4zODA1IDYzLjU5ODRMMjguNTE2NyA2MC4zNTE3TDMwLjkxMzYgNjIuMzEyOEwzNS43NzI4IDY1LjY5MDNINDQuMTE4M0w0OC45OTkyIDYyLjMxMjhMNTEuMzk2MSA2MC4zNTE3TDQ0LjUzMjMgNjMuNTk4NFoiIGZpbGw9IiNDMEFEOUUiIHN0cm9rZT0iI0MwQUQ5RSIgc3Ryb2tlLXdpZHRoPSIwLjEyNDUxNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik00NC4wMDkzIDU2Ljc1NjRMNDIuOTYzNCA1Ni4wMzc0SDM2LjkyNzZMMzUuODgxNyA1Ni43NTY0TDM1LjMzNyA2MS41NzJMMzUuODM4MSA2MS4wOTI2SDQ0LjA1MjlMNDQuNTk3NyA2MS41NzJMNDQuMDA5MyA1Ni43NTY0WiIgZmlsbD0iIzE2MTYxNiIgc3Ryb2tlPSIjMTYxNjE2IiBzdHJva2Utd2lkdGg9IjAuMTI0NTE0IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHBhdGggZD0iTTY1Ljg4NjQgMzEuMzI3N0w2Ny43Mzg1IDIyLjQzNzRMNjQuOTcxMiAxNC4xNzlMNDQuMDA5MyAyOS43MzdMNTIuMDcxNiAzNi41NTcyTDYzLjQ2NzcgMzkuODkxMUw2NS45OTUzIDM2Ljk0OTRMNjQuOTA1OCAzNi4xNjVMNjYuNjQ5IDM0LjU3NDNMNjUuMjk4MSAzMy41Mjg0TDY3LjA0MTIgMzIuMTk5Mkw2NS44ODY0IDMxLjMyNzdaTTEyLjE3NDMgMjIuNDM3NEwxNC4wMjY1IDMxLjMyNzdMMTIuODQ5OCAzMi4xOTkyTDE0LjU5MyAzMy41Mjg0TDEzLjI2MzggMzQuNTc0M0wxNS4wMDcgMzYuMTY1TDEzLjkxNzUgMzYuOTQ5NEwxNi40MjMzIDM5Ljg5MTFMMjcuODE5NSAzNi41NTcyTDM1Ljg4MTcgMjkuNzM3TDE0LjkxOTggMTQuMTc5TDEyLjE3NDMgMjIuNDM3NFoiIGZpbGw9IiM3NjNEMTYiIHN0cm9rZT0iIzc2M0QxNiIgc3Ryb2tlLXdpZHRoPSIwLjEyNDUxNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik02My40Njc3IDM5Ljg5MUw1Mi4wNzE2IDM2LjU1NzJMNTUuNTM2MiA0MS43NjVMNTAuMzcyIDUxLjc4ODNMNTcuMTcwNCA1MS43MDEySDY3LjMwMjdMNjMuNDY3NyAzOS44OTFaTTI3LjgxOTQgMzYuNTU3MkwxNi40MjMzIDM5Ljg5MUwxMi42MzE5IDUxLjcwMTJIMjIuNzQyNEwyOS41MTkxIDUxLjc4ODNMMjQuMzc2NiA0MS43NjVMMjcuODE5NCAzNi41NTcyWk00My4yOTAzIDQyLjMwOTdMNDQuMDA5MyAyOS43MzdMNDcuMzIxNCAyMC43ODEzSDMyLjYxMzJMMzUuODgxNyAyOS43MzdMMzYuNjQ0MyA0Mi4zMDk3TDM2LjkwNTggNDYuMjc1NUwzNi45Mjc2IDU2LjAzNzNINDIuOTYzNEw0My4wMDcgNDYuMjc1NUw0My4yOTAzIDQyLjMwOTdaIiBmaWxsPSIjRjY4NTFCIiBzdHJva2U9IiNGNjg1MUIiIHN0cm9rZS13aWR0aD0iMC4xMjQ1MTQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K" alt="MetaMask" width={48} height={48} />,
    wallet: createWallet("io.metamask"),
  },
  {
    key: "walletconnect",
    label: "WalletConnect",
    description: "Scan with WalletConnect to connect",
    icon: <Image src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTIiIGZpbGw9IiMxQzdERkMiLz4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTIiIGZpbGw9InVybCgjcGFpbnQwX3JhZGlhbF8xXzQ2KSIvPgo8cGF0aCBkPSJNMjYuNDIyNyAzMS40NzMxQzMzLjkxNzEgMjQuMTc1NiA0Ni4wODI5IDI0LjE3NTYgNTMuNTc3MyAzMS40NzMxTDU0LjQ3OTYgMzIuMzU4QzU0Ljg1OCAzMi43MjA3IDU0Ljg1OCAzMy4zMTU1IDU0LjQ3OTYgMzMuNjc4Mkw1MS4zOTQ1IDM2LjY4MTNDNTEuMjA1MyAzNi44Njk5IDUwLjg5OTcgMzYuODY5OSA1MC43MTA1IDM2LjY4MTNMNDkuNDczNiAzNS40NzcyQzQ0LjIzNDcgMzAuMzg1IDM1Ljc2NTMgMzAuMzg1IDMwLjUyNjQgMzUuNDc3MkwyOS4yMDIxIDM2Ljc2ODRDMjkuMDEzIDM2Ljk1NyAyOC43MDc0IDM2Ljk1NyAyOC41MTgyIDM2Ljc2ODRMMjUuNDMzMSAzMy43NjUzQzI1LjA1NDcgMzMuNDAyNiAyNS4wNTQ3IDMyLjgwNzggMjUuNDMzMSAzMi40NDUxTDI2LjQyMjcgMzEuNDczMVpNNTkuOTY1OCAzNy42ODI0TDYyLjcxNjIgNDAuMzUxOEM2My4wOTQ2IDQwLjcxNDUgNjMuMDk0NiA0MS4zMDkzIDYyLjcxNjIgNDEuNjcyTDUwLjMzMjIgNTMuNzI4QzQ5Ljk1MzggNTQuMDkwNyA0OS4zNDI2IDU0LjA5MDcgNDguOTc4OCA1My43MjhMNDAuMTg5MiA0NS4xNjg0QzQwLjEwMTkgNDUuMDgxMyAzOS45NDE4IDQ1LjA4MTMgMzkuODU0NSA0NS4xNjg0TDMxLjA2NDkgNTMuNzI4QzMwLjY4NjUgNTQuMDkwNyAzMC4wNzUzIDU0LjA5MDcgMjkuNzExNSA1My43MjhMMTcuMjgzOCA0MS42NzJDMTYuOTA1NCA0MS4zMDkzIDE2LjkwNTQgNDAuNzE0NSAxNy4yODM4IDQwLjM1MThMMjAuMDM0MiAzNy42ODI0QzIwLjQxMjUgMzcuMzE5NyAyMS4wMjM3IDM3LjMxOTcgMjEuMzg3NSAzNy42ODI0TDMwLjE3NzIgNDYuMjQyQzMwLjI2NDUgNDYuMzI5IDMwLjQyNDUgNDYuMzI5IDMwLjUxMTkgNDYuMjQyTDM5LjMwMTUgMzcuNjgyNEMzOS42Nzk5IDM3LjMxOTcgNDAuMjkxIDM3LjMxOTcgNDAuNjU0OSAzNy42ODI0TDQ5LjQ0NDUgNDYuMjQyQzQ5LjUzMTggNDYuMzI5IDQ5LjY5MTkgNDYuMzI5IDQ5Ljc3OTIgNDYuMjQyTDU4LjU2ODggMzcuNjgyNEM1OC45NzYzIDM3LjMxOTcgNTkuNTg3NSAzNy4zMTk3IDU5Ljk2NTggMzcuNjgyNFoiIGZpbGw9IndoaXRlIi8+CjxkZWZzPgo8cmFkaWFsR3JhZGllbnQgaWQ9InBhaW50MF9yYWRpYWxfMV80NiIgY3g9IjAiIGN5PSIwIiByPSIxIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgZ3JhZGllbnRUcmFuc2Zvcm09InRyYW5zbGF0ZSgwLjAwMDI0Nzk1NSA0MC4wMDEyKSBzY2FsZSg4MCkiPgo8c3RvcCBzdG9wLWNvbG9yPSIjNUQ5REY2Ii8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzAwNkZGRiIvPgo8L3JhZGlhbEdyYWRpZW50Pgo8L2RlZnM+Cjwvc3ZnPgo=" alt="WalletConnect" width={48} height={48} />,
    wallet: createWallet("walletConnect"),
  },
  {
    key: "thirdweb",
    label: "Social Login",
    description: "Use Apple, Google, email, or passkey",
    icon: <Image src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSJ1cmwoI3BhaW50MF9yYWRpYWxfNTYxNV8xMjQ2NSkiLz4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzU2MTVfMTI0NjUpIj4KPHBhdGggZD0iTTI0IDI4QzI2LjIwOTEgMjggMjggMjYuMjA5MSAyOCAyNEMyOCAyMS43OTA5IDI2LjIwOTEgMjAgMjQgMjBDMjEuNzkwOSAyMCAyMCAyMS43OTA5IDIwIDI0QzIwIDI2LjIwOTEgMjEuNzkwOSAyOCAyNCAyOFoiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik0yOCAyMFYyNUMyOCAyNS43OTU3IDI4LjMxNjEgMjYuNTU4NyAyOC44Nzg3IDI3LjEyMTNDMjkuNDQxMyAyNy42ODM5IDMwLjIwNDQgMjggMzEgMjhDMzEuNzk1NyAyOCAzMi41NTg3IDI3LjY4MzkgMzMuMTIxMyAyNy4xMjEzQzMzLjY4MzkgMjYuNTU4NyAzNCAyNS43OTU3IDM0IDI1VjI0QzM0IDIxLjc0NzMgMzMuMjM5NCAxOS41NjA2IDMxLjg0MTQgMTcuNzk0MkMzMC40NDM0IDE2LjAyNzcgMjguNDkgMTQuNzg1MSAyNi4yOTc1IDE0LjI2NzVDMjQuMTA1MSAxMy43NSAyMS44MDIxIDEzLjk4NzggMTkuNzYxOCAxNC45NDI2QzE3LjcyMTQgMTUuODk3MyAxNi4wNjMyIDE3LjUxMyAxNS4wNTU3IDE5LjUyNzlDMTQuMDQ4MyAyMS41NDI3IDEzLjc1MDcgMjMuODM4NyAxNC4yMTExIDI2LjA0MzlDMTQuNjcxNSAyOC4yNDkgMTUuODYzIDMwLjIzNDEgMTcuNTkyNSAzMS42Nzc1QzE5LjMyMiAzMy4xMjA5IDIxLjQ4ODMgMzMuOTM4MSAyMy43NDAyIDMzLjk5NjZDMjUuOTkyMSAzNC4wNTUyIDI4LjE5NzkgMzMuMzUxNiAzMCAzMiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9nPgo8ZGVmcz4KPHJhZGlhbEdyYWRpZW50IGlkPSJwYWludDBfcmFkaWFsXzU2MTVfMTI0NjUiIGN4PSIwIiBjeT0iMCIgcj0iMSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIGdyYWRpZW50VHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjUgMjYuNzUpIHJvdGF0ZSg0NS4zNTU5KSBzY2FsZSgyOC40NjE2KSI+CjxzdG9wIHN0b3AtY29sb3I9IiM5MjU3REYiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjNzEwNUZGIi8+CjwvcmFkaWFsR3JhZGllbnQ+CjxjbGlwUGF0aCBpZD0iY2xpcDBfNTYxNV8xMjQ2NSI+CjxyZWN0IHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgZmlsbD0id2hpdGUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEyIDEyKSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+Cjwvc3ZnPgo=" alt="Thirdweb" width={48} height={48} style={{ borderRadius: 8 }} />,
    wallet: inAppWallet({
      auth: {
        options: ["apple", "google", "email", "passkey"],
      },
    }),
  },
];

export const LoginForm = () => {
  const { isWaitingForSignature } = useMsIdContext();

  return (
    <div className="flex max-w-[386px] flex-col space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-center gap-2">
          <img src={getImgUrl("https://assets.metasoccer.com/msid-logo.png")} alt="MetaSoccer ID Logo" style={{ height: "40px", width: "auto" }} />
        </div>
        <p className="text-sm">Connect to get your MetaSoccer ID.</p>
        <div className="flex items-start gap-2">
          {/* <InfoIcon className="flex-shrink-0 opacity-40" size="sm" /> */}
          <p className="text-sm text-foreground-500">MetaSoccer ID is your unique identifier in the MetaSoccer World—think of it like your username for any MetaSoccer game.</p>
        </div>
        <p className="text-sm">Don’t have one yet? No worries! Just connect your wallet, and you’ll be able to claim yours instantly.</p>
      </div>
      {isWaitingForSignature && <div>Waiting for signature...</div>}
      <Listbox aria-label="Select wallet">
        {walletOptions.map((option) => (
          <ListboxItem
            key={option.key}
            startContent={option.icon}
            description={option.description}
            onClick={() => {
              const connectButton = document.querySelector(`.connect-button-${option.key}`);
              if (connectButton instanceof HTMLElement) {
                connectButton.click();
              }
            }}
          >
            {option.label}
          </ListboxItem>
        ))}
      </Listbox>
      <div className="opacity-0">
        {walletOptions.map((option) => (
          <ConnectButton
            key={option.key}
            connectModal={{
              size: "compact",
              showThirdwebBranding: false,
              privacyPolicyUrl: "https://metasoccer.com/privacy-policy",
              termsOfServiceUrl: "https://metasoccer.com/terms-of-service",
            }}
            connectButton={{
              className: `connect-button-${option.key}`,
              label: option.label,
              style: {
                opacity: 0,
                position: "absolute",
              },
            }}
            client={siteConfig.thirdwebClient}
            wallets={[option.wallet]}
          />
        ))}
      </div>

      <p className="text-center text-xs text-foreground-500">
        By continuing, you agree to our <Link className="text-xs" href="https://metasoccer.com/terms-of-service" isExternal showAnchorIcon>Terms of Service</Link> and{' '}
        <Link className="text-xs" href="https://metasoccer.com/privacy-policy" isExternal showAnchorIcon>
          Privacy Policy
        </Link>
      </p>
    </div>
  );
};
