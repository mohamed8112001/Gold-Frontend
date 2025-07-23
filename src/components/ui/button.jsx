import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-button-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        primary: "text-white transition-all duration-300",
        success: "text-white transition-all duration-300",
        error: "text-white transition-all duration-300",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2 text-button-md",
        sm: "h-9 rounded-md px-3 text-button-sm",
        lg: "h-11 rounded-md px-8 text-button-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"

  // Apply custom styles for new design system variants
  let customStyles = ""
  if (variant === "primary") {
    customStyles = "bg-[#D4AF37] hover:bg-[#A88924]" // Button Primary 500 & Hover
  } else if (variant === "success") {
    customStyles = "bg-[#21CF61] hover:bg-[#1CA651]" // Success 500 & Hover 600
  } else if (variant === "error") {
    customStyles = "bg-[#FD0D0D] hover:bg-[#D80604]" // Error 500 & Hover 600
  }

  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), customStyles, className)}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }

