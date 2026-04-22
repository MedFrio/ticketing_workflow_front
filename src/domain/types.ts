export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type TicketStatus = string

export type WorkflowState = {
  key: string
  label: string
  type: 'OPEN' | 'IN_PROGRESS' | 'DONE'
}

export type WorkflowTransition = {
  from: string
  to: string
  label: string
  requiredRoles: string[]
}

export type WorkflowDefinition = {
  states: WorkflowState[]
  transitions: WorkflowTransition[]
  initialStateKey: string
  doneStateKeys: string[]
}

export type TicketProjection = {
  id: string
  title: string
  description: string
  priority: TicketPriority
  tags: string[]
  assigneeId?: string | null
  status: TicketStatus
  createdAt: string
  updatedAt: string
  closedAt?: string | null
}

export type User = {
  id: string
  displayName: string
  roles: string[]
}

export type TicketEvent =
  | { id: string; ticketId: string; type: 'TICKET_CREATED'; at: string; payload: { title: string; description: string; priority: TicketPriority; tags: string[]; createdBy: string } }
  | { id: string; ticketId: string; type: 'TICKET_EDITED'; at: string; payload: { title?: string; description?: string; priority?: TicketPriority; tags?: string[] } }
  | { id: string; ticketId: string; type: 'TICKET_ASSIGNED'; at: string; payload: { assigneeId: string | null } }
  | { id: string; ticketId: string; type: 'TICKET_TRANSITIONED'; at: string; payload: { from: string; to: string; by: string } }
  | { id: string; ticketId: string; type: 'TICKET_COMMENTED'; at: string; payload: { by: string; message: string } }

export type StoreState = {
  workflow: WorkflowDefinition
  users: User[]
  events: TicketEvent[]
}
