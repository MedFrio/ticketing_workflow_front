import { clearState, loadState } from './storage'
import { createTicket, transitionTicket, assignTicket, addComment, getState } from './store'

export function seedIfEmpty() {
  const existing = loadState()
  if (existing && existing.events.length > 0) return

  clearState()

  const requester = 'u3'
  const agent = 'u1'

  const t1 = createTicket({
    title: 'Erreur 500 sur la page de connexion',
    description: 'Plusieurs utilisateurs signalent une erreur 500 au login après le déploiement.',
    priority: 'CRITICAL',
    tags: ['auth', 'prod'],
    createdBy: requester,
  })
  assignTicket(t1, agent)
  transitionTicket(t1, 'OPEN', 'IN_PROGRESS', agent)
  addComment(t1, agent, 'Je reproduis le problème et j’inspecte les logs.')
  transitionTicket(t1, 'IN_PROGRESS', 'DONE', agent)

  const t2 = createTicket({
    title: 'Amélioration: ajout filtre par tags',
    description: 'Ajouter un filtre multi-tags sur la liste des tickets.',
    priority: 'MEDIUM',
    tags: ['ux', 'backlog'],
    createdBy: requester,
  })
  assignTicket(t2, 'u2')
  transitionTicket(t2, 'OPEN', 'IN_PROGRESS', 'u2')
  addComment(t2, 'u2', 'Je propose une première version sur le front (mock).')

  const t3 = createTicket({
    title: 'Bug: statut Kanban incorrect après refresh',
    description: 'Après un refresh, certaines cartes ne sont plus dans la bonne colonne.',
    priority: 'HIGH',
    tags: ['kanban', 'state'],
    createdBy: requester,
  })
  assignTicket(t3, agent)

  // Persist workflow snapshot by touching store
  void getState()
}
