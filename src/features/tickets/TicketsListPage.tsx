import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader } from '@/ui/components/Card'
import { Input } from '@/ui/components/Input'
import { Select } from '@/ui/components/Select'
import { Badge } from '@/ui/components/Badge'
import { Button } from '@/ui/components/Button'
import { listTickets } from '@/api/tickets'
import type { ApiPriority } from '@/api/types'

const priorities: Array<ApiPriority | 'ALL'> = ['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

export function TicketsListPage() {
  const { data: tickets = [], isLoading, error } = useQuery({ queryKey: ['tickets'], queryFn: listTickets })
  const [q, setQ] = useState('')
  const [priority, setPriority] = useState<ApiPriority | 'ALL'>('ALL')

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    return tickets.filter((t) => {
      const matchQuery =
        query.length === 0 ||
        t.title.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.tags.some((x) => x.toLowerCase().includes(query))
      const matchPriority = priority === 'ALL' || t.priority === priority
      return matchQuery && matchPriority
    })
  }, [tickets, q, priority])

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xl font-semibold text-brand-black">Tickets</div>
          <div className="text-xs text-neutral-500 mt-0.5">Recherche et filtres</div>
        </div>
        <Link to="/tickets/new">
          <Button>Créer un ticket</Button>
        </Link>
      </div>

      <Card>
        <CardHeader
          title="Recherche"
          subtitle="Rechercher par titre, description ou tags"
          right={
            <div className="w-36">
              <Select value={priority} onChange={(e) => setPriority(e.target.value as any)}>
                {priorities.map((p) => (
                  <option key={p} value={p}>
                    {p === 'ALL' ? 'Toutes priorités' : p}
                  </option>
                ))}
              </Select>
            </div>
          }
        />
        <CardContent className="py-2">
          <Input placeholder="Rechercher..." value={q} onChange={(e) => setQ(e.target.value)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader title={`Résultats (${filtered.length})`} />
        <CardContent className="py-2">
          {isLoading ? <div className="text-sm text-neutral-500 py-1">Chargement…</div> : null}
          {error ? (
            <div className="rounded-lg border border-brand-burgundy/30 bg-brand-burgundyMuted px-3 py-2 text-sm text-brand-burgundy mb-2">
              Impossible de charger les tickets.
            </div>
          ) : null}

          <div className="space-y-1.5">
            {filtered.map((t) => (
              <Link
                key={t.id}
                to={`/tickets/${t.id}`}
                className="block rounded-lg border border-neutral-200/80 bg-white px-3 py-2.5 hover:bg-brand-goldMuted hover:border-brand-gold/30 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm text-brand-black truncate">{t.title}</div>
                    <div className="text-xs text-neutral-500 mt-0.5 line-clamp-1">{t.description}</div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <Badge>{t.priority}</Badge>
                      <Badge>workflow: {t.workflow.name}</Badge>
                      <Badge>state: {t.currentState?.name ?? '—'}</Badge>
                      {t.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag}>#{tag}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-[10px] text-neutral-400 shrink-0">{t.updatedAt.slice(0, 16).replace('T', ' ')}</div>
                </div>
              </Link>
            ))}
            {filtered.length === 0 ? (
              <div className="text-sm text-neutral-500 py-2">Aucun ticket ne correspond à la recherche.</div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
