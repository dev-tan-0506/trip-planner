import type { ReactNode } from "react";
import { PublicEntryCollage } from "./public-entry-collage";

interface AuthScreenFrameProps {
  children: ReactNode;
}

export function AuthScreenFrame({ children }: AuthScreenFrameProps) {
  return (
    <div className="surface-app relative min-h-screen overflow-hidden">
      <PublicEntryCollage />
      <div className="absolute inset-0" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-6 md:px-6 md:py-10">
        <main className="flex w-full flex-1 items-center justify-center">
          <div className="w-full max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

