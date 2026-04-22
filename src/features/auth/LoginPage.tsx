import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Input } from '@/ui/components/Input'
import { Button } from '@/ui/components/Button'
import { useAuth } from '@/auth/AuthContext'
import { AuthShell } from './AuthShell'

export function LoginPage() {
  const { login, lastError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation() as any
  const from = location?.state?.from ?? '/dashboard'
  const successMessage = (location?.state as { message?: string })?.message

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email.trim(), password)
      navigate(from, { replace: true })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Connexion"
      subtitle="Connexion à votre compte"
      footer={
        <>
          Pas de compte ?{' '}
          <Link to="/register" className="underline">
            Créer un compte
          </Link>
        </>
      }
    >
      {lastError ? (
        <div className="rounded-lg border border-brand-burgundy/30 bg-brand-burgundyMuted px-3 py-2 text-sm text-brand-burgundy">{lastError}</div>
      ) : null}
      {successMessage ? (
        <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">{successMessage}</div>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <div className="text-xs text-neutral-500 mb-1">Email</div>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemple.com" />
        </div>
        <div>
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs text-neutral-500 mb-1">Mot de passe</div>
            <Link to="/forgot-password" className="text-xs text-brand-burgundy hover:text-brand-gold">
              Mot de passe oublié ?
            </Link>
          </div>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        <Button disabled={loading}>
          {loading ? 'Connexion…' : 'Se connecter'}
        </Button>
      </form>
    </AuthShell>
  )
}
