import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        "relative flex w-full flex-wrap items-center rounded-md border border-input bg-background text-sm shadow-sm transition-[color,box-shadow] focus-within:ring-1 focus-within:ring-ring",
        className
      )}
      {...props}
    />
  );
}

const inputGroupAddonVariants = cva(
  "flex h-auto cursor-text items-center gap-2 py-1.5 text-sm font-medium text-muted-foreground select-none [&>svg:not([class*='size-'])]:size-4",
  {
    variants: {
      align: {
        "inline-start": "order-first pl-3",
        "inline-end": "order-last pr-3",
        "block-start": "w-full justify-start px-3 pt-2",
        "block-end": "order-last w-full justify-start px-3 pb-2",
      },
    },
    defaultVariants: {
      align: "inline-start",
    },
  }
);

function InputGroupAddon({
  className,
  align,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      data-slot="input-group-addon"
      data-align={align ?? "inline-start"}
      className={cn(inputGroupAddonVariants({ align }), className)}
      {...props}
    />
  );
}

function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "flex items-center gap-2 text-sm text-muted-foreground [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  );
}

type InputGroupButtonProps = Omit<React.ComponentProps<typeof Button>, "size"> & {
  size?: "xs" | "sm" | "icon-xs" | "icon-sm" | "default" | "icon" | "lg";
};

function InputGroupButton({
  className,
  variant = "ghost",
  size = "icon-sm",
  ...props
}: InputGroupButtonProps) {
  const sizeClass =
    size === "xs" || size === "sm"
      ? "h-7 gap-1 px-2 text-xs"
      : size === "icon-xs"
        ? "size-6 p-0"
        : size === "icon-sm" || size === "icon"
          ? "size-7 p-0"
          : "";
  return (
    <Button
      data-slot="input-group-button"
      variant={variant}
      size="sm"
      className={cn("shrink-0 rounded-md", sizeClass, className)}
      {...props}
    />
  );
}

function InputGroupInput({ className, ...props }: React.ComponentProps<typeof Input>) {
  return (
    <Input
      data-slot="input-group-control"
      className={cn(
        "flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0",
        className
      )}
      {...props}
    />
  );
}

function InputGroupTextarea({ className, ...props }: React.ComponentProps<typeof Textarea>) {
  return (
    <Textarea
      data-slot="input-group-control"
      className={cn(
        "min-h-16 flex-1 resize-none border-0 bg-transparent py-2 shadow-none focus-visible:ring-0",
        className
      )}
      {...props}
    />
  );
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
  inputGroupAddonVariants,
};
