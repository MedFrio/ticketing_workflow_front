import type { StoreState, TicketEvent, TicketProjection } from './types'
import { stateByKey } from './workflow'

function nowIso() {
  return new Date().toISOString()
}

export function projectTicket(events: TicketEvent[], workflowDoneKeys: string[]): TicketProjection | null {
  if (events.length === 0) return null
  const created = events.find((e) => e.type === 'TICKET_CREATED')
  if (!created || created.type !== 'TICKET_CREATED') return null

  let projection: TicketProjection = {
    id: created.ticketId,
    title: created.payload.title,
    description: created.payload.description,
    priority: created.payload.priority,
    tags: created.payload.tags,
    assigneeId: null,
    status: 'OPEN',
    createdAt: created.at,
    updatedAt: created.at,
    closedAt: null,
  }

  for (const ev of events) {
    projection.updatedAt = ev.at
    if (ev.type === 'TICKET_EDITED') {
      projection = { ...projection, ...ev.payload, tags: ev.payload.tags ?? projection.tags }
    }
    if (ev.type === 'TICKET_ASSIGNED') {
      projection.assigneeId = ev.payload.assigneeId
    }
    if (ev.type === 'TICKET_TRANSITIONED') {
      projection.status = ev.payload.to
      if (workflowDoneKeys.includes(ev.payload.to)) {
        projection.closedAt = ev.at
      } else {
        projection.closedAt = null
      }
    }
  }

  return projection
}

export function projectAllTickets(state: StoreState): TicketProjection[] {
  const grouped = new Map<string, TicketEvent[]>()
  for (const ev of state.events) {
    const arr = grouped.get(ev.ticketId) ?? []
    arr.push(ev)
    grouped.set(ev.ticketId, arr)
  }

  const tickets: TicketProjection[] = []
  for (const [, evs] of grouped) {
    const sorted = [...evs].sort((a, b) => a.at.localeCompare(b.at))
    const proj = projectTicket(sorted, state.workflow.doneStateKeys)
    if (proj) tickets.push(proj)
  }

  tickets.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  return tickets
}

export function computeMetrics(state: StoreState) {
  const tickets = projectAllTickets(state)

  const resolved = tickets.filter((t) => t.closedAt)
  const avgResolutionMs =
    resolved.length === 0
      ? 0
      : Math.round(
          resolved.reduce((sum, t) => {
            const start = new Date(t.createdAt).getTime()
            const end = new Date(t.closedAt!).getTime()
            return sum + Math.max(0, end - start)
          }, 0) / resolved.length,
        )

  return {
    tickets,
    resolvedCount: resolved.length,
    openCount: tickets.filter((t) => !t.closedAt).length,
    avgResolutionMs,
  }
}

export function formatDuration(ms: number) {
  if (!ms || ms <= 0) return '—'
  const minutes = Math.floor(ms / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}j ${hours % 24}h`
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  return `${minutes}m`
}
