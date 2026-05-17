import { HomePageSkeleton } from "@/components/home-page-skeleton"
import { useHealthQuery } from "@/hooks/use-health-query"

export function HomePage() {
  const { data, isLoading: loading, error } = useHealthQuery()

  if (loading) return <HomePageSkeleton />

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <div className="border-destructive/50 bg-destructive/10 rounded-lg border p-6">
          <h2 className="text-destructive text-xl font-semibold">
            Failed to load
          </h2>
          <p className="text-muted-foreground mt-2">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto space-y-4 p-8">
      <h1 className="text-3xl font-bold">
        System Status: {data?.status ?? "unknown"}
      </h1>
      <p className="text-muted-foreground">
        Database: {data?.services.database ?? "unknown"} | Storage:{" "}
        {data?.services.storage ?? "unknown"}
      </p>
    </div>
  )
}
