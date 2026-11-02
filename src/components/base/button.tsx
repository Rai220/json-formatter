import { Button as ShadcnButton, type ButtonProps as ShadcnButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import * as React from "react";

export interface ButtonProps extends ShadcnButtonProps {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <ShadcnButton
        ref={ref}
        className={cn("rounded-full h-11 lg:h-9", className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button };
