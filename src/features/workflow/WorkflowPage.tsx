import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader } from '@/ui/components/Card'
import { Button } from '@/ui/components/Button'
import { Input } from '@/ui/components/Input'
import { Select } from '@/ui/components/Select'
import { Badge } from '@/ui/components/Badge'
import { asApiErrorMessage } from '@/api/http'
import type { ApiState, ApiTransition } from '@/api/types'
import { listTickets } from '@/api/tickets'
import {
  createState,
  createTransition,
  createWorkflow,
  deleteState,
  deleteTransition,
  deleteWorkflow,
  getWorkflow,
  listWorkflows,
  updateState,
  updateTransition,
  updateWorkflow,
} from '@/api/workflows'

export function WorkflowPage() {
  const qc = useQueryClient()

  // 1) Liste pour la navigation
  const { data: workflows = [], isLoading: listLoading, error: listError } = useQuery({
    queryKey: ['workflows'],
    queryFn: listWorkflows,
  })

  const [selectedId, setSelectedId] = useState<string>('')
  const activeId = selectedId || workflows[0]?.id || ''

  // 2) Détail du workflow sélectionné (utilise GET /workflows/:id)
  const {
    data: active,
    isLoading: detailLoading,
    error: detailError,
  } = useQuery({
    queryKey: ['workflows', activeId],
    queryFn: () => getWorkflow(activeId),
    enabled: Boolean(activeId),
  })

  const { data: tickets = [] } = useQuery({ queryKey: ['tickets'], queryFn: listTickets })
  const ticketsOnActiveWorkflow = useMemo(
    () => (activeId ? tickets.filter((t) => t.workflow?.id === activeId) : []),
    [tickets, activeId],
  )
  const canDeleteWorkflow = active != null && ticketsOnActiveWorkflow.length === 0

  const [wfName, setWfName] = useState('')
  const [wfDesc, setWfDesc] = useState('')
  const [newWfName, setNewWfName] = useState('')
  const [newWfDesc, setNewWfDesc] = useState('')
  const [newStateName, setNewStateName] = useState('')
  const [newStateOrder, setNewStateOrder] = useState('0')
  const [newFrom, setNewFrom] = useState('')
  const [newTo, setNewTo] = useState('')
  const [newRoleIds, setNewRoleIds] = useState('')
  const [uiError, setUiError] = useState<string | null>(null)

  // sync inputs when active changes
  useEffect(() => {
    if (!active) return
    setWfName(active.name)
    setWfDesc(active.description ?? '')
    const firstStateId = active.states[0]?.id ?? ''
    setNewFrom(firstStateId)
    setNewTo(firstStateId)
  }, [active?.id])

  const createWorkflowMutation = useMutation({
    mutationFn: () => createWorkflow({ name: newWfName.trim(), description: newWfDesc.trim() || undefined }),
    onSuccess: async (created) => {
      await qc.invalidateQueries({ queryKey: ['workflows'] })
      setSelectedId(created.id)
      setNewWfName('')
      setNewWfDesc('')
    },
    onError: (e) => setUiError(asApiErrorMessage(e)),
  })

  const updateWorkflowMutation = useMutation({
    mutationFn: () => updateWorkflow(activeId, { name: wfName.trim(), description: wfDesc.trim() || undefined }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['workflows'] })
      await qc.invalidateQueries({ queryKey: ['workflows', activeId] })
    },
    onError: (e) => setUiError(asApiErrorMessage(e)),
  })

  const deleteWorkflowMutation = useMutation({
    mutationFn: () => deleteWorkflow(activeId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['workflows'] })
      setSelectedId('')
    },
    onError: (e) => setUiError(asApiErrorMessage(e)),
  })

  const createStateMutation = useMutation({
    mutationFn: () =>
      createState(activeId, {
        name: newStateName.trim(),
        order: Number.isFinite(Number(newStateOrder)) ? Number(newStateOrder) : 0,
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['workflows'] })
      await qc.invalidateQueries({ queryKey: ['workflows', activeId] })
      setNewStateName('')
      setNewStateOrder('0')
    },
    onError: (e) => setUiError(asApiErrorMessage(e)),
  })

  const createTransitionMutation = useMutation({
    mutationFn: () => {
      const requiredRoleIds = newRoleIds
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean)
      return createTransition(activeId, {
        fromStateId: newFrom,
        toStateId: newTo,
        requiredRoleIds: requiredRoleIds.length ? requiredRoleIds : undefined,
      })
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['workflows'] })
      await qc.invalidateQueries({ queryKey: ['workflows', activeId] })
      setNewRoleIds('')
    },
    onError: (e) => setUiError(asApiErrorMessage(e)),
  })

  const statesSorted = useMemo(
    () => (active ? [...active.states].sort((a, b) => a.order - b.order) : []),
    [active],
  )
  const transitionsSorted = useMemo(() => {
    if (!active) return []
    return [...active.transitions].sort((a, b) => (a.fromState?.order ?? 0) - (b.fromState?.order ?? 0))
  }, [active])

  const detectedRoles = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>()
    for (const t of transitionsSorted) {
      for (const r of t.requiredRoles ?? []) {
        map.set(r.id, { id: r.id, name: r.name })
      }
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [transitionsSorted])

  if (listLoading) return <div className="text-sm text-neutral-500">Chargement…</div>

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xl font-semibold text-brand-black">Workflow</div>
        <div className="text-xs text-neutral-500 mt-0.5">Gestion des workflows, états et transitions</div>
      </div>

      {listError ? (
        <div className="rounded-lg border border-brand-burgundy/30 bg-brand-burgundyMuted px-3 py-2 text-sm text-brand-burgundy">
          Impossible de charger les workflows.
        </div>
      ) : null}
      {detailError ? (
        <div className="rounded-lg border border-brand-burgundy/30 bg-brand-burgundyMuted px-3 py-2 text-sm text-brand-burgundy">
          Impossible de charger le workflow sélectionné.
        </div>
      ) : null}
      {uiError ? (
        <div className="rounded-lg border border-brand-burgundy/30 bg-brand-burgundyMuted px-3 py-2 text-sm text-brand-burgundy">{uiError}</div>
      ) : null}

      <Card>
        <CardHeader title="Workflows" subtitle="Sélectionner un workflow ou en créer un nouveau" />
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Select value={activeId} onChange={(e) => setSelectedId(e.target.value)} disabled={workflows.length === 0}>
              {workflows.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </Select>

            <div className="flex flex-wrap items-center gap-2">
              {ticketsOnActiveWorkflow.length > 0 ? (
                <span className="text-xs text-neutral-500">
                  {ticketsOnActiveWorkflow.length} ticket(s) sur ce workflow — suppression impossible.
                </span>
              ) : null}
              <Button
                variant="danger"
                disabled={!canDeleteWorkflow || deleteWorkflowMutation.isPending}
                onClick={() => {
                  if (!active) return
                  if (ticketsOnActiveWorkflow.length > 0) {
                    setUiError(`${ticketsOnActiveWorkflow.length} ticket(s) utilisent ce workflow. Supprimez-les ou réassignez-les avant de supprimer le workflow.`)
                    return
                  }
                  if (!confirm(`Supprimer le workflow "${active.name}" ?`)) return
                  setUiError(null)
                  deleteWorkflowMutation.mutate()
                }}
              >
                Supprimer
              </Button>
              <Button
                disabled={!active || updateWorkflowMutation.isPending}
                onClick={() => {
                  if (!active) return
                  setUiError(null)
                  updateWorkflowMutation.mutate()
                }}
              >
                {updateWorkflowMutation.isPending ? 'Enregistrement…' : 'Enregistrer'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-neutral-500 mb-1">Nom</div>
              <Input value={wfName} onChange={(e) => setWfName(e.target.value)} disabled={!active} />
            </div>
            <div>
              <div className="text-xs text-neutral-500 mb-1">Description</div>
              <Input value={wfDesc} onChange={(e) => setWfDesc(e.target.value)} disabled={!active} />
            </div>
          </div>

          <div className="border-t border-neutral-100 pt-3">
            <div className="text-sm font-medium mb-2">Nouveau workflow</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input value={newWfName} onChange={(e) => setNewWfName(e.target.value)} placeholder="Nom" />
              <Input value={newWfDesc} onChange={(e) => setNewWfDesc(e.target.value)} placeholder="Description (facultatif)" />
              <Button
                variant="primary"
                disabled={!newWfName.trim() || createWorkflowMutation.isPending}
                onClick={() => {
                  setUiError(null)
                  createWorkflowMutation.mutate()
                }}
              >
                {createWorkflowMutation.isPending ? 'Création…' : 'Créer'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {!activeId ? (
        <div className="rounded-lg border border-brand-gold/40 bg-brand-goldMuted px-3 py-2 text-sm text-brand-gold">
          Aucun workflow.
        </div>
      ) : detailLoading ? (
        <div className="text-sm text-neutral-500">Chargement du workflow…</div>
      ) : !active ? (
        <div className="rounded-lg border border-brand-gold/40 bg-brand-goldMuted px-3 py-2 text-sm text-brand-gold">
          Aucun workflow sélectionné.
        </div>
      ) : (
        <>
          {detectedRoles.length ? (
            <Card>
              <CardHeader title="Rôles détectés" subtitle="Issus des transitions configurées" />
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {detectedRoles.map((r) => (
                    <Badge key={r.id}>
                      {r.name}
                    </Badge>
                  ))}
                </div>
                <div className="text-xs text-neutral-500 mt-2">
                  Saisir les identifiants des rôles autorisés pour cette transition, séparés par des virgules.
                </div>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader title="États" subtitle="Définir les états du workflow" />
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input value={newStateName} onChange={(e) => setNewStateName(e.target.value)} placeholder="Nom (ex. : Ouvert)" />
                <Input value={newStateOrder} onChange={(e) => setNewStateOrder(e.target.value)} placeholder="Ordre" />
                <Button
                  variant="primary"
                  disabled={!newStateName.trim() || createStateMutation.isPending}
                  onClick={() => {
                    setUiError(null)
                    createStateMutation.mutate()
                  }}
                >
                  {createStateMutation.isPending ? 'Ajout…' : 'Ajouter'}
                </Button>
              </div>

              <div className="space-y-2">
                {statesSorted.map((s) => (
                  <StateRow key={s.id} workflowId={activeId} stateId={s.id} name={s.name} order={s.order} canDelete />
                ))}
                {statesSorted.length === 0 ? <div className="text-sm text-neutral-500">Aucun état.</div> : null}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Transitions" subtitle="Définir les passages possibles entre états" />
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-3">
                <Select value={newFrom} onChange={(e) => setNewFrom(e.target.value)}>
                  {statesSorted.map((s) => (
                    <option key={s.id} value={s.id}>
                      De : {s.name}
                    </option>
                  ))}
                </Select>
                <Select value={newTo} onChange={(e) => setNewTo(e.target.value)}>
                  {statesSorted.map((s) => (
                    <option key={s.id} value={s.id}>
                      Vers : {s.name}
                    </option>
                  ))}
                </Select>
                <Input
                  value={newRoleIds}
                  onChange={(e) => setNewRoleIds(e.target.value)}
                  placeholder="Rôles requis (ex. : id1, id2)"
                />
                <Button
                  variant="primary"
                  disabled={!newFrom || !newTo || createTransitionMutation.isPending}
                  onClick={() => {
                    setUiError(null)
                    createTransitionMutation.mutate()
                  }}
                >
                  {createTransitionMutation.isPending ? 'Ajout…' : 'Ajouter'}
                </Button>
              </div>

              <div className="space-y-2">
                {transitionsSorted.map((t) => (
                  <TransitionRow
                    key={t.id}
                    workflowId={activeId}
                    transition={t}
                    states={statesSorted}
                    canDelete
                  />
                ))}
                {transitionsSorted.length === 0 ? <div className="text-sm text-neutral-500">Aucune transition.</div> : null}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

function StateRow({
  workflowId,
  stateId,
  name,
  order,
  canDelete,
}: {
  workflowId: string
  stateId: string
  name: string
  order: number
  canDelete: boolean
}) {
  const qc = useQueryClient()
  const [draftName, setDraftName] = useState(name)
  const [draftOrder, setDraftOrder] = useState(String(order))
  const [rowError, setRowError] = useState<string | null>(null)

  useEffect(() => {
    setDraftName(name)
    setDraftOrder(String(order))
  }, [name, order])

  const save = useMutation({
    mutationFn: () => updateState(workflowId, stateId, { name: draftName.trim(), order: Number(draftOrder) }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['workflows'] })
      await qc.invalidateQueries({ queryKey: ['workflows', workflowId] })
    },
    onError: (e) => setRowError(asApiErrorMessage(e)),
  })

  const del = useMutation({
    mutationFn: () => deleteState(workflowId, stateId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['workflows'] })
      await qc.invalidateQueries({ queryKey: ['workflows', workflowId] })
    },
    onError: (e) => setRowError(asApiErrorMessage(e)),
  })

  return (
    <div className="rounded-lg border border-neutral-200/80 bg-white p-2.5">
      {rowError ? <div className="text-xs text-brand-burgundy mb-2">{rowError}</div> : null}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
        <div className="md:col-span-2">
          <div className="text-xs text-neutral-500 mb-1">Nom</div>
          <Input value={draftName} onChange={(e) => setDraftName(e.target.value)} />
        </div>
        <div>
          <div className="text-xs text-neutral-500 mb-1">Ordre</div>
          <Input value={draftOrder} onChange={(e) => setDraftOrder(e.target.value)} />
        </div>
        <div className="flex gap-2 md:col-span-2">
          <Button variant="primary" disabled={save.isPending} onClick={() => save.mutate()}>
            {save.isPending ? '…' : 'Enregistrer'}
          </Button>
          {canDelete ? (
            <Button
              variant="danger"
              disabled={del.isPending}
              onClick={() => {
                if (!confirm('Supprimer cet état ?')) return
                del.mutate()
              }}
            >
              Supprimer
            </Button>
          ) : null}
          <span className="ml-auto text-[10px] text-neutral-400" title={stateId}>Réf. {stateId.slice(0, 8)}</span>
        </div>
      </div>
    </div>
  )
}

function TransitionRow({
  workflowId,
  transition,
  states,
  canDelete,
}: {
  workflowId: string
  transition: ApiTransition
  states: ApiState[]
  canDelete: boolean
}) {
  const qc = useQueryClient()
  const [rowError, setRowError] = useState<string | null>(null)

  const [fromStateId, setFromStateId] = useState(transition.fromStateId)
  const [toStateId, setToStateId] = useState(transition.toStateId)
  const [roleIds, setRoleIds] = useState((transition.requiredRoles ?? []).map((r) => r.id).join(','))

  useEffect(() => {
    setFromStateId(transition.fromStateId)
    setToStateId(transition.toStateId)
    setRoleIds((transition.requiredRoles ?? []).map((r) => r.id).join(','))
  }, [transition.id, transition.fromStateId, transition.toStateId])

  const save = useMutation({
    mutationFn: () =>
      updateTransition(workflowId, transition.id, {
        fromStateId,
        toStateId,
        requiredRoleIds: roleIds
          .split(',')
          .map((x) => x.trim())
          .filter(Boolean),
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['workflows'] })
      await qc.invalidateQueries({ queryKey: ['workflows', workflowId] })
    },
    onError: (e) => setRowError(asApiErrorMessage(e)),
  })

  const del = useMutation({
    mutationFn: () => deleteTransition(workflowId, transition.id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['workflows'] })
      await qc.invalidateQueries({ queryKey: ['workflows', workflowId] })
    },
    onError: (e) => setRowError(asApiErrorMessage(e)),
  })

  const fromLabel = transition.fromState?.name ?? transition.fromStateId
  const toLabel = transition.toState?.name ?? transition.toStateId
  const roleNames = (transition.requiredRoles ?? []).map((r) => r.name)

  return (
    <div className="rounded-lg border border-neutral-200/80 bg-white p-2.5">
      {rowError ? <div className="text-xs text-brand-burgundy mb-2">{rowError}</div> : null}

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium">
              {fromLabel} → {toLabel}
            </div>
            <div className="text-xs text-neutral-500">{roleNames.length ? `Rôles : ${roleNames.join(', ')}` : 'Rôles : —'}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-neutral-400" title={transition.id}>Réf. {transition.id.slice(0, 8)}</span>
            {canDelete ? (
              <Button
                variant="danger"
                disabled={del.isPending}
                onClick={() => {
                  if (!confirm('Supprimer cette transition ?')) return
                  del.mutate()
                }}
              >
                Supprimer
              </Button>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 items-end">
          <div>
            <div className="text-xs text-neutral-500 mb-1">De</div>
            <Select value={fromStateId} onChange={(e) => setFromStateId(e.target.value)}>
              {states.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <div className="text-xs text-neutral-500 mb-1">Vers</div>
            <Select value={toStateId} onChange={(e) => setToStateId(e.target.value)}>
              {states.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="lg:col-span-2">
            <div className="text-xs text-neutral-500 mb-1">Rôles requis (facultatif)</div>
            <Input value={roleIds} onChange={(e) => setRoleIds(e.target.value)} placeholder="Ex. : id1, id2" />
          </div>
          <div className="lg:col-span-4 flex justify-end">
            <Button variant="primary" disabled={save.isPending} onClick={() => save.mutate()}>
              {save.isPending ? '…' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
