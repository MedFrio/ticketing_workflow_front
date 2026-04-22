import React from 'react'
import { cn } from '@/ui/lib/cn'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'h-8 w-full rounded-lg border border-neutral-200 bg-white px-2.5 text-sm outline-none',
        'focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold',
        className,
      )}
      {...props}
    />
  )
}
