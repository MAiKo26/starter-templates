import { type ReactNode, createContext, useContext } from "react"

import { useHealthQuery } from "@/hooks/use-health-query"

interface AuthContextValue {
  status: ReturnType<typeof useHealthQuery>["data"] | undefined
  isLoading: boolean
  isHealthy: boolean
  error: Error | null
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { data, isLoading, error } = useHealthQuery()

  const value: AuthContextValue = {
    status: data,
    isLoading,
    isHealthy: data?.status === "ok",
    error,
  }

  return <AuthContext value={value}>{children}</AuthContext>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
