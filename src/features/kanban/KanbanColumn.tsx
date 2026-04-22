import { Link } from 'react-router-dom'
import type { ApiTicket } from '@/api/types'
import { KanbanCard } from './KanbanCard'

export function KanbanColumn({ tickets }: { tickets: ApiTicket[] }) {
  return (
    <div className="p-0">
      <div className="space-y-1.5">
        {tickets.map((t) => (
          <Link key={t.id} to={`/tickets/${t.id}`} className="block">
            <KanbanCard ticket={t} />
          </Link>
        ))}
        {tickets.length === 0 ? <div className="text-sm text-neutral-400">Aucun ticket</div> : null}
      </div>
    </div>
  )
}
