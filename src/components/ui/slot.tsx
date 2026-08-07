import * as React from "react";
import { cn } from "@/lib/utils";

type SlotProps = React.HTMLAttributes<HTMLElement> & {
  children?: React.ReactNode;
};

function Slot({ children, className, ...rest }: SlotProps) {
  if (!React.isValidElement(children)) return null;
  const child = children as React.ReactElement<React.HTMLAttributes<HTMLElement>>;
  return React.cloneElement(child, {
    ...rest,
    className: cn(className, child.props.className),
  });
}

export { Slot };
