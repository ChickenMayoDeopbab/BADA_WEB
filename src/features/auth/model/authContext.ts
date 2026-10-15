import { createContext } from 'react'

export type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated'
export const AuthContext = createContext<AuthStatus | null>(null)
