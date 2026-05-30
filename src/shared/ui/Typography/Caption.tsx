import { cn } from "@/lib/utils";
import React from "react";

type CaptionLevel = 1 | 2;

interface CaptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  level?: CaptionLevel;
}

const styles: Record<CaptionLevel, string> = {
  1: "calc(var(--text-2xl)*var(--dpr-ratio))",
  2: "clamp(calc(var(--text-sm)*var(--dpr-ratio)), 5vw, calc(var(--text-xl)*var(--dpr-ratio)))",
};

export const Caption: React.FC<CaptionProps> = ({
  level = 1,
  children,
  className,
  style,
  ...props
}) => {
  return (
    <p
      className={cn("font-normal text-gray-500", className)}
      style={{
        fontSize: styles[level],
        ...style,
      }}
      {...props}
    >
      {children}
    </p>
  );
};
