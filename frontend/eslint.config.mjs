import eslint from "@eslint/js";
import compat from "eslint-plugin-compat";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import-x";
import perfectionistPlugin from "eslint-plugin-perfectionist";
import vitest from "@vitest/eslint-plugin";

export default [
  { ignores: ["*.config.{js,mjs,ts}"] },
  eslint.configs.recommended,
  compat.configs["flat/recommended"],
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  perfectionistPlugin.configs["recommended-natural"],
  {
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
  }
];
