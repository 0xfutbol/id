"use client";

import { useOxFutbolIdContext } from "@0xfutbol/id";
import { NavbarBrand, NavbarContent, NavbarItem, Navbar as NextUINavbar } from "@nextui-org/navbar";
import { Image } from "@nextui-org/react";
import NextLink from "next/link";

export const Navbar = () => {
  const { address } = useOxFutbolIdContext();

  return (
    <NextUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit p-2">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <Image
              alt="0xFútbol ID"
              height={32}
              src="https://assets.metasoccer.com/0xfutbol/msid/0xfutbol-logo.png?v=2"
              width={70}
            />
          </NextLink>
        </NavbarBrand>
      </NavbarContent>

      {address && (
        <NavbarContent className="basis-1/5" justify="end">
          <NavbarItem>
            {/* <ConnectButton client={thirdwebClient} /> */}
          </NavbarItem>
        </NavbarContent>
      )}
    </NextUINavbar>
  );
};
