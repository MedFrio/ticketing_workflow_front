export type ApiPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type ApiUser = {
  id: string
  email: string
  name?: string | null
  createdAt?: string
  updatedAt?: string
}

export type ApiRole = {
  id: string
  name: string
}

export type ApiState = {
  id: string
  name: string
  order: number
  workflowId: string
}

export type ApiTransition = {
  id: string
  workflowId: string
  fromStateId: string
  toStateId: string
  fromState?: ApiState
  toState?: ApiState
  requiredRoles?: ApiRole[]
}

export type ApiWorkflow = {
  id: string
  name: string
  description?: string | null
  createdAt?: string
  states: ApiState[]
  transitions: ApiTransition[]
}

export type ApiTicket = {
  id: string
  title: string
  description: string
  priority: ApiPriority
  tags: string[]
  workflow: { id: string; name: string; description?: string | null }
  currentState: ApiState | null
  assignee: { id: string; email: string; name?: string | null } | null
  createdAt: string
  updatedAt: string
}

export type ApiTicketEvent = {
  id: string
  type: string
  payload: any
  userId: string | null
  createdAt: string
}
