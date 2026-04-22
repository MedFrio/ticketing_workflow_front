import { cn } from '@/ui/lib/cn'

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'rounded-xl bg-white shadow-sm border border-neutral-200/80',
        'ring-1 ring-black/5',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 px-3 py-2.5 border-b border-neutral-100 border-l-2 border-l-brand-gold bg-neutral-50/50">
      <div>
        <div className="text-sm font-semibold text-brand-black">{title}</div>
        {subtitle ? <div className="text-xs text-neutral-500 mt-0.5">{subtitle}</div> : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  )
}

export function CardContent({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('p-3', className)}>{children}</div>
}
