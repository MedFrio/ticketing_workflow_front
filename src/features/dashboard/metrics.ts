import type { StoreState } from '@/domain/types'

type Point = { day: string; opened: number; closed: number }

function dayKey(iso: string) {
  return iso.slice(0, 10)
}

/**
 * Regroupe les événements (créations / clôtures) par jour.
 * La clôture est détectée par le passage vers un état final.
 */
export function groupOpenedClosedByDay(state: StoreState): Point[] {
  const openedByDay = new Map<string, number>()
  const closedByDay = new Map<string, number>()

  for (const ev of state.events) {
    if (ev.type === 'TICKET_CREATED') {
      const k = dayKey(ev.at)
      openedByDay.set(k, (openedByDay.get(k) ?? 0) + 1)
    }
    if (ev.type === 'TICKET_TRANSITIONED') {
      if (state.workflow.doneStateKeys.includes(ev.payload.to)) {
        const k = dayKey(ev.at)
        closedByDay.set(k, (closedByDay.get(k) ?? 0) + 1)
      }
    }
  }

  const allDays = new Set<string>([...openedByDay.keys(), ...closedByDay.keys()])
  const sorted = [...allDays].sort()

  return sorted.map((day) => ({
    day,
    opened: openedByDay.get(day) ?? 0,
    closed: closedByDay.get(day) ?? 0,
  }))
}
