import { Card, CardContent, CardHeader } from '@/ui/components/Card'
import { Badge } from '@/ui/components/Badge'
import { Button } from '@/ui/components/Button'
import { useAuth } from '@/auth/AuthContext'

export function SettingsPage() {
  const { user, clearSession } = useAuth()
  const baseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? ''

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xl font-semibold text-brand-black">Settings</div>
        <div className="text-xs text-neutral-500 mt-0.5">Configuration front</div>
      </div>

      <Card>
        <CardHeader title="Connexion" subtitle="Adresse du serveur" />
        <CardContent className="space-y-3">
          <div className="text-sm text-neutral-600">
            <div>
              <Badge>URL du backend</Badge>
            </div>
            <div className="mt-2 rounded-lg border border-neutral-200 bg-white p-2.5 font-mono text-xs break-all">
              {baseUrl || '(vide — proxy en développement)'}
            </div>
          </div>
          <div className="text-xs text-neutral-500">
            En local, laissez vide et démarrez le backend sur le port 3000.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Session" subtitle="Votre session" />
        <CardContent className="space-y-3">
          <div className="text-sm text-neutral-600">Utilisateur: {user?.email ?? '—'}</div>
          <Button
            variant="danger"
            onClick={() => {
              clearSession()
              window.location.href = '/login'
            }}
          >
            Effacer la session (front)
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
