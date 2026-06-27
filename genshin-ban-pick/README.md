# genshin-ban-pick

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

### Regenerate the image manifest

`src/modules/shared/infrastructure/imageRegistry.manifest.ts` is generated from the files under `src/assets/images/{profile,wish,element,weapon}` and gives `imageRegistry.ts` compile-time coverage checks (a missing element/weapon/character image becomes a type error instead of a silent `undefined`). Run this after adding or removing any of those image assets, then commit the regenerated manifest:

```sh
npm run gen:images
```
