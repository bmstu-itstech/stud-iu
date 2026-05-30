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
      className="flex flex-col gap-8 items-center text-center group cursor-pointer"
    >
      <div className="relative w-72 h-72 sm:w-96 sm:h-96 rounded-full overflow-hidden border-4 border-white/10 group-hover:border-blue-500/50 transition-all duration-300">
        <Image
          src={avatarUrl}
          alt={`Фото ${name}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 288px, 384px"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Title
          level={3}
          className="text-white leading-tight group-hover:text-blue-400 transition-colors"
        >
          {name}
        </Title>
        <Text level={4} className="text-white/60 font-medium">
          {role}
        </Text>
      </div>
    </a>
  );
};

export default Contact;
