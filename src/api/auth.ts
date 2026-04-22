import { api } from './http'
import type { ApiUser } from './types'

export type LoginRequest = { email: string; password: string }
export type RegisterRequest = { email: string; password: string; name?: string }

export type AuthResponse = {
  user: ApiUser
  access_token: string
}

export async function register(dto: RegisterRequest) {
  const res = await api.post<AuthResponse>('/auth/register', dto)
  return res.data
}

export async function login(dto: LoginRequest) {
  const res = await api.post<AuthResponse>('/auth/login', dto)
  return res.data
}

export async function me() {
  const res = await api.get<ApiUser>('/auth/me')
  return res.data
}

export async function logout() {
  const res = await api.post<{ message: string }>('/auth/logout')
  return res.data
}

export type ApiUserListItem = {
  id: string
  email: string
  name: string | null
}

export async function listUsers() {
  const res = await api.get<ApiUserListItem[]>('/auth/users')
  return res.data
}

export async function deleteMe() {
  await api.delete<{ message?: string }>('/auth/me')
}

export async function updateProfile(body: { name: string }) {
  const res = await api.patch<ApiUser>('/auth/me', body)
  return res.data
}

export async function changePassword(body: { currentPassword: string; newPassword: string }) {
  await api.patch<{ message?: string }>('/auth/me', body)
}

export type ForgotPasswordResponse = { resetToken?: string }
export async function forgotPassword(email: string) {
  const res = await api.post<ForgotPasswordResponse>('/auth/forgot-password', { email })
  return res.data
}

export async function resetPassword(body: { email: string; token: string; newPassword: string }) {
  await api.post<{ message?: string }>('/auth/reset-password', body)
}
