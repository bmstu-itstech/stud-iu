"use client";
import { useEffect } from "react";

export function HashScrollFix() {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const a = target.closest("a");
      if (!a) return;
      const href = a.getAttribute("href");
      if (href && href.includes("#")) {
        const id = href.split("#")[1];
        const el = document.getElementById(id);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: "smooth" });
          window.history.pushState(null, "", href);
        }
      }
    };
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);
  return null;
}
