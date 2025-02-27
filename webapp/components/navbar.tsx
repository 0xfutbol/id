"use client";

import {
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Navbar as NextUINavbar,
} from "@nextui-org/navbar";
import Image from "next/image";
import NextLink from "next/link";
import { ConnectButton, useActiveWallet } from "thirdweb/react";

import { siteConfig } from "@/config/site";

export const Navbar = () => {
  const address = useActiveWallet();

  return (
    <NextUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit p-2">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <Image
              alt="0xFútbol"
              height={42}
              src="https://assets.metasoccer.com/0xfutbol/msid/0xfutbol-logo.png"
              width={42}
            />
          </NextLink>
        </NavbarBrand>
      </NavbarContent>

      {address && (
        <NavbarContent className="basis-1/5" justify="end">
          <NavbarItem>
            <ConnectButton client={siteConfig.thirdwebClient} />
          </NavbarItem>
        </NavbarContent>
      )}
    </NextUINavbar>
  );
};
