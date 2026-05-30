import { cn } from "@/lib/utils";
import React from "react";

type TextLevel = 1 | 2 | 3 | 4;

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  level?: TextLevel;
}

const styles: Record<TextLevel, string> = {
  1: "clamp(calc(var(--text-xl)*var(--dpr-ratio)), 5vw, var(--text-h4xl))",
  2: "clamp(calc(var(--text-lg)*var(--dpr-ratio)), 5vw, calc(var(--text-4xl)*var(--dpr-ratio)))",
  3: "clamp(calc(var(--text-base)*var(--dpr-ratio)), 5vw, var(--text-h3xl))",
  4: "clamp(calc(var(--text-lg)*var(--dpr-ratio)), 5vw, var(--text-wh3xl))",
};

export const Text: React.FC<TextProps> = ({
  level = 1,
  children,
  className,
  style,
  ...props
}) => {
  return (
    <p
      className={cn("font-normal", className)}
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
