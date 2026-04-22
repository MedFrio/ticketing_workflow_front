import { nanoid } from 'nanoid'
import type { StoreState, TicketEvent, TicketPriority, WorkflowDefinition } from '@/domain/types'
import { defaultWorkflow } from '@/domain/workflow'
import { loadState, saveState } from './storage'

function nowIso() {
  return new Date().toISOString()
}

function initialState(): StoreState {
  return {
    workflow: defaultWorkflow(),
    users: [
      { id: 'u1', displayName: 'Alex Martin', roles: ['AGENT'] },
      { id: 'u2', displayName: 'Samira El Fassi', roles: ['AGENT'] },
      { id: 'u3', displayName: 'Nicolas Dubois', roles: ['REQUESTER'] },
    ],
    events: [],
  }
}

let state: StoreState = loadState() ?? initialState()

function commit(next: StoreState) {
  state = next
  saveState(state)
  window.dispatchEvent(new CustomEvent('store:changed'))
}

export function getState(): StoreState {
  return state
}

export function subscribe(listener: () => void) {
  const handler = () => listener()
  window.addEventListener('store:changed', handler)
  return () => window.removeEventListener('store:changed', handler)
}

export function resetState() {
  commit(initialState())
}

export function setWorkflow(workflow: WorkflowDefinition) {
  commit({ ...state, workflow })
}

export function appendEvent(event: TicketEvent) {
  commit({ ...state, events: [...state.events, event] })
}

export function createTicket(input: {
  title: string
  description: string
  priority: TicketPriority
  tags: string[]
  createdBy: string
}) {
  const ticketId = nanoid()
  const event: TicketEvent = {
    id: nanoid(),
    ticketId,
    type: 'TICKET_CREATED',
    at: nowIso(),
    payload: input,
  }
  appendEvent(event)
  return ticketId
}

export function editTicket(ticketId: string, patch: Partial<{ title: string; description: string; priority: TicketPriority; tags: string[] }>) {
  const event: TicketEvent = {
    id: nanoid(),
    ticketId,
    type: 'TICKET_EDITED',
    at: nowIso(),
    payload: patch,
  }
  appendEvent(event)
}

export function assignTicket(ticketId: string, assigneeId: string | null) {
  const event: TicketEvent = {
    id: nanoid(),
    ticketId,
    type: 'TICKET_ASSIGNED',
    at: nowIso(),
    payload: { assigneeId },
  }
  appendEvent(event)
}

export function transitionTicket(ticketId: string, from: string, to: string, by: string) {
  const event: TicketEvent = {
    id: nanoid(),
    ticketId,
    type: 'TICKET_TRANSITIONED',
    at: nowIso(),
    payload: { from, to, by },
  }
  appendEvent(event)
}

export function addComment(ticketId: string, by: string, message: string) {
  const event: TicketEvent = {
    id: nanoid(),
    ticketId,
    type: 'TICKET_COMMENTED',
    at: nowIso(),
    payload: { by, message },
  }
  appendEvent(event)
}
