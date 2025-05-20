"use client";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center h-screen w-screen overflow-y-auto">{children}</div>
  );
}
