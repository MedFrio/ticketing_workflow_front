import { api } from './http'
import type { ApiPriority, ApiTicket, ApiTicketEvent } from './types'

export type CreateTicketDto = {
  title: string
  description: string
  priority?: ApiPriority
  tags?: string[]
  workflowId: string
}

export type UpdateTicketDto = Partial<CreateTicketDto>

export type AssignTicketDto = {
  assigneeId: string | null
}

export type ApplyTransitionDto = {
  transitionId: string
}

export async function listTickets() {
  const res = await api.get<ApiTicket[]>('/tickets')
  return res.data
}

export async function getTicket(id: string) {
  const res = await api.get<ApiTicket>(`/tickets/${id}`)
  return res.data
}

export async function getTicketEvents(id: string) {
  const res = await api.get<ApiTicketEvent[]>(`/tickets/${id}/events`)
  return res.data
}

export async function createTicket(dto: CreateTicketDto) {
  const res = await api.post<ApiTicket>('/tickets', dto)
  return res.data
}

export async function updateTicket(id: string, dto: UpdateTicketDto) {
  const res = await api.patch<ApiTicket>(`/tickets/${id}`, dto)
  return res.data
}

export async function assignTicket(id: string, assigneeId: string | null) {
  const res = await api.patch<ApiTicket>(`/tickets/${id}/assign`, { assigneeId } satisfies AssignTicketDto)
  return res.data
}

export async function applyTransition(id: string, transitionId: string) {
  const res = await api.post<ApiTicket>(`/tickets/${id}/transition`, { transitionId } satisfies ApplyTransitionDto)
  return res.data
}

export async function deleteTicket(id: string) {
  const res = await api.delete<{ message: string }>(`/tickets/${id}`)
  return res.data
}
