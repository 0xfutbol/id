"use client";

import { useOxFutbolIdContext } from "@0xfutbol/id";
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Image, NavbarBrand, NavbarContent, NavbarItem, Navbar as NextUINavbar } from "@heroui/react";
import { addToast } from "@heroui/toast";
import NextLink from "next/link";
import { useCallback } from "react";
import { FiCopy, FiMenu } from "react-icons/fi";
import { ClaimGift } from "../modules/pack/components";

export const Navbar = () => {
  const { address, disconnect, walletProvider } = useOxFutbolIdContext();

  const shortenAddress = useCallback((addr: string) => {
    if (!addr) return "";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  }, []);

  const copyToClipboard = useCallback(async () => {
    if (address) {
      try {
        await navigator.clipboard.writeText(address);

        addToast({
          title: "Address copied",
          description: "Address has been copied to clipboard",
          color: "success",
          timeout: 3000,
          shouldShowTimeoutProgress: true,
        });
      } catch (error: any) {
        addToast({
          title: "Copy failed",
          description: error.message ?? "Failed to copy address to clipboard",
          color: "danger",
          timeout: 3000,
          shouldShowTimeoutProgress: true,
        });
      }
    }
  }, [address]);

  return (
    <NextUINavbar maxWidth="xl" position="sticky" className="px-4">
      <NavbarContent className="basis-1/5" justify="start">
        <NavbarBrand as="li" className="gap-2 max-w-fit">
          <NextLink className="flex justify-start items-center" href="/">
            <Image
              alt="0xFútbol ID"
              height={32}
              src="https://assets.metasoccer.com/0xfutbol/msid/0xfutbol-logo.png?v=2"
            />
          </NextLink>
        </NavbarBrand>
      </NavbarContent>

      {address && (
        <NavbarContent className="basis-1/5" justify="end">
          {walletProvider === "matchain_id" && (
            <NavbarItem>
              <ClaimGift />
            </NavbarItem>
          )}
          <NavbarItem>
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Button isIconOnly variant="light">
                  <FiMenu className="h-6 w-6 cursor-pointer" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="User menu">
                <DropdownItem
                  key="address"
                  endContent={
                    <FiCopy className="h-4 w-4" />
                  }
                  showDivider
                  onClick={copyToClipboard}
                >
                  {shortenAddress(address)}
                </DropdownItem>
                <DropdownItem
                  key="logout"
                  className="text-danger"
                  color="danger"
                  onClick={disconnect}
                >
                  Logout
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarItem>
        </NavbarContent>
      )}
    </NextUINavbar>
  );
};
