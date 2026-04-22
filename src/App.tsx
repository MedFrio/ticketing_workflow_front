import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/ui/layout/AppLayout'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { TicketsListPage } from '@/features/tickets/TicketsListPage'
import { TicketDetailPage } from '@/features/tickets/TicketDetailPage'
import { KanbanPage } from '@/features/kanban/KanbanPage'
import { WorkflowPage } from '@/features/workflow/WorkflowPage'
import { SettingsPage } from '@/features/settings/SettingsPage'
import { AccountPage } from '@/features/account/AccountPage'
import { ForgotPasswordPage } from './features/auth/ForgotPasswordPage'
import { LoginPage } from './features/auth/LoginPage'
import { RegisterPage } from './features/auth/RegisterPage'
import { ResetPasswordPage } from './features/auth/ResetPasswordPage'
import { RequireAuth } from '@/auth/RequireAuth'
import { TicketCreatePage } from '@/features/tickets/TicketCreatePage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/tickets" element={<TicketsListPage />} />
        <Route path="/tickets/new" element={<TicketCreatePage />} />
        <Route path="/tickets/:id" element={<TicketDetailPage />} />
        <Route path="/kanban" element={<KanbanPage />} />
        <Route path="/workflow" element={<WorkflowPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/account" element={<AccountPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
