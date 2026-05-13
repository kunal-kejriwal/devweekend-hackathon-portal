import { devClient, sdkClient } from './client'

// ─── Developer (admin) auth ───────────────────────────────────────────────────
export const devLogin = (username, password) =>
  devClient.post('/accounts/v1/api/auth/token/', { username, password })

export const devMe = () =>
  devClient.get('/accounts/v1/api/auth/me/')

// ─── SDK (AppUser) auth ───────────────────────────────────────────────────────
export const sdkSignup = (data) =>
  sdkClient.post('/api/v1/sdk/auth/signup/', data)

export const sdkLogin = (email, password) =>
  sdkClient.post('/api/v1/sdk/auth/login/', { email, password })

export const sdkVerifyCode = (email, code) =>
  sdkClient.post('/api/v1/sdk/auth/verify-code/', { email, code })

export const sdkResendVerification = (email) =>
  sdkClient.post('/api/v1/sdk/auth/resend-verification/', { email })

export const sdkForgotPassword = (email) =>
  sdkClient.post('/api/v1/sdk/auth/forgot-password/', { email })

export const sdkResetPassword = (token, password) =>
  sdkClient.post('/api/v1/sdk/auth/reset-password/', { token, password })

export const sdkMe = () =>
  sdkClient.get('/api/v1/sdk/auth/me/')

export const sdkUpdateMe = (data) =>
  sdkClient.patch('/api/v1/sdk/auth/me/', data)
