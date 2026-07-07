import type { FC, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Text } from "@/shared/ui/Typography";

interface FieldProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string;
}

const Field: FC<FieldProps> = ({ label, value, className, ...props }) => {
  return (
    <div
      {...props}
      className={cn("flex flex-col gap-1 sm:gap-2", className)}
    >
      <Text level={4} className="text-white/60 text-sm">
        {label}
      </Text>
      <Text level={4} className="text-white font-medium">
        {value}
      </Text>
    </div>
  );
};

export default Field;
