import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '@/ui/components/Card'
import { Input } from '@/ui/components/Input'
import { Button } from '@/ui/components/Button'
import { asApiErrorMessage } from '@/api/http'
import { deleteMe, updateProfile, changePassword } from '@/api/auth'
import { useAuth } from '@/auth/AuthContext'
import { useNavigate } from 'react-router-dom'

export function AccountPage() {
  const { user, refreshUser, clearSession } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState(user?.name ?? '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    setName(user?.name ?? '')
  }, [user?.name])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setProfileLoading(true)
    try {
      await updateProfile({ name: name.trim() })
      await refreshUser()
      setSuccess('Profil mis à jour.')
    } catch (e) {
      setError(asApiErrorMessage(e))
    } finally {
      setProfileLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    if (newPassword !== confirmPassword) {
      setError('Les deux mots de passe ne correspondent pas.')
      return
    }
    if (newPassword.length < 6) {
      setError('Le nouveau mot de passe doit faire au moins 6 caractères.')
      return
    }
    setPasswordLoading(true)
    try {
      await changePassword({ currentPassword, newPassword })
      setSuccess('Mot de passe modifié.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (e) {
      setError(asApiErrorMessage(e))
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Supprimer définitivement votre compte ? Cette action est irréversible.')) return
    setError(null)
    setDeleteLoading(true)
    try {
      await deleteMe()
      clearSession()
      navigate('/login', { replace: true })
    } catch (e) {
      setError(asApiErrorMessage(e))
      setDeleteLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xl font-semibold text-brand-black">Mon compte</div>
        <div className="text-xs text-neutral-500 mt-0.5">Profil, mot de passe et suppression</div>
      </div>

      {error ? (
        <div className="rounded-lg border border-brand-burgundy/30 bg-brand-burgundyMuted px-3 py-2 text-sm text-brand-burgundy">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          {success}
        </div>
      ) : null}

      <Card>
        <CardHeader title="Profil" subtitle="Modifier votre nom" />
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-3">
            <div>
              <div className="text-xs text-neutral-500 mb-1">Nom</div>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Votre nom" />
            </div>
            <div className="text-xs text-neutral-500">Email : {user?.email ?? '—'}</div>
            <Button type="submit" disabled={profileLoading}>
              {profileLoading ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Mot de passe" subtitle="Changer votre mot de passe" />
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-3">
            <div>
              <div className="text-xs text-neutral-500 mb-1">Mot de passe actuel</div>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
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
              <div className="text-xs text-neutral-500 mb-1">Confirmer le nouveau mot de passe</div>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" disabled={passwordLoading}>
              {passwordLoading ? 'Modification…' : 'Changer le mot de passe'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Supprimer le compte" subtitle="Action irréversible" />
        <CardContent>
          <p className="text-sm text-neutral-600 mb-3">
            La suppression de votre compte effacera toutes vos données. Vous ne pourrez plus vous connecter avec cet email.
          </p>
          <Button variant="danger" disabled={deleteLoading} onClick={handleDeleteAccount}>
            {deleteLoading ? 'Suppression…' : 'Supprimer mon compte'}
          </Button>
        </CardContent>
      </Card>

      <div>
        <Link to="/dashboard" className="text-sm underline text-brand-burgundy hover:text-brand-gold">
          Retour au tableau de bord
        </Link>
      </div>
    </div>
  )
}
