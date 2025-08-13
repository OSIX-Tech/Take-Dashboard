import * as React from "react"
import { useRef, useEffect } from "react"
import gsap from "gsap"

import { cn } from "@/lib/utils"

const Card = React.forwardRef(({ className, ...props }, ref) => {
  const cardRef = useRef(null)
  const combinedRef = ref || cardRef
  
  useEffect(() => {
    const card = combinedRef?.current
    if (!card) return
    
    // Initial fade-in animation - simple
    gsap.fromTo(card,
      { 
        opacity: 0,
        scale: 0.95
      },
      { 
        opacity: 1,
        scale: 1,
        duration: 0.3,
        ease: "power2.out"
      }
    )
    
    return () => {}
    
  }, [combinedRef])
  
  return (
    <div
      ref={combinedRef}
      className={cn("rounded-2xl card-macos", className)}
      {...props} />
  )
})
Card.displayName = "Card"

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-4 sm:p-6 border-b border-black/5", className)}
    {...props} />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight text-sm sm:text-base lg:text-lg", className)}
    {...props} />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-xs sm:text-sm text-muted-foreground", className)}
    {...props} />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-4 sm:p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-4 sm:p-6 pt-0", className)}
    {...props} />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
