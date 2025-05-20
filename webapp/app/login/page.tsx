"use client";

import AuthForm from "@/components/auth-form";
import { getImgUrl } from "@/utils/getImgUrl";
import { Image } from "@heroui/react";

export default function Login() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 md:h-full overflow-hidden">
      <Image
        alt="0xFútbol Ecosystem"
        className="w-full md:h-full md:aspect-auto aspect-[16/9] object-cover object-center rounded-none"
        src={getImgUrl("https://assets.metasoccer.com/0xfutbol/msid/0xfutbol.png?v=100")}
      />
      <div className="flex items-center justify-center w-full">
        <AuthForm />
      </div>
    </div>
  );
}
