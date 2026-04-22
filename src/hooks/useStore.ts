import { useEffect, useMemo, useState } from 'react'
import { getState, subscribe } from '@/data/store'

export function useStore() {
  const [v, setV] = useState(0)

  useEffect(() => {
    const unsub = subscribe(() => setV((x) => x + 1))
    return unsub
  }, [])

  return useMemo(() => getState(), [v])
}
