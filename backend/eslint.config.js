import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import * as tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
    {
        ignores: ["dist/", "node_modules/", "public/", "prisma/", "eslint.config.js"], // 忽略資料夾
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    importPlugin.flatConfigs.recommended,
    prettierConfig,
    {
        // plugins: {
        //   import: importPlugin,
        //   prettier: prettierPlugin,
        // },
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
            },
        },
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
];