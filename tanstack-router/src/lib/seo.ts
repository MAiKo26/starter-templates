import { env } from "@/lib/env"

interface SeoProps {
  title?: string
  description?: string
  image?: string
  url?: string
}

export function getSeoMeta({ title, description, image, url }: SeoProps = {}) {
  const siteTitle = title
    ? `${title} | ${env.VITE_APP_NAME}`
    : env.VITE_APP_NAME

  const meta = {
    title: siteTitle,
    description: description ?? `Welcome to ${env.VITE_APP_NAME}`,
    url: url ?? env.VITE_API_URL,
    image: image ?? "/og-image.png",
  }

  return {
    title: meta.title,
    meta: [
      { name: "description", content: meta.description },
      { property: "og:title", content: meta.title },
      { property: "og:description", content: meta.description },
      { property: "og:image", content: meta.image },
      { property: "og:url", content: meta.url },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: meta.title },
      { name: "twitter:description", content: meta.description },
      { name: "twitter:image", content: meta.image },
    ],
    link: [{ rel: "canonical", href: meta.url }],
  }
}
