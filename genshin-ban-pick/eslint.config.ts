import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import { globalIgnores } from 'eslint/config'
import importPlugin from "eslint-plugin-import";
import pluginOxlint from 'eslint-plugin-oxlint'
import pluginVue from 'eslint-plugin-vue'

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,
  ...pluginOxlint.configs['flat/recommended'],
  importPlugin.flatConfigs.recommended,
  skipFormatting,
  {
        settings: {
            "import/resolver": {
                node: {
                    extensions: [".js", ".ts"],
                },
            },
        },
        rules: {
            // ✅ import 排序
            "import/order": [
                "warn",
                {
                    groups: [
                        "builtin",
                        "external",
                        "internal",
                        ["parent", "sibling", "index"],
                        "object",
                        "type",
                    ],
                    "newlines-between": "always",
                    alphabetize: { order: "asc", caseInsensitive: true },
                },
            ],

            // ✅ prettier 整合
            //   "prettier/prettier": [
            //     "warn",
            //     {
            //       endOfLine: "auto",
            //       semi: true,
            //       singleQuote: true,
            //       tabWidth: 2,
            //       printWidth: 100,
            //       trailingComma: "es5",
            //     },
            //   ],

            // ⚙️ 其他實用規則
            "@typescript-eslint/no-unused-vars": ["warn"],
            "no-console": "off",
        },
    },
)
