import { api } from './http'
import type { ApiTransition, ApiWorkflow, ApiState } from './types'

export type CreateWorkflowDto = { name: string; description?: string }
export type UpdateWorkflowDto = Partial<CreateWorkflowDto>

export type CreateStateDto = { name: string; order?: number }
export type UpdateStateDto = Partial<CreateStateDto>

export type CreateTransitionDto = {
  fromStateId: string
  toStateId: string
  requiredRoleIds?: string[]
}
export type UpdateTransitionDto = Partial<CreateTransitionDto>

export async function listWorkflows() {
  const res = await api.get<ApiWorkflow[]>('/workflows')
  return res.data
}

export async function getWorkflow(id: string) {
  const res = await api.get<ApiWorkflow>(`/workflows/${id}`)
  return res.data
}

export async function createWorkflow(dto: CreateWorkflowDto) {
  const res = await api.post<ApiWorkflow>('/workflows', dto)
  return res.data
}

export async function updateWorkflow(id: string, dto: UpdateWorkflowDto) {
  const res = await api.patch<ApiWorkflow>(`/workflows/${id}`, dto)
  return res.data
}

export async function deleteWorkflow(id: string) {
  const res = await api.delete<{ message: string }>(`/workflows/${id}`)
  return res.data
}

export async function createState(workflowId: string, dto: CreateStateDto) {
  const res = await api.post<ApiState>(`/workflows/${workflowId}/states`, dto)
  return res.data
}

export async function updateState(workflowId: string, stateId: string, dto: UpdateStateDto) {
  const res = await api.patch<ApiState>(`/workflows/${workflowId}/states/${stateId}`, dto)
  return res.data
}

export async function deleteState(workflowId: string, stateId: string) {
  const res = await api.delete<{ message: string }>(`/workflows/${workflowId}/states/${stateId}`)
  return res.data
}

export async function createTransition(workflowId: string, dto: CreateTransitionDto) {
  const res = await api.post<ApiTransition>(`/workflows/${workflowId}/transitions`, dto)
  return res.data
}

export async function updateTransition(workflowId: string, transitionId: string, dto: UpdateTransitionDto) {
  const res = await api.patch<ApiTransition>(`/workflows/${workflowId}/transitions/${transitionId}`, dto)
  return res.data
}

export async function deleteTransition(workflowId: string, transitionId: string) {
  const res = await api.delete<{ message: string }>(`/workflows/${workflowId}/transitions/${transitionId}`)
  return res.data
}
