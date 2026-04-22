import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Input } from '@/ui/components/Input'
import { Button } from '@/ui/components/Button'
import { AuthShell } from './AuthShell'
import { forgotPassword } from '@/api/auth'
import { asApiErrorMessage } from '@/api/http'

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [resetToken, setResetToken] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await forgotPassword(email.trim())
      setSent(true)
      if (res.resetToken) {
        setResetToken(res.resetToken)
      }
    } catch (e) {
      setError(asApiErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  function goToReset() {
    navigate('/reset-password', { state: { email: email.trim(), token: resetToken ?? undefined } })
  }

  return (
    <AuthShell
      title="Mot de passe oublié"
      subtitle="Indiquez votre email pour recevoir un lien de réinitialisation"
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

      {!sent ? (
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
          <Button type="submit" disabled={loading}>
            {loading ? 'Envoi…' : 'Envoyer'}
          </Button>
        </form>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-neutral-600">
            Un email de réinitialisation a été envoyé à <strong>{email}</strong>.
            {resetToken
              ? ' Vous pouvez aussi utiliser le code ci-dessous sur la page de réinitialisation.'
              : ''}
          </p>
          {resetToken ? (
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-2 font-mono text-xs break-all">
              {resetToken}
            </div>
          ) : null}
          <Button type="button" onClick={goToReset}>
            Aller à la page de réinitialisation
          </Button>
        </div>
      )}
    </AuthShell>
  )
}
