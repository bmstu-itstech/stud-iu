"use client";

import Image from "next/image";
import Link from "next/link";
import type { FC } from "react";
import { FaTelegram, FaVk } from "react-icons/fa6";

import Button from "@/shared/ui/Button";
import { Text, Title } from "@/shared/ui/Typography";
import Field from "./components/Field";

const Footer: FC = () => {
  return (
    <footer className="bg-black text-white py-20 px-6">
      <div className="flex flex-col w-full max-w-primary mx-auto gap-16">
        <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center justify-between border-b border-white/10 pb-10">
          <Title level={2}>Студенческий совет ИУ</Title>
          <div className="flex gap-6">
            <Link
              href="https://t.me/studsovet_iu"
              target="_blank"
              className="hover:text-blue-primary transition-colors"
            >
              <FaTelegram size={40} />
            </Link>
            <Link
              href="https://vk.com/studsovet_iu"
              target="_blank"
              className="hover:text-blue-primary transition-colors"
            >
              <FaVk size={40} />
            </Link>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-10">
          <div className="flex flex-col gap-6">
            <Field label="Почта:" value="studsovetiu@yandex.ru" />
          </div>

          <div className="flex flex-col gap-6 md:items-end md:text-right">
            <Field
              label="Адрес:"
              value="Бригадирский пер., 13, Москва"
              className="md:items-end"
            />
          </div>
        </div>

        <div className="flex flex-col xl:flex-row justify-between items-center gap-10 mt-8">
          <div className="flex flex-col sm:flex-row gap-6 w-full xl:w-auto">
            <Button
              variant="blue"
              size="inline"
              className="justify-between sm:justify-center"
              onClick={() =>
                (window.location.href =
                  "https://forms.yandex.ru/u/69b154576d2d73185b353a95")
              }
            >
              <Text level={3}>Хочу к вам</Text>
              <Image
                src="/icons/arrow_right.svg"
                alt=""
                width={24}
                height={24}
              />
            </Button>
            <Button
              onClick={() => {
                window.location.href = "https://t.me/h1rotik";
              }}
              variant="outline"
              size="inlineWithBorder"
              className="justify-between sm:justify-center border-white text-white hover:bg-white hover:text-black"
            >
              <Text level={3}>Стать партнёром</Text>
              <Image
                src="/icons/arrow_right.svg"
                alt=""
                width={24}
                height={24}
                className="invert group-hover:invert-0"
              />
            </Button>
          </div>

          <div className="flex gap-4 items-center opacity-60 hover:opacity-100 transition-opacity">
            <Image
              src="/icons/itstech_logo.svg"
              alt="ITS Tech"
              width={40}
              height={40}
            />
            <Text level={3}>Сделано в ITS TECH</Text>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
