"use client";
import Link from "next/link";
import { useState, useEffect, type FC } from "react";
import { usePathname } from "next/navigation";

import Button from "@/shared/ui/Button";
import { Caption, Title } from "@/shared/ui/Typography";
import Links from "./components/Links";
import Image from "next/image";
import links from "./links";

const Navbar: FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsMobileMenuOpen(false);
  }

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header
        className={`sticky top-0 z-[60] border-b border-gray-100 transition-colors duration-300 ${isMobileMenuOpen ? "bg-white" : "bg-white/80 backdrop-blur-md"}`}
      >
        <div className="flex justify-center items-center py-4 sm:py-6 relative bg-transparent">
          <div className="flex justify-between items-center w-full max-w-primary px-6">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <Image
                src="/icons/logo.svg"
                width={140}
                height={40}
                alt="СтудИУ"
                priority
              />
            </Link>

            <Links />

            <div className="flex items-center gap-4">
              <Button
                variant="black"
                size="inline"
                className="hidden lg:flex"
                onClick={() =>
                  (window.location.href =
                    "https://forms.yandex.ru/u/69b154576d2d73185b353a95")
                }
              >
                <Caption level={2} className="text-white font-bold">
                  Стать активистом
                </Caption>
              </Button>

              <button
                className="lg:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 focus:outline-none"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <span
                  className={`w-7 h-0.5 bg-black transition-all duration-300 origin-center ${isMobileMenuOpen ? "rotate-45 translate-y-2" : ""}`}
                />
                <span
                  className={`w-7 h-0.5 bg-black transition-all duration-300 ${isMobileMenuOpen ? "opacity-0" : ""}`}
                />
                <span
                  className={`w-7 h-0.5 bg-black transition-all duration-300 origin-center ${isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`}
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 top-[50px] sm:top-[50px] bg-white z-[50] lg:hidden transition-transform duration-300 ease-in-out flex flex-col items-center justify-start pt-16 gap-10 ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <nav className="flex flex-col items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Title
                level={3}
                className="text-black hover:text-blue-600 transition-colors"
              >
                {link.label}
              </Title>
            </Link>
          ))}
        </nav>
        <Button
          variant="black"
          size="inline"
          className="mt-8 flex lg:hidden px-10 py-5"
          onClick={() => {
            setIsMobileMenuOpen(false);
            window.location.href =
              "https://forms.yandex.ru/u/69b154576d2d73185b353a95";
          }}
        >
          <Title level={5} className="text-white font-bold">
            Стать активистом
          </Title>
        </Button>
      </div>
    </>
  );
};

export default Navbar;
