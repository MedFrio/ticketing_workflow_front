import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '@/ui/components/Card'

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
  footer: React.ReactNode
}) {
  return (
    <div className="min-h-screen grid place-items-center bg-neutral-100 p-6">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 font-semibold text-brand-black">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gold text-brand-black">TW</span>
            <span>Ticketing Workflow</span>
          </Link>
        </div>

        <Card>
          <CardHeader title={title} subtitle={subtitle} />
          <CardContent className="space-y-4">{children}</CardContent>
        </Card>

        <div className="text-center text-sm text-neutral-600">{footer}</div>
      </div>
    </div>
  )
}
