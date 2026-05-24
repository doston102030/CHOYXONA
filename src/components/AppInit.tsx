"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";

export function AppInit() {
  const init = useAppStore((s) => s.init);
  useEffect(() => {
    init();
  }, [init]);
  return null;
}
