import { Outlet } from "@tanstack/react-router"

import { Toaster } from "sonner"

interface AuthLayoutProps {
  children?: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="bg-muted/50 flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">{children ?? <Outlet />}</div>
      <Toaster />
    </div>
  )
}
