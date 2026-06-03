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

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://stud-iu.ru";
const logoUrl = `${siteUrl}/icon.png`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "СтудИУ — Студенческий совет ИУ МГТУ им. Н.Э. Баумана",
    template: "%s | СтудИУ",
  },
  description:
    "Официальный сайт Студенческого совета факультета Информатики и систем управления (ИУ) МГТУ им. Н.Э. Баумана. Новости, будущие и прошедшие мероприятия, студенческие инициативы и ИТ-сообщество.",
  keywords: [
    "СтудИУ",
    "Студенческий совет ИУ",
    "МГТУ им. Баумана",
    "ИУ",
    "Студсовет",
    "Бауманка",
    "ИТ-сообщество",
    "новости ИУ",
    "мероприятия МГТУ",
  ],
  authors: [{ name: "ITS TECH" }],
  creator: "ITS TECH",
  publisher: "Студенческий совет ИУ",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: siteUrl,
    title: "СтудИУ — Студенческий совет ИУ МГТУ им. Н.Э. Баумана",
    description:
      "Официальный сайт Студенческого совета факультета Информатики и систем управления (ИУ) МГТУ им. Н.Э. Баумана. Новости, будущие и прошедшие мероприятия, студенческие инициативы и ИТ-сообщество.",
    siteName: "СтудИУ",
    images: [
      {
        url: logoUrl,
        width: 512,
        height: 512,
        alt: "Логотип СтудИУ",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "СтудИУ — Студенческий совет ИУ МГТУ им. Н.Э. Баумана",
    description:
      "Официальный сайт Студенческого совета факультета Информатики и систем управления (ИУ) МГТУ им. Н.Э. Баумана.",
    images: [logoUrl],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "СтудИУ — Студенческий совет ИУ МГТУ им. Н.Э. Баумана",
    url: siteUrl,
    logo: `${siteUrl}/icons/logo.svg`,
    sameAs: ["https://t.me/studsovet_iu", "https://vk.com/studsovet_iu"],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "student support",
      email: "studsovet.iu@yandex.ru",
    },
  };

  return (
    <html lang="ru">
      <body className={`antialiased ${alsSector.className} bg-gray-50`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
