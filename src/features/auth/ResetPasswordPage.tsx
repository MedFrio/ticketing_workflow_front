import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Input } from '@/ui/components/Input'
import { Button } from '@/ui/components/Button'
import { AuthShell } from './AuthShell'
import { resetPassword } from '@/api/auth'
import { asApiErrorMessage } from '@/api/http'

export function ResetPasswordPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = (location.state as { email?: string; token?: string }) ?? {}
  const [email, setEmail] = useState(state.email ?? '')
  const [token, setToken] = useState(state.token ?? '')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (newPassword !== confirmPassword) {
      setError('Les deux mots de passe ne correspondent pas.')
      return
    }
    if (newPassword.length < 6) {
      setError('Le mot de passe doit faire au moins 6 caractères.')
      return
    }
    setLoading(true)
    try {
      await resetPassword({ email: email.trim(), token: token.trim(), newPassword })
      navigate('/login', { replace: true, state: { message: 'Mot de passe réinitialisé. Vous pouvez vous connecter.' } })
    } catch (e) {
      setError(asApiErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Réinitialiser le mot de passe"
      subtitle="Indiquez votre email, le code reçu et le nouveau mot de passe"
      footer={
        <>
          <Link to="/login" className="underline">
            Retour à la connexion
          </Link>
        </>
      }
    >
      {error ? (
        <div className="rounded-lg border border-brand-burgundy/30 bg-brand-burgundyMuted px-3 py-2 text-sm text-brand-burgundy">
          {error}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <div className="text-xs text-neutral-500 mb-1">Email</div>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@exemple.com"
          />
        </div>
        <div>
          <div className="text-xs text-neutral-500 mb-1">Code de réinitialisation</div>
          <Input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Collez le code reçu par email"
          />
        </div>
        <div>
          <div className="text-xs text-neutral-500 mb-1">Nouveau mot de passe</div>
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <div>
          <div className="text-xs text-neutral-500 mb-1">Confirmer le mot de passe</div>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Réinitialisation…' : 'Réinitialiser le mot de passe'}
        </Button>
      </form>
    </AuthShell>
  )
}
