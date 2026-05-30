"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export const SecretLoginListener = () => {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === "l" || e.key === "L")) {
        e.preventDefault();
        router.push("/admin/login");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return null;
};
