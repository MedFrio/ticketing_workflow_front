import type { StoreState } from '@/domain/types'

const KEY = 'ticketing_workflow_front_state_v1'

export function loadState(): StoreState | null {
  const raw = localStorage.getItem(KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as StoreState
  } catch {
    return null
  }
}

export function saveState(state: StoreState) {
  localStorage.setItem(KEY, JSON.stringify(state))
}

export function clearState() {
  localStorage.removeItem(KEY)
}
