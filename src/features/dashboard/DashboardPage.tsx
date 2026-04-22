import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader } from '@/ui/components/Card'
import { listTickets } from '@/api/tickets'
import type { ApiTicket } from '@/api/types'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

function isResolved(t: ApiTicket) {
  const name = t.currentState?.name ?? ''
  return /done|closed|resolved|termin|ferm/i.test(name)
}

function dayKey(iso: string) {
  return iso.slice(0, 10)
}

function buildSeries(tickets: ApiTicket[]) {
  // 14 derniers jours
  const days: string[] = []
  const now = new Date()
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }

  const created = new Map<string, number>()
  const updated = new Map<string, number>()
  for (const t of tickets) {
    created.set(dayKey(t.createdAt), (created.get(dayKey(t.createdAt)) ?? 0) + 1)
    updated.set(dayKey(t.updatedAt), (updated.get(dayKey(t.updatedAt)) ?? 0) + 1)
  }

  return days.map((d) => ({
    day: d.slice(5),
    created: created.get(d) ?? 0,
    updated: updated.get(d) ?? 0,
  }))
}

export function DashboardPage() {
  const { data: tickets = [], isLoading, error } = useQuery({ queryKey: ['tickets'], queryFn: listTickets })

  const metrics = useMemo(() => {
    const total = tickets.length
    const resolvedCount = tickets.filter(isResolved).length
    const openCount = total - resolvedCount
    const highPriority = tickets.filter((t) => t.priority === 'HIGH' || t.priority === 'CRITICAL').length
    return { total, openCount, resolvedCount, highPriority }
  }, [tickets])

  const series = useMemo(() => buildSeries(tickets), [tickets])

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xl font-semibold text-brand-black">Dashboard</div>
        <div className="text-xs text-neutral-500 mt-0.5">Vue d'ensemble des tickets</div>
      </div>

      {isLoading ? <div className="text-sm text-neutral-500">Chargement…</div> : null}
      {error ? (
        <div className="rounded-lg border border-brand-burgundy/30 bg-brand-burgundyMuted px-3 py-2 text-sm text-brand-burgundy">
          Impossible de charger les tickets.
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card>
          <CardHeader title="Tickets" subtitle="Total" />
          <CardContent className="py-2">
            <div className="text-2xl font-bold text-brand-black">{metrics.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader title="Ouverts" subtitle="Basé sur le nom d’état" />
          <CardContent className="py-2">
            <div className="text-2xl font-bold text-brand-gold">{metrics.openCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader title="Priorité élevée" subtitle="HIGH + CRITICAL" />
          <CardContent className="py-2">
            <div className="text-2xl font-bold text-brand-burgundy">{metrics.highPriority}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader title="Activité" subtitle="Créations / mises à jour (14 derniers jours)" />
        <CardContent className="h-56 py-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#737373" />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#737373" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0c0c0c',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#d4a84b',
                  fontSize: '12px',
                }}
              />
              <Line type="monotone" dataKey="created" stroke="#b8860b" strokeWidth={2} dot={{ fill: '#b8860b' }} />
              <Line type="monotone" dataKey="updated" stroke="#6b2d3a" strokeWidth={2} dot={{ fill: '#6b2d3a' }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
