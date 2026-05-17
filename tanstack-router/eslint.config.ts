import tsPlugin from "@typescript-eslint/eslint-plugin"
import tsParser from "@typescript-eslint/parser"
import checkFilePlugin from "eslint-plugin-check-file"
import nPlugin from "eslint-plugin-n"

const eslintConfig = [
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      "scripts/**",
      "**/__tests__/**",
      "src/routeTree.gen.ts",
    ],
  },
  {
    files: ["src/**/*.{ts,tsx}", "!src/**/__tests__/**"],
    plugins: {
      "check-file": checkFilePlugin,
      n: nPlugin,
      "@typescript-eslint": tsPlugin,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,

      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],

      "prefer-arrow-callback": "error",
      "prefer-template": "error",
      quotes: [
        "error",
        "double",
        { avoidEscape: true, allowTemplateLiterals: true },
      ],
      "n/no-process-env": "error",

      "check-file/filename-naming-convention": [
        "error",
        {
          "**/*.ts": "KEBAB_CASE",
          "**/*.tsx": "KEBAB_CASE",
        },
        {
          ignoreMiddleExtensions: true,
        },
      ],

      "check-file/folder-naming-convention": [
        "error",
        {
          "src/**": "KEBAB_CASE",
        },
      ],
    },
  },
  {
    files: ["src/routes/**/*.{ts,tsx}"],
    rules: {
      "check-file/filename-naming-convention": "off",
      "check-file/folder-naming-convention": "off",
    },
  },
]

export default eslintConfig
