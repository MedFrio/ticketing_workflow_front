import React from 'react'
import { cn } from '@/ui/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

const variants: Record<Variant, string> = {
  primary:
    'bg-brand-black text-brand-goldLight hover:bg-brand-blackLight font-semibold ring-1 ring-neutral-800 shadow-md',
  secondary:
    'bg-white border border-neutral-200 text-brand-black font-medium hover:bg-brand-goldMuted hover:border-brand-gold/30',
  ghost: 'bg-transparent text-brand-black font-medium hover:bg-brand-goldMuted',
  danger: 'bg-brand-burgundy text-white font-semibold hover:bg-brand-burgundyLight ring-1 ring-black/10 shadow-sm',
}

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
}

export function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm transition select-none',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'antialiased',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}
