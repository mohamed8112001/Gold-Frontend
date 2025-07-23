import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-arabic-sm font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-] overflow-hidden font-cairo",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary-500 text-white [a&]:hover:bg-primary-600",
        secondary:
          "border-transparent bg-secondary-1 text-primary-900 [a&]:hover:bg-secondary-2",
        success:
          "border-transparent bg-success-500 text-white [a&]:hover:bg-success-600",
        destructive:
          "border-transparent bg-error-500 text-white [a&]:hover:bg-error-600 focus-visible:ring-error-500/20",
        outline:
          "text-primary-900 border-secondary-2 [a&]:hover:bg-primary-1 [a&]:hover:text-primary-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props} />
  );
}

export { Badge, badgeVariants }
