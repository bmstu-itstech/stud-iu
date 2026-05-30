import type { FC } from "react";
import Link from "next/link";
import links from "../links";
import { Caption } from "@/shared/ui/Typography";

const Links: FC = () => {
  return (
    <nav className="gap-8 hidden lg:flex select-none">
      {links.map((link) => (
        <Link key={link.href} href={link.href}>
          <Caption className="text-gray-500 hover:text-black transition-colors duration-200 font-medium">
            {link.label}
          </Caption>
        </Link>
      ))}
    </nav>
  );
};

export default Links;
