import css from "@eslint/css";
import eslint from "@eslint/js";
import vitest from "@vitest/eslint-plugin";
import compat from "eslint-plugin-compat";
import importPlugin from "eslint-plugin-import-x";
import perfectionistPlugin from "eslint-plugin-perfectionist";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
  { ignores: ["*.config.{js,mjs,ts}"] },
  {
    files: ["**/*.{js,mjs,ts}"],
    extends: [
      eslint.configs.recommended,
      compat.configs["flat/recommended"],
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      importPlugin.flatConfigs.recommended,
      importPlugin.flatConfigs.typescript,
      perfectionistPlugin.configs["recommended-natural"]
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { fixStyle: "inline-type-imports" }
      ],
      "@typescript-eslint/no-import-type-side-effects": "error",
      "@typescript-eslint/restrict-template-expressions": "error",
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "memberLike",
          modifiers: ["private"],
          format: [],
          leadingUnderscore: "require"
        },
        {
          selector: "memberLike",
          modifiers: ["protected"],
          format: [],
          leadingUnderscore: "require"
        }
      ]
    },
    settings: {
      "import/resolver": {
        typescript: true
      }
    }
  },
  {
    files: ["src/**/*.test.ts"],
    plugins: {
      vitest
    },
    rules: {
      ...vitest.configs.recommended.rules,
      "compat/compat": "off"
    }
  },
  {
    files: ["style/**/*.scss"],
    language: "css/css",
    plugins: {
      css
    },
    extends: ["css/recommended"]
  }
]);
