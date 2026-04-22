import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Input } from '@/ui/components/Input'
import { Button } from '@/ui/components/Button'
import { useAuth } from '@/auth/AuthContext'
import { AuthShell } from './AuthShell'

export function RegisterPage() {
  const { register, lastError } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await register(email.trim(), password, name.trim() || undefined)
      navigate('/dashboard', { replace: true })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Inscription"
      subtitle="Création de compte"
      footer={
        <>
          Déjà un compte ?{' '}
          <Link to="/login" className="underline">
            Se connecter
          </Link>
        </>
      }
    >
      {lastError ? (
        <div className="rounded-lg border border-brand-burgundy/30 bg-brand-burgundyMuted px-3 py-2 text-sm text-brand-burgundy">{lastError}</div>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <div className="text-xs text-neutral-500 mb-1">Nom (facultatif)</div>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom" />
        </div>
        <div>
          <div className="text-xs text-neutral-500 mb-1">Email</div>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemple.com" />
        </div>
        <div>
          <div className="text-xs text-neutral-500 mb-1">Mot de passe</div>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        <Button disabled={loading}>{loading ? 'Création…' : 'Créer le compte'}</Button>
      </form>
    </AuthShell>
  )
}
