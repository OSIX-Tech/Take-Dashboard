import * as React from "react"
import { useRef, useEffect } from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";
import gsap from "gsap"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-macos focus-macos disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 touch-manipulation",
  {
    variants: {
      variant: {
        default:
          "btn-macos-primary text-white shadow-macos active:scale-[0.98]",
        destructive:
          "bg-red-600 text-white shadow-macos active:scale-[0.98]",
        outline:
          "btn-macos text-gray-900 active:scale-[0.98]",
        secondary:
          "bg-gray-100 text-gray-900 shadow-macos-sm active:scale-[0.98]",
        ghost: "",
        link: "text-gray-900 underline-offset-4",
      },
      size: {
        default: "h-9 sm:h-10 px-3 sm:px-4 py-2 text-sm sm:text-base",
        sm: "h-8 sm:h-9 rounded-md px-2 sm:px-3 text-xs sm:text-sm",
        lg: "h-10 sm:h-12 rounded-md px-6 sm:px-8 text-base sm:text-lg",
        icon: "h-9 w-9 sm:h-10 sm:w-10 lg:h-12 lg:w-12",
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
  const buttonRef = useRef(null)
  const combinedRef = ref || buttonRef
  
  useEffect(() => {
    const button = combinedRef?.current
    if (!button || asChild) return
    
    // Initial scale animation on mount - simple fade
    gsap.fromTo(button,
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.2, ease: "power2.out" }
    )
    
    // Click animation - slower
    const handleClick = () => {
      gsap.to(button, {
        scale: 0.97,
        duration: 0.15,
        ease: "power2.in",
        onComplete: () => {
          gsap.to(button, {
            scale: 1,
            duration: 0.3,
            ease: "power2.out"
          })
        }
      })
    }
    
    button.addEventListener('click', handleClick)
    
    return () => {
      button.removeEventListener('click', handleClick)
    }
  }, [combinedRef, asChild])
  
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={combinedRef}
      {...props} />
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
