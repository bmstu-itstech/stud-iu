import Image from "next/image";
import type { FC } from "react";

import { Text, Title } from "@/shared/ui/Typography";
import type { ContactProps } from "../contacts";

const Contact: FC<ContactProps> = ({ avatarUrl, name, role, tg_link }) => {
  const href = tg_link.startsWith("http")
    ? tg_link
    : `https://t.me/${tg_link.replace("@", "")}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col gap-5 sm:gap-6 items-center text-center group cursor-pointer w-full"
    >
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80 rounded-full overflow-hidden border-4 border-white/10 group-hover:border-blue-500/50 transition-all duration-300 shadow-lg shrink-0">
        <Image
          src={avatarUrl}
          alt={`Фото ${name}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 256px, (max-width: 1024px) 288px, 320px"
        />
      </div>

      <div className="flex flex-col gap-1.5 sm:gap-2 w-full px-2">
        <Title
          level={3}
          className="text-white leading-tight group-hover:text-blue-400 transition-colors !text-xl sm:!text-2xl lg:!text-3xl font-bold tracking-tight break-words"
        >
          {name}
        </Title>
        <Text
          level={4}
          className="text-white/60 font-medium !text-sm sm:!text-base lg:!text-lg break-words"
        >
          {role}
        </Text>
      </div>
    </a>
  );
};

export default Contact;
