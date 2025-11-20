"use client";

import { Leva } from "leva";

export default function Providers({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Leva collapsed />
    </>
  );
}
