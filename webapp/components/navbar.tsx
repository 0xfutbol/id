"use client";

import { useOxFutbolIdContext } from "@0xfutbol/id";
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Image, NavbarBrand, NavbarContent, NavbarItem, Navbar as NextUINavbar } from "@heroui/react";
import { addToast } from "@heroui/toast";
import NextLink from "next/link";
import { useCallback } from "react";
import { FiCopy } from "react-icons/fi";

export const Navbar = () => {
  const { address, disconnect } = useOxFutbolIdContext();

  const shortenAddress = useCallback((addr: string) => {
    if (!addr) return "";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  }, []);

  const copyToClipboard = useCallback(async () => {
    if (address) {
      await navigator.clipboard.writeText(address);

      addToast({
        title: "Address copied",
        description: "Address has been copied to clipboard",
        color: "success",
      });
    }
  }, [address]);

  return (
    <NextUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit p-2">
          <NextLink className="flex justify-start items-center gap-1" href="/">
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
          <NavbarItem>
            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="light"
                  className="px-3 py-2"
                >
                  {shortenAddress(address)}
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
