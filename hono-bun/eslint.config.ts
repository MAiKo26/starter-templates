import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import checkFilePlugin from "eslint-plugin-check-file";
import nPlugin from "eslint-plugin-n";

const eslintConfig = [
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "__tests__/**",
      "src/db/migrations/**",
    ],
  },
  {
    files: ["src/**/*.ts"],
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
];

export default eslintConfig;
