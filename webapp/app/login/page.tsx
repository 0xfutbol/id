"use client";

import AuthForm from "@/components/auth-form";
import { getImgUrl } from "@/utils/getImgUrl";

export default function Login() {
  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden">
      <div className="h-screen w-full md:w-1/2">
        <img
          alt="MetaSoccer"
          className="h-full w-full object-cover"
          src={getImgUrl("https://assets.metasoccer.com/0xfutbol/msid/0xfutbol.png?v=100")}
        />
      </div>
      <div className="flex items-center justify-center h-screen w-full md:w-1/2">
        <AuthForm />
      </div>
    </div>
  );
}
