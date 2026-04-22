import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader } from '@/ui/components/Card'
import { Badge } from '@/ui/components/Badge'
import { Button } from '@/ui/components/Button'
import { Input } from '@/ui/components/Input'
import { Select } from '@/ui/components/Select'
import { asApiErrorMessage } from '@/api/http'
import { listUsers } from '@/api/auth'
import {
  applyTransition,
  assignTicket,
  deleteTicket,
  getTicket,
  getTicketEvents,
  updateTicket,
} from '@/api/tickets'
import { getWorkflow, listWorkflows } from '@/api/workflows'
import type { ApiPriority, ApiTicketEvent, ApiTransition } from '@/api/types'
import { useAuth } from '@/auth/AuthContext'

const priorities: ApiPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

function fmtDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString('fr-FR')
  } catch {
    return iso
  }
}

export function TicketDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { user } = useAuth()

  const { data: ticket, isLoading, error } = useQuery({
    queryKey: ['tickets', id],
    queryFn: () => getTicket(String(id)),
    enabled: Boolean(id),
  })

  const { data: workflows = [] } = useQuery({ queryKey: ['workflows'], queryFn: listWorkflows })

  const workflowDetailId = ticket?.workflow?.id
  const { data: workflowDetail } = useQuery({
    queryKey: ['workflows', workflowDetailId],
    queryFn: () => getWorkflow(String(workflowDetailId)),
    enabled: Boolean(workflowDetailId),
  })

  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['tickets', id, 'events'],
    queryFn: () => getTicketEvents(String(id)),
    enabled: Boolean(id),
  })

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['auth', 'users'],
    queryFn: listUsers,
  })

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<ApiPriority>('MEDIUM')
  const [tagsText, setTagsText] = useState('')
  const [workflowId, setWorkflowId] = useState('')
  const [assigneeDraft, setAssigneeDraft] = useState('')
  const [selectedTransitionId, setSelectedTransitionId] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!ticket) return
    setTitle(ticket.title)
    setDescription(ticket.description)
    setPriority(ticket.priority)
    setTagsText(ticket.tags.join(','))
    setWorkflowId(ticket.workflow.id)
    setAssigneeDraft(ticket.assignee?.id ?? '')
  }, [ticket])

  const tags = useMemo(
    () =>
      tagsText
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    [tagsText],
  )

  const availableTransitions = useMemo(() => {
    if (!workflowDetail || !ticket) return [] as ApiTransition[]
    const currentStateId = ticket.currentState?.id ?? null
    return (workflowDetail.transitions ?? []).filter((t) => t.fromStateId === currentStateId)
  }, [workflowDetail, ticket])

  useEffect(() => {
    if (!availableTransitions.length) {
      setSelectedTransitionId('')
      return
    }
    // garde la sélection si elle existe, sinon prend la première
    setSelectedTransitionId((prev) => (availableTransitions.some((t) => t.id === prev) ? prev : availableTransitions[0].id))
  }, [availableTransitions])

  const saveMutation = useMutation({
    mutationFn: () =>
      updateTicket(String(id), {
        title: title.trim(),
        description,
        priority,
        tags,
        workflowId,
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['tickets'] })
      await qc.invalidateQueries({ queryKey: ['tickets', id] })
      await qc.invalidateQueries({ queryKey: ['tickets', id, 'events'] })
    },
    onError: (e) => setFormError(asApiErrorMessage(e)),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteTicket(String(id)),
    onSuccess: () => {
      navigate('/tickets', { replace: true })
      qc.invalidateQueries({ queryKey: ['tickets'] })
    },
    onError: (e) => setFormError(asApiErrorMessage(e)),
  })

  const assignMutation = useMutation({
    mutationFn: (assigneeId: string | null) => assignTicket(String(id), assigneeId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['tickets'] })
      await qc.invalidateQueries({ queryKey: ['tickets', id] })
      await qc.invalidateQueries({ queryKey: ['tickets', id, 'events'] })
    },
    onError: (e) => setFormError(asApiErrorMessage(e)),
  })

  const transitionMutation = useMutation({
    mutationFn: (transitionId: string) => applyTransition(String(id), transitionId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['tickets'] })
      await qc.invalidateQueries({ queryKey: ['tickets', id] })
      await qc.invalidateQueries({ queryKey: ['tickets', id, 'events'] })
    },
    onError: (e) => setFormError(asApiErrorMessage(e)),
  })

  if (isLoading) {
    return <div className="text-sm text-neutral-500">Chargement…</div>
  }

  if (error || !ticket) {
    return (
      <div className="space-y-4">
        <div className="text-2xl font-semibold">Ticket introuvable</div>
        <Link to="/tickets" className="text-sm underline">
          Retour à la liste
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xl font-semibold text-brand-black">Détail ticket</div>
          <div className="text-xs text-neutral-500 mt-0.5">ID: {ticket.id}</div>
        </div>
        <Link to="/tickets" className="text-sm underline text-brand-burgundy hover:text-brand-gold">
          Retour
        </Link>
      </div>

      {formError ? (
        <div className="rounded-lg border border-brand-burgundy/30 bg-brand-burgundyMuted px-3 py-2 text-sm text-brand-burgundy">{formError}</div>
      ) : null}

      <Card>
        <CardHeader
          title="Informations"
          subtitle="Modifier les informations du ticket"
          right={
            <div className="flex gap-2">
              <Button
                variant="danger"
                onClick={() => {
                  if (!confirm('Supprimer ce ticket ?')) return
                  deleteMutation.mutate()
                }}
                disabled={deleteMutation.isPending}
              >
                Supprimer
              </Button>
              <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Enregistrement…' : 'Enregistrer'}
              </Button>
            </div>
          }
        />
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-neutral-500 mb-1">Titre</div>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <div className="text-xs text-neutral-500 mb-1">Priorité</div>
              <Select value={priority} onChange={(e) => setPriority(e.target.value as ApiPriority)}>
                {priorities.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <div className="text-xs text-neutral-500 mb-1">Description</div>
            <textarea
              className="min-h-24 w-full rounded-lg border border-neutral-200 bg-white px-2.5 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-neutral-500 mb-1">Workflow</div>
              <Select value={workflowId} onChange={(e) => setWorkflowId(e.target.value)}>
                {workflows.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <div className="text-xs text-neutral-500 mb-1">Tags (séparés par virgule)</div>
              <Input value={tagsText} onChange={(e) => setTagsText(e.target.value)} placeholder="bug,front,urgent" />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge>workflow: {ticket.workflow.name}</Badge>
            <Badge>state: {ticket.currentState?.name ?? '—'}</Badge>
            <Badge>assignee: {ticket.assignee?.email ?? '—'}</Badge>
            <Badge>created: {ticket.createdAt.slice(0, 10)}</Badge>
            <Badge>updated: {ticket.updatedAt.slice(0, 10)}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Assignation" subtitle="Assigner le ticket à un utilisateur" />
        <CardContent className="space-y-3">
          <div className="text-sm text-neutral-600">
            Assigné à : <span className="font-medium">{ticket.assignee?.email ?? '—'}</span>
          </div>

          <div className="flex flex-col md:flex-row gap-2 items-start md:items-end">
            <div className="flex-1 w-full">
              <div className="text-xs text-neutral-500 mb-1">Assigner à</div>
              <Select
                value={assigneeDraft}
                onChange={(e) => setAssigneeDraft(e.target.value)}
                disabled={usersLoading}
              >
                <option value="">— Non assigné</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name ? `${u.name} (${u.email})` : u.email}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                disabled={!user?.id || assignMutation.isPending}
                onClick={() => {
                  setFormError(null)
                  assignMutation.mutate(user!.id)
                }}
              >
                M’assigner
              </Button>
              <Button
                variant="secondary"
                disabled={assignMutation.isPending}
                onClick={() => {
                  setFormError(null)
                  assignMutation.mutate((assigneeDraft || '').trim() || null)
                }}
              >
                Appliquer
              </Button>
              <Button
                variant="danger"
                disabled={assignMutation.isPending}
                onClick={() => {
                  setFormError(null)
                  setAssigneeDraft('')
                  assignMutation.mutate(null)
                }}
              >
                Désassigner
              </Button>
            </div>
          </div>

          <div className="text-xs text-neutral-500">
            Sélectionnez un utilisateur dans la liste pour assigner le ticket.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Transitions" subtitle="Changer l'état du ticket" />
        <CardContent className="space-y-3">
          <div className="text-sm text-neutral-600">
            État courant : <span className="font-medium">{ticket.currentState?.name ?? '—'}</span>
          </div>

          {availableTransitions.length === 0 ? (
            <div className="text-sm text-neutral-500">
              Aucune transition disponible depuis cet état.
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-2 items-start md:items-end">
              <div className="flex-1 w-full">
                <div className="text-xs text-neutral-500 mb-1">Transition</div>
                <Select value={selectedTransitionId} onChange={(e) => setSelectedTransitionId(e.target.value)}>
                  {availableTransitions.map((t) => (
                    <option key={t.id} value={t.id}>
                      {(t.fromState?.name ?? t.fromStateId.slice(0, 8)) + ' → ' + (t.toState?.name ?? t.toStateId.slice(0, 8))}
                      {t.requiredRoles?.length ? ` (rôles: ${t.requiredRoles.map((r) => r.name).join(' ou ')})` : ''}
                    </option>
                  ))}
                </Select>
              </div>
              <Button
                disabled={!selectedTransitionId || transitionMutation.isPending}
                onClick={() => {
                  setFormError(null)
                  transitionMutation.mutate(selectedTransitionId)
                }}
              >
                {transitionMutation.isPending ? 'Application…' : 'Appliquer'}
              </Button>
            </div>
          )}

        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Historique" subtitle="Événements et modifications" />
        <CardContent className="space-y-3">
          {eventsLoading ? <div className="text-sm text-neutral-500">Chargement…</div> : null}

          {events.length === 0 && !eventsLoading ? (
            <div className="text-sm text-neutral-500">Aucun événement.</div>
          ) : (
            <div className="space-y-3">
              {events.map((ev) => (
                <EventRow key={ev.id} ev={ev} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function EventRow({ ev }: { ev: ApiTicketEvent }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-lg border border-neutral-200/80 bg-white p-2.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium">{ev.type}</div>
          <div className="text-xs text-neutral-500 mt-1">
            {fmtDateTime(ev.createdAt)}
            {ev.userId ? ` • par ${ev.userId.slice(0, 8)}` : ''}
          </div>
        </div>
        <Button variant="secondary" onClick={() => setOpen((x) => !x)}>
          {open ? 'Masquer' : 'Détails'}
        </Button>
      </div>

      {open ? (
        <pre className="mt-3 overflow-auto rounded-lg border border-neutral-200 bg-neutral-50 p-2.5 text-xs text-neutral-700">
          {JSON.stringify(ev.payload, null, 2)}
        </pre>
      ) : null}
    </div>
  )
}
