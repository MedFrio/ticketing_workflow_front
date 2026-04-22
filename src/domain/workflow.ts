import type { WorkflowDefinition, WorkflowState } from './types'

export function defaultWorkflow(): WorkflowDefinition {
  return {
    states: [
      { key: 'OPEN', label: 'Open', type: 'OPEN' },
      { key: 'IN_PROGRESS', label: 'In progress', type: 'IN_PROGRESS' },
      { key: 'WAITING', label: 'Waiting', type: 'IN_PROGRESS' },
      { key: 'DONE', label: 'Done', type: 'DONE' },
    ],
    transitions: [
      { from: 'OPEN', to: 'IN_PROGRESS', label: 'Start', requiredRoles: ['AGENT'] },
      { from: 'IN_PROGRESS', to: 'WAITING', label: 'Wait', requiredRoles: ['AGENT'] },
      { from: 'WAITING', to: 'IN_PROGRESS', label: 'Resume', requiredRoles: ['AGENT'] },
      { from: 'IN_PROGRESS', to: 'DONE', label: 'Resolve', requiredRoles: ['AGENT'] },
      { from: 'OPEN', to: 'DONE', label: 'Quick resolve', requiredRoles: ['AGENT'] },
    ],
    initialStateKey: 'OPEN',
    doneStateKeys: ['DONE'],
  }
}

export function stateByKey(workflow: WorkflowDefinition, key: string): WorkflowState | undefined {
  return workflow.states.find((s) => s.key === key)
}

export function allowedTransitions(workflow: WorkflowDefinition, fromKey: string) {
  return workflow.transitions.filter((t) => t.from === fromKey)
}
