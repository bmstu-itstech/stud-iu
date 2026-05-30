import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
import { Providers } from "./providers";
import { SecretLoginListener } from "@/features/SecretLoginListener";
import { ModalProvider } from "@/shared/context/ModalContext";
import { HashScrollFix } from "@/features/HashScrollFix";

const alsSector = localFont({
  variable: "--font-als-sector",
  display: "swap",
  src: [
    {
      path: "../assets/fonts/ALS_Sector-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../assets/fonts/ALS_Sector-Bold.otf",
      weight: "600",
      style: "normal",
    },
  ],
});

export const metadata: Metadata = {
  title: "СтудИУ",
  description: "Студенческий совет ИУ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`antialiased ${alsSector.className} bg-gray-50`}>
        <Providers>
          <ModalProvider>
            <HashScrollFix />
            <SecretLoginListener />
            {children}
          </ModalProvider>
        </Providers>
      </body>
    </html>
  );
}
