import type { ApiTicket } from '@/api/types'
import { Badge } from '@/ui/components/Badge'

export function KanbanCard({ ticket }: { ticket: ApiTicket }) {
  return (
    <div className="rounded-lg border border-neutral-200/80 bg-white p-2.5 shadow-sm hover:border-brand-gold/40 hover:shadow transition">
      <div className="text-xs font-medium text-brand-black line-clamp-2">{ticket.title}</div>
      <div className="mt-1.5 flex flex-wrap gap-1">
        <Badge>{ticket.priority}</Badge>
        {ticket.tags.slice(0, 2).map((t) => (
          <Badge key={t}>#{t}</Badge>
        ))}
      </div>
    </div>
  )
}
