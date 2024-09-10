"use client";

import { siteConfig } from "@/config/site";
import {
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Navbar as NextUINavbar
} from "@nextui-org/navbar";
import Image from "next/image";
import NextLink from "next/link";
import { ConnectButton, useActiveWallet } from "thirdweb/react";

export const Navbar = () => {
  const address = useActiveWallet();

  return (
    <NextUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <Image 
              alt="MetaSoccer" 
              src="https://assets.metasoccer.com/metasoccer-logo.svg" 
              height={24} 
              width={120} 
              className="filter invert"
            />
          </NextLink>
        </NavbarBrand>
      </NavbarContent>

      {address && (
        <NavbarContent
          className="hidden sm:flex basis-1/5 sm:basis-full"
          justify="end"
        >
          <NavbarItem className="hidden md:flex">
            <ConnectButton client={siteConfig.thirdwebClient} />
          </NavbarItem>
        </NavbarContent>
      )}
    </NextUINavbar>
  );
};
