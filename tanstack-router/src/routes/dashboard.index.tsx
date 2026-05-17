import { createFileRoute, redirect } from "@tanstack/react-router"

import { AppLayout } from "@/components/layouts/app-layout"

interface BeforeLoadContext {
  queryClient: {
    fetchQuery: (options: {
      queryKey: string[]
      queryFn: () => Promise<unknown>
    }) => Promise<unknown>
  }
}

export const Route = createFileRoute("/dashboard/")({
  beforeLoad: async ({ context }: { context: BeforeLoadContext }) => {
    try {
      await context.queryClient.fetchQuery({
        queryKey: ["auth", "me"],
        queryFn: async () => {
          const res = await fetch(
            `${import.meta.env.VITE_API_URL}/api/v1/auth/me`,
            {
              credentials: "include",
            },
          )
          if (!res.ok) throw new Error("Unauthorized")
          return res.json()
        },
      })
    } catch {
      throw redirect({
        to: "/not-found",
        search: { reason: "unauthorized" },
      })
    }
  },
  component: Dashboard,
})

function Dashboard() {
  return (
    <AppLayout>
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to your dashboard. Protected route working.
        </p>
      </div>
    </AppLayout>
  )
}
