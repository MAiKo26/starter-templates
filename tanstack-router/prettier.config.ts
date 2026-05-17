import type { Config } from "prettier"

const config: Config = {
  semi: false,
  singleQuote: false,
  trailingComma: "all",
  plugins: [
    "@trivago/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss",
  ],
  importOrder: [
    "^react$",
    "^react-dom$",
    "^@tanstack/.*$",
    "^@?\\w",
    "^@/(.*)$",
    "^[./]",
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
}

export default config
