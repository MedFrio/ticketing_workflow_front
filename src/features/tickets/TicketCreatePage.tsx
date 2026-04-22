import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader } from '@/ui/components/Card'
import { Input } from '@/ui/components/Input'
import { Select } from '@/ui/components/Select'
import { Button } from '@/ui/components/Button'
import { asApiErrorMessage } from '@/api/http'
import { createTicket } from '@/api/tickets'
import { listWorkflows } from '@/api/workflows'
import type { ApiPriority } from '@/api/types'

const priorities: ApiPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

export function TicketCreatePage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { data: workflows = [], isLoading: workflowsLoading } = useQuery({ queryKey: ['workflows'], queryFn: listWorkflows })

  const defaultWorkflowId = workflows[0]?.id ?? ''

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<ApiPriority>('MEDIUM')
  const [tagsText, setTagsText] = useState('')
  const [workflowId, setWorkflowId] = useState('')
  const [error, setError] = useState<string | null>(null)

  const tags = useMemo(
    () =>
      tagsText
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    [tagsText],
  )

  const mutation = useMutation({
    mutationFn: () =>
      createTicket({
        title: title.trim() || 'Nouveau ticket',
        description: description.trim(),
        priority,
        tags,
        workflowId: (workflowId || defaultWorkflowId).trim(),
      }),
    onSuccess: async (created) => {
      await qc.invalidateQueries({ queryKey: ['tickets'] })
      navigate(`/tickets/${created.id}`, { replace: true })
    },
    onError: (e) => setError(asApiErrorMessage(e)),
  })

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const wf = (workflowId || defaultWorkflowId).trim()
    if (!wf) {
      setError('Veuillez sélectionner un workflow.')
      return
    }
    mutation.mutate()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xl font-semibold text-brand-black">Créer un ticket</div>
          <div className="text-xs text-neutral-500 mt-0.5">Nouveau ticket</div>
        </div>
        <Link to="/tickets" className="text-sm underline text-brand-burgundy hover:text-brand-gold">
          Retour
        </Link>
      </div>

      {error ? (
        <div className="rounded-lg border border-brand-burgundy/30 bg-brand-burgundyMuted px-3 py-2 text-sm text-brand-burgundy">{error}</div>
      ) : null}

      <Card>
        <CardHeader title="Informations" subtitle="Choisir un workflow pour ce ticket" />
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-neutral-500 mb-1">Titre</div>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre" />
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
                placeholder="Décrire le problème ou la demande"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-neutral-500 mb-1">Workflow</div>
                <Select
                  value={workflowId || defaultWorkflowId}
                  onChange={(e) => setWorkflowId(e.target.value)}
                  disabled={workflowsLoading}
                >
                  {workflows.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </Select>
                {workflows.length === 0 ? (
                  <div className="text-xs text-neutral-500 mt-1">
                    Aucun workflow trouvé — créez-en un dans l’onglet Workflow.
                  </div>
                ) : null}
              </div>
              <div>
                <div className="text-xs text-neutral-500 mb-1">Tags (séparés par virgule)</div>
                <Input value={tagsText} onChange={(e) => setTagsText(e.target.value)} placeholder="bug,front,urgent" />
              </div>
            </div>

            <Button disabled={mutation.isPending || workflows.length === 0}>{mutation.isPending ? 'Création…' : 'Créer'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
