import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader } from '@/ui/components/Card'
import { Select } from '@/ui/components/Select'
import { listTickets } from '@/api/tickets'
import { listWorkflows } from '@/api/workflows'
import { KanbanColumn } from './KanbanColumn'

export function KanbanPage() {
  const { data: tickets = [], isLoading: ticketsLoading } = useQuery({ queryKey: ['tickets'], queryFn: listTickets })
  const { data: workflows = [], isLoading: workflowsLoading } = useQuery({ queryKey: ['workflows'], queryFn: listWorkflows })

  const [workflowId, setWorkflowId] = useState<string>('')
  const selectedWorkflowId = workflowId || workflows[0]?.id || ''
  const selectedWorkflow = workflows.find((w) => w.id === selectedWorkflowId)

  const columns = useMemo(() => {
    if (!selectedWorkflow) return [] as Array<{ key: string; label: string; tickets: typeof tickets }>
    const wfTickets = tickets.filter((t) => t.workflow.id === selectedWorkflow.id)

    const states = [...selectedWorkflow.states].sort((a, b) => a.order - b.order)
    const cols = states.map((s) => ({
      key: s.id,
      label: s.name,
      tickets: wfTickets.filter((t) => (t.currentState?.id ?? 'none') === s.id),
    }))

    const withoutState = wfTickets.filter((t) => !t.currentState)
    if (withoutState.length) {
      cols.unshift({ key: 'none', label: 'Sans état', tickets: withoutState })
    }
    return cols
  }, [tickets, selectedWorkflow])

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xl font-semibold text-brand-black">Kanban</div>
          <div className="text-xs text-neutral-500 mt-0.5">Vue par états du workflow</div>
        </div>
        <div className="w-56">
          <Select value={selectedWorkflowId} onChange={(e) => setWorkflowId(e.target.value)} disabled={workflowsLoading}>
            {workflows.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {ticketsLoading || workflowsLoading ? <div className="text-sm text-neutral-500">Chargement…</div> : null}
      {workflows.length === 0 ? (
        <div className="rounded-lg border border-brand-gold/40 bg-brand-goldMuted px-3 py-2 text-sm text-brand-gold">
          Aucun workflow. Créez-en un dans l’onglet Workflow.
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {columns.map((c) => (
          <Card key={c.key} className="min-h-[320px]">
            <CardHeader title={c.label} subtitle={`${c.tickets.length} ticket(s)`} />
            <CardContent className="py-2">
              <KanbanColumn tickets={c.tickets} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
