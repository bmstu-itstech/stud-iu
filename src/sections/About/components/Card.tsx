import Link from "next/link";
import type { FC } from "react";

import Button from "@/shared/ui/Button";
import { Text, Title } from "@/shared/ui/Typography";
import type { CardProps } from "../cards.usecase";

const Card: FC<CardProps> = (props) => {
  const isExternal = props.href.startsWith("http");

  return (
    <div className="bg-blue-primary rounded-3xl p-8 min-w-[280px] sm:min-w-[300px] flex flex-col justify-between snap-center">
      <div className="flex flex-col gap-4">
        <Title level={3} className="text-white">
          {props.title}
        </Title>
        <Text level={4} className="text-white/80">
          {props.description}
        </Text>
      </div>

      <div className="pt-8">
        {isExternal ? (
          <a
            href={props.href}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full"
          >
            <Button variant="white" size="full" className="w-full">
              <Text level={4}>{props.caption}</Text>
            </Button>
          </a>
        ) : (
          <Link href={props.href} className="block w-full">
            <Button variant="white" size="full" className="w-full">
              <Text level={4}>{props.caption}</Text>
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Card;
