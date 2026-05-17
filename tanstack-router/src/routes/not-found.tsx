import { createFileRoute } from "@tanstack/react-router"

import { NotFoundPage } from "@/components/not-found-page"

export const Route = createFileRoute("/not-found")({
  component: NotFound,
})

function NotFound() {
  return <NotFoundPage />
}
