import comments from "@eslint-community/eslint-plugin-eslint-comments/configs";
import css from "@eslint/css";
import eslint from "@eslint/js";
import vitest from "@vitest/eslint-plugin";
import compat from "eslint-plugin-compat";
import importPlugin from "eslint-plugin-import-x";
import jestDom from "eslint-plugin-jest-dom";
import noUnsanitized from "eslint-plugin-no-unsanitized";
import perfectionistPlugin from "eslint-plugin-perfectionist";
import testingLibrary from "eslint-plugin-testing-library";
import unicorn from "eslint-plugin-unicorn";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
  { ignores: ["*.config.{js,mjs,ts}"] },
  {
    files: ["**/*.{js,mjs,ts}"],
    extends: [
      eslint.configs.recommended,
      comments.recommended,
      compat.configs["flat/recommended"],
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      importPlugin.flatConfigs.recommended,
      importPlugin.flatConfigs.typescript,
      noUnsanitized.configs.recommended,
      perfectionistPlugin.configs["recommended-natural"]
    ],
    linterOptions: {
      reportUnusedDisableDirectives: "error"
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    },
    plugins: {
      unicorn
    },
    rules: {
      "@eslint-community/eslint-comments/require-description": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { fixStyle: "inline-type-imports" }
      ],
      "@typescript-eslint/no-import-type-side-effects": "error",
      "unicorn/dom-node-dataset": "error",
      "unicorn/error-message": "error",
      "unicorn/new-for-builtins": "error",
      "unicorn/no-document-cookie": "error",
      "unicorn/no-for-each": "error",
      "unicorn/no-instanceof-builtins": "error",
      "unicorn/no-invalid-remove-event-listener": "error",
      "unicorn/no-return-array-push": "error",
      "unicorn/no-thenable": "error",
      "unicorn/no-unnecessary-fetch-options": "error",
      "unicorn/no-useless-promise-resolve-reject": "error",
      "unicorn/no-useless-spread": "error",
      "unicorn/prefer-add-event-listener": "error",
      "unicorn/prefer-array-find": "error",
      "unicorn/prefer-array-flat-map": "error",
      "unicorn/prefer-array-some": "error",
      "unicorn/prefer-at": "error",
      "unicorn/prefer-direct-iteration": "error",
      "unicorn/prefer-dom-node-append": "error",
      "unicorn/prefer-dom-node-remove": "error",
      "unicorn/prefer-dom-node-replace-children": "error",
      "unicorn/prefer-dom-node-text-content": "error",
      "unicorn/prefer-includes": "error",
      "unicorn/prefer-keyboard-event-key": "error",
      "unicorn/prefer-modern-dom-apis": "error",
      "unicorn/prefer-number-properties": "error",
      "unicorn/prefer-query-selector": "error",
      "unicorn/prefer-string-replace-all": "error",
      "unicorn/prefer-string-starts-ends-with": "error",
      "unicorn/require-css-escape": "error",
      "unicorn/throw-new-error": "error",
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
    extends: [
      jestDom.configs["flat/recommended"],
      testingLibrary.configs["flat/dom"]
    ],
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
